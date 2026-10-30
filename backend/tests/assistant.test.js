const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildTutorPrompt,
  extractGeminiText,
  generateTutorReply
} = require('../src/services/learningAssistant');

const context = {
  questionText: 'Which method creates a new array from callback results?',
  topic: 'Arrays',
  difficulty: 'Medium',
  options: ['push()', 'map()', 'pop()', 'shift()'],
  selectedAnswer: 'push()',
  correctAnswer: 'map()',
  isCorrect: false,
  storedExplanation: 'map() returns a new array.',
  topicPerformance: { attempted: 4, correct: 1, accuracy: 25, status: 'Needs practice' }
};

test('hint prompt instructs the model not to reveal the answer', () => {
  const prompt = buildTutorPrompt({ context, mode: 'hint' });
  assert.match(prompt, /Do not state the correct option or answer directly/i);
  assert.match(prompt, /"topic":"Arrays"/);
});

test('explain prompt includes answer and learner context from saved records', () => {
  const prompt = buildTutorPrompt({ context, mode: 'explain' });
  assert.match(prompt, /"selectedAnswer":"push\(\)"/);
  assert.match(prompt, /"correctAnswer":"map\(\)"/);
  assert.match(prompt, /"accuracy":25/);
});

test('unsupported tutor mode is rejected', () => {
  assert.throws(() => buildTutorPrompt({ context, mode: 'unknown' }), /Unsupported tutor mode/);
});

test('Gemini response text parts are joined safely', () => {
  assert.equal(
    extractGeminiText({ candidates: [{ content: { parts: [{ text: 'Try ' }, { text: 'mapping.' }] } }] }),
    'Try \nmapping.'
  );
  assert.equal(extractGeminiText({ candidates: [] }), '');
});

test('Gemini request sends the API key in a header and returns generated text', async () => {
  let capturedUrl = '';
  let capturedOptions;

  const result = await generateTutorReply({
    apiKey: 'test-key',
    model: 'gemini-3.8-flash',
    tutorPrompt: 'Teach this concept.',
    fetchImpl: async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: 'A map transforms each item.' }] } }]
        })
      };
    }
  });

  assert.match(capturedUrl, /models\/gemini-3\.8-flash:generateContent$/);
  assert.equal(capturedOptions.headers['x-goog-api-key'], 'test-key');
  assert.equal(result.answer, 'A map transforms each item.');
});

test('missing API key reports a setup error without making a network request', async () => {
  await assert.rejects(
    generateTutorReply({
      apiKey: '',
      tutorPrompt: 'Hello',
      fetchImpl: async () => { throw new Error('should not call network'); }
    }),
    (error) => error.statusCode === 503 && /GEMINI_API_KEY/.test(error.message)
  );
});
