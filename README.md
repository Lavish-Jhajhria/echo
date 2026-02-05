# Echo Feedback Collector

Echo is a dark-themed feedback collection application that lets you capture and review user feedback in a clean, focused interface.

This project is split into two parts:

- **server**: Express + MongoDB backend API
- **client**: React 18 + Vite + Tailwind CSS frontend

---

## Prerequisites

- Node.js 18+ and npm
- A local MongoDB instance running on `mongodb://localhost:27017`

---

## Backend Setup (server)

1. **Install dependencies**

   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file in the `server` folder based on `.env.example`:

   ```bash
   MONGODB_URI=mongodb://localhost:27017/feedback-collector
   PORT=5000
   NODE_ENV=development
   ```

3. **Run the backend in development mode**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`.

4. **Key API endpoints**

   - `POST /api/feedbacks` – Create feedback
   - `GET /api/feedbacks` – Get all feedbacks (newest first)
   - `GET /api/feedbacks/:id` – Get a single feedback
   - `DELETE /api/feedbacks/:id` – Delete feedback

   You can test these endpoints using Postman or Thunder Client.

---

## Frontend Setup (client)

1. **Install dependencies**

   ```bash
   cd client
   npm install
   ```

2. **Configure environment variables (optional)**

   Create a `.env` file in the `client` folder if you want to override the API URL (defaults to `http://localhost:5000`):

   ```bash
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

3. **Run the frontend**

   ```bash
   npm start
   ```

   This uses Vite under the hood and will start the app (by default) on `http://localhost:3000`.

---

## Running Backend and Frontend Concurrently

Open two terminal windows:

- **Terminal 1**

  ```bash
  cd server
  npm run dev
  ```

- **Terminal 2**

  ```bash
  cd client
  npm start
  ```

The frontend is configured to talk to the backend at `http://localhost:5000`.

---

## Testing Checklist

- **Form submission**
  - Submit feedback with valid name, email, and message.
  - Verify success notification and that the form clears after submission.

- **Validation**
  - Empty fields show validation messages.
  - Invalid email shows a helpful error message.
  - Messages longer than 1000 characters are rejected.

- **Delete functionality**
  - Hover a feedback card to reveal the delete icon.
  - Confirm delete in the modal; entry should be removed.

- **API testing**
  - Use Postman/Thunder Client to hit the backend endpoints and verify expected status codes and JSON responses.

- **Responsive design**
  - Test on mobile, tablet, and desktop widths.
  - Ensure the layout collapses from two-column (desktop) to single-column (mobile).

- **Error scenarios**
  - Stop the backend server and try to load/submit feedback; errors should be surfaced in the UI.

---

## Folder Structure (High Level)

```text
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  .env.example
  .gitignore
  package.json
  server.js

client/
  public/
  src/
    assets/
      styles/
    components/
    pages/
    services/
    utils/
    App.js
    index.js
    index.css
  .env.example
  .gitignore
  package.json
  tailwind.config.js
```

This is **Part 1** of Echo and focuses on core feedback collection. Admin, filtering, and additional features can be added in subsequent phases.

