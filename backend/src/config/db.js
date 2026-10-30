const mongoose = require('mongoose');

async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Create backend/.env using backend/.env.example.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected.');
}

module.exports = connectDatabase;
