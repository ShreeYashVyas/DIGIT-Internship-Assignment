require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDatabase = require('./config/db');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
const assistantRoutes = require('./routes/assistant');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assistant', assistantRoutes);
app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Unexpected server error.' });
});

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => console.log('API server listening on http://localhost:' + port));
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) startServer();
module.exports = app;
