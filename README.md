# Mindstep — Smart Adaptive Learning Platform

A full-stack programming quiz application for the DIGIT Innovations Engineering Internship Assignment.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Tests: Node.js built-in test runner

## Assignment coverage

### Level 1 — Basic full-stack quiz
- Questions are seeded into MongoDB and retrieved through the API.
- The backend validates selected answers and stores each response and completed attempt.
- Students see their score, accuracy, correct answers, and explanations.

### Level 2 — Adaptive quiz engine
- Each question has Easy, Medium, or Hard difficulty stored in MongoDB.
- A quiz starts at Medium.
- Two consecutive correct answers increase difficulty by one level.
- Two consecutive incorrect answers decrease difficulty by one level.
- The backend selects unused questions and falls back to the nearest available difficulty.

### Level 3 — Personalized learning
- Topic-level performance is calculated from persisted quiz responses.
- The dashboard shows overall accuracy, topic strengths/weaknesses, recent attempts, and rule-based recommendations.
- Topic status: below 50% = Needs practice; 50% to below 80% = Developing; 80% or above = Strong.

### Level 4 — Advanced AI/ML
- Not implemented. This level is optional in the assignment.

## Requirements
- Node.js 18 or newer
- MongoDB Atlas database or a local MongoDB instance

## Setup
1. Clone the repository.
2. Install dependencies:
   
       npm install
       npm run install:all

3. Copy backend/.env.example to backend/.env.
4. Set MONGO_URI to your own MongoDB connection string. Never commit backend/.env.
5. Seed the database:
   
       npm run seed

6. Start both apps:
   
       npm run dev

7. Open http://localhost:5173. The API runs on http://localhost:5000.

## Environment variables
- PORT — backend port (default 5000)
- MONGO_URI — MongoDB connection string
- CLIENT_ORIGIN — allowed frontend origin (default http://localhost:5173)

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health | API/database health |
| POST | /api/quiz/start | Create an attempt and return its first question |
| POST | /api/quiz/:attemptId/answer | Check and persist an answer; return feedback and next question |
| GET | /api/progress/:studentId | Retrieve persisted progress and recommendations |

The demo learner ID is demo-student. Authentication and multi-user account management are not included in this assignment prototype.

## Adaptive rule
Difficulty begins at Medium. Two consecutive correct answers move Easy → Medium or Medium → Hard. Two consecutive incorrect answers move Hard → Medium or Medium → Easy. The difficulty is capped at Easy and Hard. When the desired difficulty has no unused questions, the backend chooses an unused question at the nearest available difficulty. An attempt ends after 10 answers or when no unused questions remain.

## Tests
Run backend unit tests:
   
    npm --prefix backend test

The adaptive-rule tests do not need MongoDB.

## Database design
- Question: question text, four options, correct option index, explanation, topic, difficulty.
- QuizAttempt: learner ID, status, score, accuracy, adaptive state, and submitted responses.

The question bank in backend/src/data/questions.js is seed input only. Runtime questions are fetched from MongoDB. The frontend does not use localStorage or sessionStorage for application records.

## Known limitations
- No authentication or multi-user account management.
- Recommendations are deterministic rules, not AI-generated.
- Level 4 AI/ML is not implemented.
- MongoDB must be configured and seeded before the end-to-end demo.

## AI assistance disclosure
AI assistance was used to accelerate scaffolding, implementation, and documentation. The project owner should review the code, run the app and tests, and be prepared to explain the models, API flow, adaptive rules, and limitations.
