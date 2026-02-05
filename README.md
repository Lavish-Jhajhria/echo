# Echo

Simple feedback collector for capturing and reviewing user feedback.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB

## Features
- Submit feedback (name, email, message)
- See all feedback (newest first)
- Delete feedback
- Basic form validation

## Setup

You’ll need Node 18+ and a MongoDB instance (local or remote).

### Backend
```bash
cd server
npm install
cp .env.example .env
# Update MONGODB_URI in .env if needed
npm run dev
```
Backend runs on `http://localhost:5000`.

### Frontend
```bash
cd client
npm install
npm start
```
Frontend runs on `http://localhost:3000` and talks to the backend at `http://localhost:5000`.

## API Endpoints
```text
POST   /api/feedbacks      - Create feedback
GET    /api/feedbacks      - Get all feedbacks
GET    /api/feedbacks/:id  - Get single feedback
DELETE /api/feedbacks/:id  - Delete feedback
```
