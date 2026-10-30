const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  questionText: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  selectedOptionIndex: { type: Number, required: true },
  correctOptionIndex: { type: Number, required: true },
  selectedAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  explanation: { type: String, required: true },
  answeredAt: { type: Date, default: Date.now }
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', default: null },
  currentDifficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  correctStreak: { type: Number, default: 0 },
  incorrectStreak: { type: Number, default: 0 },
  targetQuestionCount: { type: Number, default: 10 },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  responses: { type: [responseSchema], default: [] },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', attemptSchema);
