const express = require('express');
const mongoose = require('mongoose');
const QuizAttempt = require('../models/QuizAttempt');
const Question = require('../models/Question');
const LearningAssistantLog = require('../models/LearningAssistantLog');
const { summarizeAttempts } = require('../utils/personalization');
const { generateTutorReply, buildTutorPrompt } = require('../services/learningAssistant');

const router = express.Router();
const MODES = new Set(['explain', 'hint', 'ask']);

router.post('/help', async (req, res) => {
  try {
    const { studentId = 'demo-student', attemptId, questionId, mode, prompt = '' } = req.body || {};

    if (!mongoose.isValidObjectId(attemptId) || !mongoose.isValidObjectId(questionId)) {
      return res.status(400).json({ message: 'A valid quiz attempt and question are required.' });
    }
    if (!MODES.has(mode)) return res.status(400).json({ message: 'Choose explain, hint, or ask mode.' });
    if (typeof prompt !== 'string' || prompt.length > 500) {
      return res.status(400).json({ message: 'Your question must be 500 characters or fewer.' });
    }
    if (mode === 'ask' && !prompt.trim()) {
      return res.status(400).json({ message: 'Enter a question for your AI tutor.' });
    }

    const attempt = await QuizAttempt.findOne({ _id: attemptId, studentId }).lean();
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found for this learner.' });

    const savedResponse = (attempt.responses || []).find(
      (item) => String(item.questionId) === String(questionId)
    );
    if (!savedResponse) {
      return res.status(404).json({ message: 'The requested answer was not found in this quiz attempt.' });
    }

    const question = await Question.findById(questionId).lean();
    if (!question) return res.status(404).json({ message: 'The original question could not be found.' });

    const previousAttempts = await QuizAttempt.find({ studentId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(8)
      .select('responses')
      .lean();
    const learningSummary = summarizeAttempts(previousAttempts);
    const matchingTopic = learningSummary.topicStats.find((item) => item.topic === question.topic);

    const context = {
      questionText: question.questionText,
      topic: question.topic,
      difficulty: question.difficulty,
      options: question.options,
      selectedAnswer: savedResponse.selectedAnswer || question.options[savedResponse.selectedOptionIndex],
      correctAnswer: savedResponse.correctAnswer || question.options[savedResponse.correctOptionIndex],
      isCorrect: savedResponse.isCorrect,
      storedExplanation: question.explanation,
      topicPerformance: matchingTopic ? {
        attempted: matchingTopic.attempted,
        correct: matchingTopic.correct,
        accuracy: matchingTopic.accuracy,
        status: matchingTopic.status
      } : null
    };

    const tutorPrompt = buildTutorPrompt({ context, mode, studentQuestion: prompt });
    const generated = await generateTutorReply({ tutorPrompt });

    const log = await LearningAssistantLog.create({
      studentId, attemptId, questionId, mode,
      studentQuestion: prompt.trim(),
      assistantAnswer: generated.answer,
      provider: 'gemini',
      model: generated.model
    });

    return res.json({
      answer: generated.answer,
      mode,
      logId: String(log._id),
      provider: 'gemini',
      model: generated.model
    });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 500) console.error('AI tutor request failed:', error.message);
    return res.status(status).json({
      message: error.statusCode ? error.message : 'The AI tutor could not respond. Please try again.'
    });
  }
});

module.exports = router;
