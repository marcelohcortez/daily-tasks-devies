# Daily Tasks System — Technical Specification

## 1. Overview

A web application that allows authenticated users to log, manage, and review their daily tasks with associated time tracking. Each user's data is private and accessible only after login.

---

## 2. Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | React + TypeScript            |
| Backend     | Node.js + TypeScript          |
| Database    | Turso (LibSQL)                |
| Auth        | JWT (JSON Web Tokens)         |
| Linting     | ESLint                        |
| Testing     | Playwright (E2E)              |
| Deployment  | Vercel                        |

---

## 3. Project Structure

```
/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── tests/         # Playwright tests
├── backend/           # Node.js API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── utils/
├── .env.local         # Local environment variables (gitignored)
├── .env.prod          # Production environment variables (gitignored)
└── .env.example       # Example environment variables (committed)
```

---

## 4. Environment Variables

Defined in `.env.local` / `.env.prod`. Documented in `.env.example`:

```
# Database
TURSO_DB_URL=
TURSO_DB_TOKEN=

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=

# App
PORT=
NODE_ENV=
```

> **Security:** `.env.local` and `.env.prod` must be added to `.gitignore`. Credentials must never be hardcoded in source files.

---

## 5. Database Schema

### `users`

| Column       | Type    | Constraints             |
|--------------|---------|-------------------------|
| id           | TEXT    | PRIMARY KEY (UUID)      |
| username     | TEXT    | UNIQUE, NOT NULL        |
| password     | TEXT    | NOT NULL (bcrypt hash)  |
| created_at   | TEXT    | NOT NULL (ISO 8601)     |

### `tasks`

| Column       | Type    | Constraints                        |
|--------------|---------|------------------------------------|
| id           | TEXT    | PRIMARY KEY (UUID)                 |
| user_id      | TEXT    | FOREIGN KEY → users.id, NOT NULL   |
| description  | TEXT    | NOT NULL                           |
| duration     | TEXT    | NOT NULL (e.g. "1h 30min")         |
| duration_min | INTEGER | NOT NULL (total minutes, computed) |
| task_date    | TEXT    | NOT NULL (ISO 8601 date YYYY-MM-DD)|
| created_at   | TEXT    | NOT NULL (ISO 8601)                |
| updated_at   | TEXT    | NOT NULL (ISO 8601)                |

---

## 6. Authentication

- Passwords stored as **bcrypt** hashes (min 12 rounds).
- Login returns a signed **JWT** with `userId` and `username` in the payload.
- JWT is sent as an **HTTP-only cookie** to prevent XSS access.
- All protected routes validate the token via an auth middleware.
- Token expiry configurable via `JWT_EXPIRES_IN` env variable.

---

## 7. API Endpoints

Base path: `/api`

### Auth

| Method | Path             | Description              | Auth required |
|--------|------------------|--------------------------|---------------|
| POST   | `/auth/login`    | Authenticate user        | No            |
| POST   | `/auth/logout`   | Clear auth cookie        | Yes           |
| GET    | `/auth/me`       | Return current user info | Yes           |

### Tasks

| Method | Path                    | Description                         | Auth required |
|--------|-------------------------|-------------------------------------|---------------|
| GET    | `/tasks?date=YYYY-MM-DD`| List tasks for current user by date | Yes           |
| POST   | `/tasks`                | Create a new task                   | Yes           |
| PATCH  | `/tasks/:id`            | Update a task                       | Yes           |
| DELETE | `/tasks/:id`            | Delete a task                       | Yes           |

All task endpoints enforce ownership — users can only read/modify their own tasks.

**POST/PATCH request body:**
```json
{
  "description": "Reviewed pull requests",
  "duration": "1h 30min",
  "task_date": "2026-04-14"
}
```

---

## 8. Security Measures

- **Rate limiting:** Applied to all API endpoints (stricter on `/auth/login` to prevent brute-force).
- **Input sanitization:** All user inputs are sanitized before being used in queries (parameterized queries / prepared statements only).
- **HTTP-only cookies:** JWT stored in HTTP-only, Secure, SameSite=Strict cookies.
- **CORS:** Configured to allow only the frontend origin.
- **Helmet.js:** Applied to set secure HTTP headers.
- **Ownership checks:** Every task operation verifies that the authenticated user owns the resource.
- **Password hashing:** bcrypt with a minimum of 12 salt rounds.
- **No sensitive data in logs:** Passwords and tokens are never logged.

---

## 9. Frontend Pages

### 9.1 Login Page (`/`)

- Username input field
- Password input field
- Submit button
- Redirects to the Dashboard on successful login
- Displays error message on failed login
- Accessible only when **not** authenticated (redirects to dashboard if already logged in)

### 9.2 Dashboard Page (`/dashboard`)

- Accessible only when **authenticated**

#### Header / Navigation Controls

| Element             | Behavior                                                                 |
|---------------------|--------------------------------------------------------------------------|
| Left arrow (`<`)    | Navigate to the previous day                                             |
| Current date label  | Displays the currently viewed date (e.g. "Monday, April 14, 2026")      |
| Right arrow (`>`)   | Navigate to the next day                                                 |
| "Open calendar"     | Opens a date-picker calendar; user can select any past or future date    |

#### Task List (all dates)

- Displays all tasks logged for the viewed date, ordered from **first added to last added**
- Each task shows: description, duration, edit icon, delete icon
- **Edit:** clicking the edit icon makes the row editable; user clicks "Update" to save
- **Delete:** clicking the delete icon shows a confirmation prompt; user must type `delete` into an input field and confirm to proceed

#### Task Input (current and future dates)

- Input field: task description
- Input field: time spent (supports formats like `30min`, `1h`, `1h 30min`, `2h`)
- Button: "Add another task" — appends an additional pair of description + duration inputs
- "Save" / submit action persists the new task(s)

#### Time Summary

- Displayed at the bottom of the task list for all viewed dates
- Shows total time spent on that day (sum of all `duration_min` values, formatted as `Xh Ymin`)

---

## 10. Time Format

Duration is entered as a **positive whole number of hours** via a numeric input field. Fractional hours are not supported.

| Input (user types) | Stored as | Minutes |
|--------------------|-----------|----------|
| `1`                | `1h`      | 60       |
| `2`                | `2h`      | 120      |
| `3`                | `3h`      | 180      |

The time summary displays the total as `Xh` (e.g. `3h`, `10h`).

---

## 11. Testing (Playwright)

This project follows a **test-driven development approach**. Playwright E2E tests are written before feature implementation. All implementation must be built to satisfy the tests — tests define the expected behavior.

- E2E tests cover all critical user flows:
  - Login success and failure
  - Unauthenticated redirect to login; authenticated redirect away from login
  - Viewing tasks for today, a past date, and a future date
  - Creating tasks (single and multiple via "Add another task")
  - Editing an existing task
  - Deleting a task (including typing `delete` in the confirmation input)
  - Calendar navigation (arrows + calendar picker)
  - Time summary updates after adding/removing tasks
  - User isolation: a user cannot view or modify another user's tasks
- Tests run on every feature addition or modification
- **Playwright tests must never be modified to make a feature pass** — fix the implementation instead

---

## 12. Deployment (Vercel)

- Frontend deployed as a Vercel static/SSR project
- Backend deployed as Vercel serverless functions
- Production environment variables set via Vercel dashboard (not committed to repository)
- `.env.prod` used only for local production simulation
