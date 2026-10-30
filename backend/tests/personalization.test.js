const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getTopicStatus,
  recommendationForTopic,
  summarizeAttempts
} = require('../src/utils/personalization');

test('topics with fewer than three answers remain a building baseline', () => {
  assert.equal(getTopicStatus(1, 100), 'Building baseline');
  assert.match(recommendationForTopic({ attempted: 2, accuracy: 50 }), /at least three questions/i);
});

test('topic status follows the assignment thresholds when enough answers exist', () => {
  assert.equal(getTopicStatus(3, 33), 'Needs practice');
  assert.equal(getTopicStatus(4, 75), 'Developing');
  assert.equal(getTopicStatus(5, 80), 'Strong');
});

test('summary aggregates topic accuracy and overall performance from saved responses', () => {
  const attempts = [
    { responses: [
      { topic: 'Loops', isCorrect: false },
      { topic: 'Loops', isCorrect: true },
      { topic: 'Loops', isCorrect: false },
      { topic: 'Variables', isCorrect: true },
      { topic: 'Variables', isCorrect: true },
      { topic: 'Variables', isCorrect: true }
    ] }
  ];

  const summary = summarizeAttempts(attempts);
  assert.equal(summary.overview.totalAttempts, 1);
  assert.equal(summary.overview.totalAnswered, 6);
  assert.equal(summary.overview.totalCorrect, 4);
  assert.equal(summary.overview.accuracy, 67);

  const loops = summary.topicStats.find((item) => item.topic === 'Loops');
  const variables = summary.topicStats.find((item) => item.topic === 'Variables');
  assert.equal(loops.accuracy, 33);
  assert.equal(loops.status, 'Needs practice');
  assert.equal(variables.accuracy, 100);
  assert.equal(variables.status, 'Strong');
});

test('empty attempt history returns zeroed progress safely', () => {
  const summary = summarizeAttempts([]);
  assert.deepEqual(summary.overview, {
    totalAttempts: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    accuracy: 0
  });
  assert.deepEqual(summary.topicStats, []);
  assert.deepEqual(summary.recommendations, []);
});
