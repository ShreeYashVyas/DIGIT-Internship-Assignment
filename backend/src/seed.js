require('dotenv').config();
const connectDatabase = require('./config/db');
const Question = require('./models/Question');
const questions = require('./data/questions');

async function seed() {
  try {
    await connectDatabase();
    for (const question of questions) {
      await Question.updateOne(
        { questionText: question.questionText },
        { $set: question },
        { upsert: true, runValidators: true }
      );
    }
    console.log('Seed complete. Active questions in MongoDB: ' + await Question.countDocuments({ active: true }));
    process.exit(0);
  } catch (error) {
    console.error('Database seed failed:', error.message);
    process.exit(1);
  }
}

seed();
