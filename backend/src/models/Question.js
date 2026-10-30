const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true, unique: true },
  options: {
    type: [String],
    required: true,
    validate: { validator: (value) => value.length === 4, message: 'A question must contain four options.' }
  },
  correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, required: true },
  topic: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
