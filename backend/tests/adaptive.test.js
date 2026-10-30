const test = require('node:test');
const assert = require('node:assert/strict');
const { nextDifficulty } = require('../src/utils/adaptive');

test('two consecutive correct answers increase difficulty', () => {
  assert.equal(nextDifficulty('Medium', 2, 0), 'Hard');
  assert.equal(nextDifficulty('Easy', 2, 0), 'Medium');
});

test('two consecutive incorrect answers decrease difficulty', () => {
  assert.equal(nextDifficulty('Medium', 0, 2), 'Easy');
  assert.equal(nextDifficulty('Hard', 0, 2), 'Medium');
});

test('difficulty stays within Easy and Hard boundaries', () => {
  assert.equal(nextDifficulty('Easy', 0, 2), 'Easy');
  assert.equal(nextDifficulty('Hard', 2, 0), 'Hard');
});

test('one answer does not change difficulty', () => {
  assert.equal(nextDifficulty('Medium', 1, 0), 'Medium');
  assert.equal(nextDifficulty('Medium', 0, 1), 'Medium');
});
