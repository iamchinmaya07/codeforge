# CodeForge

A full-stack online coding platform where users can browse problems, write and run code in multiple languages with instant feedback, and submit solutions that are judged against hidden test cases using a sandboxed code execution engine.

**Live:** [codeforge-chinmaya.vercel.app](https://codeforge-chinmaya.vercel.app/)

---

## Overview

CodeForge lets users solve programming problems end-to-end — read a problem, write code in the browser, run it against sample test cases for instant feedback, and submit it for an official verdict against hidden test cases. It also includes AI-assisted hints for when a user gets stuck, and video walkthroughs for problem solutions.

---

## Features

- **User authentication** — signup/login with JWT-based sessions stored in httpOnly cookies, and Redis-backed token blacklisting so logout immediately invalidates a token instead of waiting for natural expiry.
- **Problem management** — create and update coding problems with descriptions, tags, difficulty, starter code per language, visible test cases (for quick feedback), and hidden test cases (for the official verdict). Reference solutions are verified against Judge0 at creation time.
- **Sandboxed code execution** — user-submitted code runs in an isolated environment via Judge0, supporting multiple languages (C++, Java, JavaScript), with per-test-case runtime and memory tracking.
- **Run vs. Submit** — "Run" checks code against visible test cases for fast iteration; "Submit" judges it against hidden test cases and records the result against the user's solved problems.
- **AI-powered hints** — integrated with an AI API to give contextual hints when a user is stuck on a problem, without immediately revealing the full solution.
- **Video solutions** — solution walkthrough videos uploaded and served via Cloudinary.
- **Admin dashboard** — admin-only routes for creating/updating/deleting problems and viewing platform-wide user data.
- **Form validation** — client-side validation using `react-hook-form` and `zod` schemas for robust, type-safe form handling.

---

## Tech Stack

**Frontend**
- React
- Redux Toolkit (state management)
- React Router
- React Hook Form + Zod (form validation)
- Tailwind CSS / DaisyUI
- Deployed on **Vercel**

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Redis (JWT blacklisting, with auto-reconnect handling)
- JWT (authentication)
- bcrypt (password hashing)
- Deployed on **Render**

**External Services**
- **Judge0** — sandboxed, multi-language code execution engine
- **AI API** — AI-powered problem hints
- **Cloudinary** — video storage and delivery

---

## Architecture

```
Client (React + Redux) — hosted on Vercel
      │
      ▼
Express API — hosted on Render
 ├── /user        → register, login, logout, check (JWT + Redis blacklist)
 ├── /problem      → create, update, delete, fetch problems, admin user list
 ├── /submission   → run code (visible tests), submit code (hidden tests)
 ├── /ai           → AI-powered hints
 └── /video        → solution video upload/fetch (Cloudinary)
      │
      ▼
MongoDB Atlas (users, problems, submissions, solution videos)
Redis Cloud (JWT blacklist)
Judge0 (external code execution, via RapidAPI)
```

### How code execution works

1. User writes code and clicks **Run** or **Submit**.
2. The backend maps the selected language to a Judge0 language ID and builds a batch of test cases (source code + input + expected output).
3. The batch is submitted to Judge0, which returns a token per test case immediately (execution is asynchronous).
4. The backend polls Judge0 with those tokens until every test case finishes running.
5. Results (pass/fail, runtime, memory) are aggregated and returned to the client. On **Submit**, the result is also persisted and the problem is added to the user's solved list.

### Cross-origin setup

Since the frontend (Vercel) and backend (Render) are on different domains, the API uses:
- CORS configured with an explicit allow-list of origins (`localhost` for dev, the Vercel URL for production), with `credentials: true`.
- Auth cookies set with `sameSite: "none"` and `secure: true` so they're correctly sent on cross-origin requests.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Redis instance (local or cloud)
- Judge0 API key (via RapidAPI)
- An AI API key (for the hints feature)
- Cloudinary account (for video uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/iamchinmaya07/codeforge.git
cd codeforge

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend** — create a `.env` file inside `backend/`:
```
PORT=3000
DB_CONNECT_STRING=your_mongodb_connection_string
JWT_KEY=your_jwt_secret
REDIS_PASS=your_redis_password
JUDGE0_KEY=your_judge0_rapidapi_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ADMIN_SECRET=your_admin_registration_secret
AI_API_KEY=your_ai_hints_api_key
FRONTEND_URL=http://localhost:5173
```

**Frontend** — create `.env.local` (for local dev) inside `frontend/`:
```
VITE_API_URL=http://localhost:3000
```
And `.env.production` (used by Vercel's build):
```
VITE_API_URL=https://your-backend.onrender.com
```

> **Note:** Never commit `.env` files. Make sure they're listed in `.gitignore` on both frontend and backend, and rotate any credentials that were ever exposed accidentally (e.g., pasted into a chat, screenshot, or committed by mistake).

### Running Locally

```bash
# Start the backend
cd backend
npm run dev

# Start the frontend (in a separate terminal)
cd frontend
npm run dev
```

---

## Deployment Notes

- **Frontend (Vercel):** auto-deploys on every push to `main`. Environment variables are set separately in the Vercel dashboard, not read from local `.env` files.
- **Backend (Render):** auto-deploys on every push to `main` if Auto-Deploy is enabled on the service. Environment variables are set in Render's dashboard under the service's Environment tab.
- **Render free tier** spins down after inactivity — the first request after idle time can take 30–60 seconds to respond.

---

## Known Limitations / Roadmap

- The Judge0 polling loop currently has no max-retry/timeout — a hung Judge0 request can block indefinitely. Planned fix: cap polling attempts and return a "judging timed out" response.
- No CSRF protection yet on state-changing routes.
- No submission queueing — under heavy load, requests are sent directly to Judge0 rather than through a rate-controlled queue (e.g., BullMQ).
- Planned: discussion/comments per problem, leaderboard, and user profile stats.

---
