# Mindstep — Smart Adaptive Learning Platform

A full-stack programming quiz application for the DIGIT Innovations Engineering Internship Assignment.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- AI learning assistant: Google Gemini API
- Tests: Node.js built-in test runner and GitHub Actions

## Assignment coverage

### Level 1 — Basic full-stack quiz: Implemented
- Questions are seeded into MongoDB and retrieved from it at runtime.
- The backend validates selected answers and stores each response and completed attempt.
- Students see their score, accuracy, selected answer, correct answer, and explanation.

### Level 2 — Adaptive quiz engine: Implemented
- Each question has Easy, Medium, or Hard difficulty stored in MongoDB.
- A quiz starts at Medium.
- Two consecutive correct answers increase difficulty by one level.
- Two consecutive incorrect answers decrease difficulty by one level.
- The backend selects unused questions and falls back to the nearest available difficulty.

### Level 3 — Personalized learning: Implemented
- Topic-level performance is calculated from persisted quiz responses.
- The dashboard shows overall accuracy, topic status, recommendations, recent attempts, and full attempt history.
- Topic status: fewer than 3 answers = Building baseline; below 50% after 3 answers = Needs practice; 50% to below 80% = Developing; 80% or above = Strong.
- Personalization aggregation and recommendation thresholds have automated unit tests.

### Level 4 — AI-powered learning assistant: Implemented; requires API key to run
- Explain mode explains the student's saved answer and the database-backed correct concept.
- Hint mode gives guidance without directly stating the correct answer.
- Ask mode answers a learner question about the current programming concept.
- The backend builds context from the saved quiz response, original question record, and recent topic performance.
- Assistant requests and responses are persisted in MongoDB.
- Prompts instruct the model to use supplied records as context, ignore instructions embedded inside question/user text, and acknowledge uncertainty.
- The feature uses Gemini generateContent. Configure GEMINI_API_KEY before using it.

## Requirements
- Node.js 18 or newer
- MongoDB Atlas database or local MongoDB
- Gemini API key for Level 4 assistant calls

## Setup
1. Clone the repository.
2. Install dependencies:
   
       npm install
       npm run install:all

3. Copy backend/.env.example to backend/.env.
4. Set MONGO_URI to your MongoDB connection string.
5. Set GEMINI_API_KEY to your Gemini API key. Keep this key server-side in backend/.env; never put it in frontend code or commit the .env file.
6. Optionally set GEMINI_MODEL (default: gemini-3.8-flash).
7. Seed the database:
   
       npm run seed

8. Start both apps:
   
       npm run dev

9. Open http://localhost:5173. The API runs on http://localhost:5000.

Without GEMINI_API_KEY, quiz and dashboard features still work; the assistant endpoint returns a setup message.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/health | API/database health |
| POST | /api/quiz/start | Create an attempt and return the first question |
| POST | /api/quiz/:attemptId/answer | Check and persist an answer; return feedback and next question |
| GET | /api/progress/:studentId | Retrieve stored progress and recommendations |
| POST | /api/assistant/help | Generate and persist an explain, hint, or ask response from saved quiz context |

The demo learner ID is demo-student. Authentication and multi-user account management are not included.

## Adaptive algorithm
Difficulty begins at Medium. Two consecutive correct answers move Easy to Medium or Medium to Hard. Two consecutive incorrect answers move Hard to Medium or Medium to Easy. Difficulty is capped at Easy and Hard. If the preferred difficulty has no unused questions, the backend chooses an unused question at the nearest available difficulty. An attempt ends after 10 answers or when no unused questions remain.

## Database design
- Question: question text, four options, correct option index, explanation, topic, difficulty.
- QuizAttempt: learner ID, status, score, accuracy, adaptive state, and submitted responses.
- LearningAssistantLog: learner, attempt and question references, assistant mode, learner prompt, generated response, provider and model.

The question bank in backend/src/data/questions.js is seed input only. Runtime quiz questions are retrieved from MongoDB. The frontend does not use localStorage or sessionStorage for application records.

## Tests
Run backend tests:

    npm --prefix backend test

Tests cover adaptive rules, question selection and difficulty fallback, no-repeat/exhaustion behaviour, answer-key privacy in question payloads, personalization, tutor prompt behaviour, response parsing, Gemini request construction, and missing API-key handling. The frontend production build is checked by GitHub Actions.

## Known limitations
- No authentication or multi-user account management; the current app uses a demo learner ID.
- The Gemini assistant requires a valid API key, internet connectivity, and API quota/access.
- LLM responses can still be incorrect; the UI warns students to verify important concepts with course material.
- Recommendations are deterministic rules, not generated by an LLM.
- MongoDB must be configured and seeded before an end-to-end demo.

## AI assistance disclosure
AI assistance was used to accelerate scaffolding, implementation, and documentation. The project owner should review the code, run the app and tests, and be ready to explain the models, API flow, adaptive rules, AI prompt design, limitations, and design decisions.
