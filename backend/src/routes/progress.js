const express = require('express');
const QuizAttempt = require('../models/QuizAttempt');

const router = express.Router();

function recommendationFor(stat) {
  if (stat.accuracy < 50) return 'Review the fundamentals and complete an Easy practice set before moving up.';
  if (stat.accuracy < 80) return 'You are making progress. Practise more questions to strengthen consistency.';
  return 'Strong performance. Try Hard questions to deepen your understanding.';
}

router.get('/:studentId', async (req, res, next) => {
  try {
    const studentId = String(req.params.studentId);
    const attempts = await QuizAttempt.find({ studentId, status: 'completed' }).sort({ completedAt: -1 }).lean();
    const topicMap = new Map();
    let totalAnswered = 0;
    let totalCorrect = 0;

    for (const attempt of attempts) {
      for (const answer of attempt.responses) {
        totalAnswered += 1;
        if (answer.isCorrect) totalCorrect += 1;
        const stat = topicMap.get(answer.topic) || { topic: answer.topic, attempted: 0, correct: 0 };
        stat.attempted += 1;
        if (answer.isCorrect) stat.correct += 1;
        topicMap.set(answer.topic, stat);
      }
    }

    const topicStats = Array.from(topicMap.values()).map((stat) => {
      const accuracy = stat.attempted ? Math.round((stat.correct / stat.attempted) * 100) : 0;
      return {
        ...stat,
        accuracy,
        status: accuracy < 50 ? 'Needs practice' : accuracy < 80 ? 'Developing' : 'Strong'
      };
    }).sort((a, b) => a.accuracy - b.accuracy);

    return res.json({
      student: { studentId, name: 'Learner' },
      overview: {
        totalAttempts: attempts.length,
        totalAnswered,
        totalCorrect,
        accuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0
      },
      topicStats,
      recommendations: topicStats.slice(0, 3).map((stat) => ({
        topic: stat.topic,
        status: stat.status,
        accuracy: stat.accuracy,
        message: recommendationFor(stat)
      })),
      recentAttempts: attempts.slice(0, 5).map((attempt) => ({
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        accuracy: attempt.accuracy,
        completedAt: attempt.completedAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
