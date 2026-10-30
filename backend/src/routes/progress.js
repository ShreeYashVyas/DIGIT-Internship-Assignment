const express = require('express');
const QuizAttempt = require('../models/QuizAttempt');
const { summarizeAttempts } = require('../utils/personalization');

const router = express.Router();

router.get('/:studentId', async (req, res, next) => {
  try {
    const studentId = String(req.params.studentId);

    const attempts = await QuizAttempt.find({
      studentId,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .lean();

    const summary = summarizeAttempts(attempts);
    const attemptHistory = attempts.map((attempt) => ({
      id: String(attempt._id),
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      accuracy: attempt.accuracy,
      completedAt: attempt.completedAt
    }));

    return res.json({
      student: { studentId, name: 'Learner' },
      ...summary,
      recentAttempts: attemptHistory.slice(0, 5),
      attemptHistory
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
