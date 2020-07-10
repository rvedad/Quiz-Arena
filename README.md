# Quiz Arena

A full-stack web application where players take timed quizzes, earn points, and compete on a global leaderboard. Administrators manage quiz content through a dedicated panel.

---

## Tech Stack

**Frontend**
- React.js + Vite
- React Router (client-side routing)
- Plain CSS (per-component files)

**Backend**
- Node.js + Express.js
- REST API

**Database**
- PostgreSQL via [Neon](https://neon.tech) Serverless

---

## Features

### Players
- Register and log in securely
- Take randomized quizzes by category
- 15-second countdown timer per question
- Earn 1 point per correct answer
- View total points, global rank, and quiz history on the dashboard
- Browse global and category-specific leaderboards

### Admins
- Admin dashboard with platform statistics
- Full CRUD for categories and questions
- Question bank searchable and filterable by category

---

## Project Structure

```
quiz-arena/
├── backend/
│   ├── db/
│   │   └── sql.js              # Neon database connection
│   ├── middleware/
│   │   └── auth.js             # Read user identity from request headers
│   ├── routes/
│   │   ├── auth.js             # Register, login, profile
│   │   ├── categories.js       # Category CRUD
│   │   ├── questions.js        # Question CRUD
│   │   ├── quiz.js             # Generate & submit quizzes, history
│   │   ├── leaderboard.js      # Global & category rankings
│   │   └── admin.js            # Platform statistics
│   ├── index.js                # Express app entry point
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar/
        │   ├── AdminLayout/
        │   ├── Modal/
        │   └── TimerRing/
        ├── pages/
        │   ├── Login/
        │   ├── Register/
        │   ├── Dashboard/
        │   ├── QuizSetup/
        │   ├── QuizPlay/
        │   ├── QuizResult/
        │   ├── Leaderboard/
        │   ├── AdminDashboard/
        │   ├── AdminCategories/
        │   └── AdminQuestions/
        ├── api.js              # Centralized fetch helper
        ├── user.js             # localStorage helpers
        └── App.jsx             # Routes
```

---

## Database Schema

```sql
users           — id, username, email, password_hash, is_admin, total_points, created_at
categories      — id, name, description, question_count
questions       — id, category_id, question_text, option_a/b/c/d, correct_option
quiz_attempts   — id, user_id, category_id, total_questions, score, completed_at
quiz_answers    — id, attempt_id, question_id, selected_option, is_correct, time_taken_sec
category_points — user_id, category_id, points
```

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/profile` | Get current user profile & stats |
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category (admin) |
| PUT | `/api/categories/:id` | Update category (admin) |
| DELETE | `/api/categories/:id` | Delete category (admin) |
| GET | `/api/questions` | Get questions with filters (admin) |
| POST | `/api/questions` | Create question (admin) |
| PUT | `/api/questions/:id` | Update question (admin) |
| DELETE | `/api/questions/:id` | Delete question (admin) |
| POST | `/api/quiz/generate` | Generate a random quiz |
| POST | `/api/quiz/submit` | Submit answers and get score |
| GET | `/api/quiz/history` | Get user's quiz history |
| GET | `/api/leaderboard/global` | Global rankings |
| GET | `/api/leaderboard/category/:id` | Category rankings |
| GET | `/api/admin/stats` | Platform statistics (admin) |

---

## Getting Started

### Prerequisites
- Node.js v18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quiz-arena.git
cd quiz-arena
```

### 2. Set up the database

Run the contents of `backend/db/schema.sql` in your Neon SQL editor to create all tables.

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```
DATABASE_URL=your_neon_connection_string
PORT=5000
CLIENT_URL=http://localhost:3000
```

Install dependencies and start:

```bash
npm install
node index.js
```

### 4. Configure the frontend

```bash
cd frontend/quiz-arena
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

### 5. Open the app

Visit `http://localhost:3000`

Default admin account:
- **Email:** `admin@quizarena.com`
- **Password:** `admin123`

---

## Authentication

Passwords are hashed using **SHA-256** before being stored. On login, the user object is saved to `localStorage`. Each request sends the user ID as a plain header (`x-user-id`) which the backend reads to identify the user.

---
