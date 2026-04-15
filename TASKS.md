# Daily Tasks System — Task List

Tasks are grouped by priority. Complete higher-priority tasks before moving to lower ones. Within the same priority, tasks should be done roughly in the order listed (dependencies flow top to bottom).

This project follows a **test-driven approach**: Playwright E2E tests are written in P1, right after the project foundation. All feature implementation (P2 onward) must make the existing tests pass — tests are never changed to accommodate a broken implementation.

---

## P0 — Foundation (must be done first)

- [ ] Initialize monorepo structure (`/frontend`, `/backend`)
- [ ] Configure TypeScript for both frontend and backend
- [ ] Configure ESLint for both frontend and backend
- [ ] Create `.env.example`, `.env.local`, and `.env.prod`; add `.env.local` and `.env.prod` to `.gitignore`
- [ ] Set up Turso (LibSQL) client in the backend with connection via env variables
- [ ] Create database schema: `users` and `tasks` tables with all columns and constraints
- [ ] Implement password hashing utility (bcrypt, min 12 rounds)
- [ ] Implement JWT signing and verification utilities
- [ ] Implement auth middleware to protect routes (validates JWT from HTTP-only cookie)

---

## P1 — Playwright Tests (write before implementing features)

Set up Playwright and write all E2E tests based on the spec. Tests will initially fail — that is expected. Feature implementation in P2–P4 must make them pass. **Tests must never be modified to accommodate a failing implementation.**

- [ ] Set up Playwright and configure it to run against the local dev server
- [ ] Write test: login success flow
- [ ] Write test: login failure flow (wrong credentials)
- [ ] Write test: unauthenticated user is redirected to login
- [ ] Write test: authenticated user is redirected away from login page
- [ ] Write test: view tasks for today
- [ ] Write test: navigate to a past date and view tasks
- [ ] Write test: navigate to a future date and view tasks
- [ ] Write test: create a new task
- [ ] Write test: add multiple tasks using "Add another task" button
- [ ] Write test: edit an existing task
- [ ] Write test: delete a task (including typing `delete` in the confirmation input)
- [ ] Write test: open calendar and select a date
- [ ] Write test: time summary updates correctly after adding/removing tasks
- [ ] Write test: user cannot view or modify another user's tasks

---

## P2 — Core Backend & Auth

- [ ] `POST /api/auth/login` — validate credentials, return JWT as HTTP-only cookie
- [ ] `POST /api/auth/logout` — clear auth cookie
- [ ] `GET /api/auth/me` — return current authenticated user info
- [ ] Apply security middleware to all routes: Helmet.js, CORS (frontend origin only), rate limiting (strict on `/auth/login`)
- [ ] Implement input sanitization for all API endpoints (parameterized queries only)
- [ ] `GET /api/tasks?date=YYYY-MM-DD` — return tasks for authenticated user filtered by date
- [ ] `POST /api/tasks` — create a new task (validate ownership via JWT)
- [ ] `PATCH /api/tasks/:id` — update a task (verify user owns the task)
- [ ] `DELETE /api/tasks/:id` — delete a task (verify user owns the task)
- [ ] Implement time-format parser: accept a positive whole-number integer (hours), store as `"Xh"`, compute `X × 60` minutes
- [ ] Implement ownership enforcement in all task endpoints (user can only access their own tasks)

---

## P3 — Core Frontend & Task UI

- [ ] Build Login page: username + password inputs, submit, error display, redirect to dashboard on success
- [ ] Protect dashboard route: redirect unauthenticated users to login; redirect authenticated users away from login
- [ ] Build Dashboard page shell: header with date label, left/right arrow navigation, logout action
- [ ] Build task list component: shows description, duration, edit icon, delete icon for each task, ordered first-added to last-added
- [ ] Build task input form: description field, duration field, "Add another task" button (appends new input pair), save action
- [ ] Implement inline edit mode: clicking edit icon makes the row editable; "Update" button saves changes via `PATCH`
- [ ] Implement delete confirmation flow: modal/inline prompt requires user to type `delete`; confirms via `DELETE` endpoint
- [ ] Build time summary component: sums `duration_min` for all tasks on the viewed date, formats as `Xh Ymin`
- [ ] Wire task input form to `POST /api/tasks` (creates tasks for the currently viewed date)
- [ ] Differentiate UI state by date context:
  - **Current day:** task input form + task list + time summary
  - **Past date:** task list + add-task form + edit/delete actions + time summary
  - **Future date:** task input form + task list + edit/delete actions + time summary

---

## P4 — Calendar Navigation

- [ ] Build calendar date-picker component (accessible via "Open calendar" button)
- [ ] Wire left/right arrows to decrement/increment the viewed date by one day
- [ ] Wire calendar selection to update the viewed date
- [ ] Display currently viewed date as a formatted label (e.g. "Monday, April 14, 2026")
- [ ] Persist viewed date in URL query param (e.g. `?date=2026-04-14`) for shareable/bookmarkable links

---

## P5 — Deployment

- [ ] Configure Vercel project: link frontend and backend
- [ ] Set all production environment variables in Vercel dashboard
- [ ] Add Vercel build and output configuration files as needed
- [ ] Perform a production smoke test after first deployment
- [ ] Confirm E2E Playwright tests pass against the production URL
