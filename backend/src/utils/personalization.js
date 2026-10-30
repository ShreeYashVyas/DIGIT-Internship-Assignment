function getTopicStatus(attempted, accuracy) {
  // A tiny sample is not enough evidence to label a learner strong or weak.
  if (attempted < 3) return 'Building baseline';
  if (accuracy < 50) return 'Needs practice';
  if (accuracy < 80) return 'Developing';
  return 'Strong';
}

function recommendationForTopic(stat) {
  if (stat.attempted < 3) {
    return 'Complete at least three questions in this topic so we can estimate your understanding more reliably.';
  }
  if (stat.accuracy < 50) {
    return 'Review the fundamentals and complete an Easy practice set before moving up.';
  }
  if (stat.accuracy < 80) {
    return 'You are making progress. Practise more questions to strengthen consistency.';
  }
  return 'Strong performance. Try Hard questions to deepen your understanding.';
}

function summarizeAttempts(attempts) {
  const topics = new Map();
  let totalAnswered = 0;
  let totalCorrect = 0;

  for (const attempt of attempts) {
    for (const answer of attempt.responses || []) {
      if (!answer.topic) continue;

      totalAnswered += 1;
      if (answer.isCorrect) totalCorrect += 1;

      const stat = topics.get(answer.topic) || {
        topic: answer.topic,
        attempted: 0,
        correct: 0
      };

      stat.attempted += 1;
      if (answer.isCorrect) stat.correct += 1;
      topics.set(answer.topic, stat);
    }
  }

  const topicStats = Array.from(topics.values())
    .map((stat) => {
      const accuracy = stat.attempted
        ? Math.round((stat.correct / stat.attempted) * 100)
        : 0;

      return {
        ...stat,
        accuracy,
        status: getTopicStatus(stat.attempted, accuracy)
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
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
      attempted: stat.attempted,
      message: recommendationForTopic(stat)
    }))
  };
}

module.exports = {
  getTopicStatus,
  recommendationForTopic,
  summarizeAttempts
};
