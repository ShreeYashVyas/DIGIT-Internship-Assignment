const test = require('node:test');
const assert = require('node:assert/strict');
const { selectUnusedQuestion, publicQuestion } = require('../src/utils/question');

function makeQuestionModel(rows) {
  return {
    find(query) {
      return {
        lean: async () => rows.filter((row) => {
          if (row.active === false) return false;
          if (query._id?.$nin) {
            return !query._id.$nin.some((usedId) => String(usedId) === String(row._id));
          }
          return true;
        })
      };
    }
  };
}

const questions = [
  { _id: 'easy-1', questionText: 'Easy question', difficulty: 'Easy', active: true },
  { _id: 'medium-1', questionText: 'Medium question', difficulty: 'Medium', active: true },
  { _id: 'hard-1', questionText: 'Hard question', difficulty: 'Hard', active: true },
  { _id: 'inactive-1', questionText: 'Inactive question', difficulty: 'Medium', active: false }
];

test('question selection prefers the requested difficulty', async () => {
  const selected = await selectUnusedQuestion(makeQuestionModel(questions), 'Medium', []);
  assert.equal(selected._id, 'medium-1');
});

test('question selection falls back to the nearest unused difficulty', async () => {
  const selected = await selectUnusedQuestion(
    makeQuestionModel(questions),
    'Medium',
    ['medium-1', 'inactive-1']
  );
  assert.ok(['easy-1', 'hard-1'].includes(selected._id));
});

test('question selection never repeats used questions and ignores inactive questions', async () => {
  const selected = await selectUnusedQuestion(
    makeQuestionModel(questions),
    'Easy',
    ['easy-1', 'medium-1', 'hard-1']
  );
  assert.equal(selected, null);
});

test('question selection returns null when no active questions exist', async () => {
  const selected = await selectUnusedQuestion(makeQuestionModel([]), 'Medium', []);
  assert.equal(selected, null);
});

test('public question payload never exposes the answer key or explanation', () => {
  const question = {
    _id: 'question-123',
    questionText: 'Which method transforms an array?',
    options: ['push', 'map', 'pop', 'shift'],
    correctOptionIndex: 1,
    explanation: 'map returns a new array.',
    topic: 'Arrays',
    difficulty: 'Medium'
  };

  const payload = publicQuestion(question, 2, 10);
  assert.deepEqual(payload, {
    id: 'question-123',
    questionText: 'Which method transforms an array?',
    options: ['push', 'map', 'pop', 'shift'],
    topic: 'Arrays',
    difficulty: 'Medium',
    questionNumber: 2,
    totalQuestions: 10
  });
  assert.equal(Object.hasOwn(payload, 'correctOptionIndex'), false);
  assert.equal(Object.hasOwn(payload, 'explanation'), false);
});
