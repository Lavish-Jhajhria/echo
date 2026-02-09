# Echo
This project is live at - https://echo-lavish-gilt.vercel.app/
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

##  Testing Credentials

The project comes with pre-configured accounts for testing different roles. You can use these credentials to explore the application features immediately after seeding the database.

##  Admin Access
Email: `lavish@echo.com`
Password: `lavish@admin`
Capabilities: Access the Admin Dashboard, view analytics, delete feedback, suspend users, and resolve reports.

##  User Access
Email: `priya.sharma@example.com`
Password: `user@test`
Capabilities: Submit feedback, like posts, and filter submission history.
