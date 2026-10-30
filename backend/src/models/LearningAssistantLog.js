const mongoose = require('mongoose');

const assistantLogSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt', required: true, index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  mode: { type: String, enum: ['explain', 'hint', 'ask'], required: true },
  studentQuestion: { type: String, maxlength: 500, default: '' },
  assistantAnswer: { type: String, required: true },
  provider: { type: String, default: 'gemini' },
  model: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('LearningAssistantLog', assistantLogSchema);
