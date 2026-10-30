const express = require('express');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const { nextDifficulty } = require('../utils/adaptive');
const { selectUnusedQuestion, publicQuestion } = require('../utils/question');

const router = express.Router();

router.post('/start', async (req, res, next) => {
  try {
    const studentId = String(req.body.studentId || 'demo-student');
    const count = Number(req.body.questionCount || 10);
    const targetQuestionCount = Math.max(5, Math.min(10, Number.isFinite(count) ? count : 10));
    const first = await selectUnusedQuestion(Question, 'Medium', []);

    if (!first) {
      return res.status(503).json({ message: 'No questions available. Run npm run seed first.' });
    }

    const attempt = await QuizAttempt.create({
      studentId,
      currentQuestionId: first._id,
      currentDifficulty: first.difficulty,
      targetQuestionCount
    });

    return res.status(201).json({
      attemptId: String(attempt._id),
      question: publicQuestion(first, 1, targetQuestionCount)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:attemptId/answer', async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptionIndex } = req.body;

    if (!mongoose.isValidObjectId(attemptId) || !mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({ message: 'A valid attempt ID and question ID are required.' });
    }

    if (!Number.isInteger(selectedOptionIndex) || selectedOptionIndex < 0 || selectedOptionIndex > 3) {
      return res.status(400).json({ message: 'Choose one of the four answer options.' });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found.' });
    if (attempt.status !== 'in-progress') {
      return res.status(409).json({ message: 'This quiz has already been completed.' });
    }
    if (String(attempt.currentQuestionId) !== String(questionId)) {
      return res.status(409).json({ message: 'This is not the current question for this attempt.' });
    }

    const question = await Question.findById(questionId);
    if (!question || !question.active) {
      return res.status(404).json({ message: 'Question not found or inactive.' });
    }

    const isCorrect = selectedOptionIndex === question.correctOptionIndex;
    attempt.responses.push({
      questionId: question._id,
      questionText: question.questionText,
      topic: question.topic,
      difficulty: question.difficulty,
      selectedOptionIndex,
      correctOptionIndex: question.correctOptionIndex,
      selectedAnswer: question.options[selectedOptionIndex],
      correctAnswer: question.options[question.correctOptionIndex],
      isCorrect,
      explanation: question.explanation
    });

    if (isCorrect) {
      attempt.score += 1;
      attempt.correctStreak += 1;
      attempt.incorrectStreak = 0;
    } else {
      attempt.incorrectStreak += 1;
      attempt.correctStreak = 0;
    }

    attempt.currentDifficulty = nextDifficulty(
      attempt.currentDifficulty,
      attempt.correctStreak,
      attempt.incorrectStreak
    );

    if (attempt.correctStreak >= 2 || attempt.incorrectStreak >= 2) {
      attempt.correctStreak = 0;
      attempt.incorrectStreak = 0;
    }

    let next = null;
    if (attempt.responses.length < attempt.targetQuestionCount) {
      next = await selectUnusedQuestion(
        Question,
        attempt.currentDifficulty,
        attempt.responses.map((answer) => answer.questionId)
      );
    }

    const completed = attempt.responses.length >= attempt.targetQuestionCount || !next;

    if (completed) {
      attempt.status = 'completed';
      attempt.currentQuestionId = null;
      attempt.totalQuestions = attempt.responses.length;
      attempt.accuracy = Math.round((attempt.score / attempt.totalQuestions) * 100);
      attempt.completedAt = new Date();
    } else {
      attempt.currentQuestionId = next._id;
    }

    await attempt.save();

    return res.json({
      feedback: {
        isCorrect,
        correctOptionIndex: question.correctOptionIndex,
        selectedOptionIndex,
        selectedAnswer: question.options[selectedOptionIndex],
        correctAnswer: question.options[question.correctOptionIndex],
        explanation: question.explanation,
        topic: question.topic,
        difficulty: question.difficulty
      },
      completed,
      currentDifficulty: attempt.currentDifficulty,
      progress: { answered: attempt.responses.length, total: attempt.targetQuestionCount },
      nextQuestion: next
        ? publicQuestion(next, attempt.responses.length + 1, attempt.targetQuestionCount)
        : null,
      result: completed ? {
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        accuracy: attempt.accuracy,
        responses: attempt.responses.map((answer) => ({
          questionText: answer.questionText,
          topic: answer.topic,
          isCorrect: answer.isCorrect,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: answer.correctAnswer,
          explanation: answer.explanation
        }))
      } : null
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
