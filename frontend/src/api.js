const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The server could not complete the request.');
  return data;
}

export const getHealth = () => request('/health');
export const getProgress = (id) => request('/progress/' + encodeURIComponent(id));
export const startQuiz = (id) => request('/quiz/start', {
  method: 'POST',
  body: JSON.stringify({ studentId: id, questionCount: 10 })
});
export const submitAnswer = (attemptId, questionId, selectedOptionIndex) => request(
  '/quiz/' + encodeURIComponent(attemptId) + '/answer',
  { method: 'POST', body: JSON.stringify({ questionId, selectedOptionIndex }) }
);


export const askLearningAssistant = (payload) => request('/assistant/help', {
  method: 'POST',
  body: JSON.stringify(payload)
});
