# Hostel Management System — Backend (Day 1–4, complete)

Node.js + Express + MongoDB backend for the Hostel Management System mini project.

## What's included so far

**Day 1:**
- Project structure (config / models / middleware / routes / controllers)
- MongoDB models: `User` (admin, student, mess_staff, parent), `Room`, `Complaint`, `Attendance`, `MessMenu`
- JWT authentication with role-based access control
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Day 2:**
- **Rooms** — admin creates/edits/deletes rooms, allocates/deallocates students, everyone can view
- **Complaints** — students raise complaints, admin updates status and adds remarks
- **Attendance** — student self check-in during a configurable time window (present/late), admin overrides, auto-absent cron job, parent view with attendance percentage
- **Mess menu** — admin/mess_staff set the weekly menu, everyone can view (including a `/today` shortcut)

### API summary

| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | `/api/rooms` | admin | create room |
| GET | `/api/rooms` | any | list/filter rooms |
| GET | `/api/rooms/:id` | any | room details |
| PUT | `/api/rooms/:id` | admin | edit room |
| PUT | `/api/rooms/:id/allocate` | admin | assign student to room |
| PUT | `/api/rooms/:id/deallocate` | admin | remove student from room |
| DELETE | `/api/rooms/:id` | admin | delete empty room |
| POST | `/api/complaints` | student | raise complaint |
| GET | `/api/complaints` | any | list (own for students, all for admin) |
| GET | `/api/complaints/:id` | any | complaint details |
| PUT | `/api/complaints/:id/status` | admin | update status/remarks |
| DELETE | `/api/complaints/:id` | student (own, open only) / admin | delete complaint |
| POST | `/api/attendance/checkin` | student | self check-in |
| GET | `/api/attendance/me` | student | own history |
| GET | `/api/attendance/student/:id` | admin / that student's parent | history + percentage |
| GET | `/api/attendance/date/:date` | admin | everyone's record for a date |
| PUT | `/api/attendance/:id` | admin | override a record |
| GET | `/api/mess` | any | full weekly menu |
| GET | `/api/mess/today` | any | today's menu |
| PUT | `/api/mess/:day` | admin / mess_staff | set a day's menu |
| GET | `/api/attendance/config` | any | check-in window, QR settings |
| GET | `/api/attendance/qr/token` | admin | short-lived signed token for the QR code |
| POST | `/api/attendance/qr/scan` | student | check in by sending the scanned token |
| GET | `/api/notifications` | any | latest notifications + unread count |
| PUT | `/api/notifications/read-all` | any | mark all as read |
| PUT | `/api/notifications/:id/read` | any | mark one as read |
| GET | `/api/analytics/overview` | admin | occupancy, complaint and attendance analytics |
| GET | `/api/users` | admin | search/list users (`?role=student&search=...`) |
| GET | `/api/users/:id` | admin | user details |
| PUT | `/api/users/:id/ward` | admin | link a parent account to a student (ward) |

**Day 4** added the `/api/users` endpoints above, used by the frontend's student-search picker
(for room allocation) and the admin's parent-ward linking screen.

### Attendance window

Configured in `.env`:
```
ATTENDANCE_WINDOW_START=19:00
ATTENDANCE_WINDOW_END=22:00
ATTENDANCE_LATE_AFTER=20:30
ATTENDANCE_REQUIRE_QR=true
QR_TOKEN_TTL_SECONDS=40
```
Check-in before 20:30 → **present**. Check-in between 20:30 and 22:00 → **late**. Outside the window → rejected. A cron job runs ~5 minutes after `ATTENDANCE_WINDOW_END` daily and marks any student with no record that day as **absent**.

## Setup

1. Install dependencies:
   ```
   cd backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
3. Make sure MongoDB is running locally (or use a MongoDB Atlas connection string in `MONGO_URI`).
4. Start the server:
   ```
   npm run dev
   ```
   The API runs at `http://localhost:5000`.

## Testing the auth endpoints

Register an admin:
```
POST /api/auth/register
{
  "name": "Warden Name",
  "email": "warden@hostel.com",
  "password": "password123",
  "role": "admin"
}
```

Register a student:
```
POST /api/auth/register
{
  "name": "Student Name",
  "email": "student@hostel.com",
  "password": "password123",
  "role": "student",
  "rollNumber": "22CS001"
}
```

Login:
```
POST /api/auth/login
{
  "email": "student@hostel.com",
  "password": "password123"
}
```
Returns a `token` — send it as `Authorization: Bearer <token>` on protected routes.

## Status

Backend is feature-complete for the mini project scope. See the top-level `README.md` for the full
demo walkthrough and known limitations.
