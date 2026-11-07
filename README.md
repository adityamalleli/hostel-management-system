# Hostel Management System

A full-stack MERN mini project for academic coursework, covering room allocation, complaints,
mess information, and attendance for a student hostel.

## Tech stack

- **Frontend:** React 18 (Vite), React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT with role-based access control (bcrypt-hashed passwords)
- **Charts / QR:** Recharts, qrcode.react (QR display), html5-qrcode (camera scanning)
- **Scheduling:** node-cron (daily auto-absent sweep)

## Roles

| Role | Can do |
|---|---|
| **Admin / Warden** | Analytics dashboard, manage rooms, allocate/deallocate students, resolve complaints, run the QR attendance session, view/override attendance, link parent accounts, edit the mess menu |
| **Student** | View their room, raise/track complaints with in-app notifications, scan the QR code to check in, view the mess menu |
| **Mess staff** | Edit the weekly mess menu |
| **Parent** | View their linked ward's attendance history and percentage, view the mess menu |

## Project structure

```
hostel-management-system/
├── backend/              Express API + MongoDB models
│   ├── config/           DB connection
│   ├── models/           User, Room, Complaint, Attendance, MessMenu
│   ├── middleware/       JWT auth, role-based access control
│   ├── controllers/      Route logic
│   ├── routes/           API endpoints
│   ├── jobs/             Auto-absent cron job
│   └── utils/            Attendance window logic
└── frontend/             React (Vite) app
    └── src/
        ├── api/           Axios instance with auth interceptor
        ├── context/       Auth state (login/logout/register)
        ├── components/    Shared UI (Navbar, StudentPicker, MessMenuEditor/View, etc.)
        └── pages/         Login/Register + per-role dashboards
```


## New in version 2

- **Redesigned UI:** sidebar layout, stat cards, charts, responsive on mobile, CBIT teal and navy theme
- **Analytics dashboard (admin):** occupancy by block, complaints by status and category, 14-day attendance trend
- **Rotating QR attendance:** the warden opens *QR Session*; the code changes every ~30 seconds and students scan it in the app, so a photo of the code is useless within seconds
- **In-app notifications:** the bell icon alerts admins about new complaints and students when their complaint status changes

### QR attendance: how it works

1. Warden opens **QR Session** (Admin sidebar) on a laptop or projector at the hostel entrance.
2. The backend issues a signed token that expires in 40 seconds (`QR_TOKEN_TTL_SECONDS`); the page refreshes it every 30 seconds.
3. The student opens **Attendance** in the app and taps **Scan QR code**. The app sends the scanned token to `POST /api/attendance/qr/scan`.
4. The server checks the token signature, its expiry, the check-in window, and that the student has not already checked in. Present or late is decided by the time.

Set `ATTENDANCE_REQUIRE_QR=false` in `backend/.env` to also allow the old button check-in (useful for testing without a camera).

**Important for demos:** phone cameras only work on HTTPS pages. On a laptop, `localhost` is fine. For a phone, deploy the app (e.g. Render + Atlas) or use a tunnel such as ngrok. If the camera is unavailable, students can paste the code manually.

## Install as an app (PWA) and deployment

The frontend is an installable Progressive Web App: students open the link on their phone and tap **Install app**
(or **Add to Home Screen** on iPhone). Phone cameras need HTTPS, so the project should be deployed online.
See **DEPLOYMENT.md** for the free step-by-step setup (MongoDB Atlas + Render + Vercel).

## Setup — run both together

**1. Backend**
```
cd backend
npm install
cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
npm run dev
```
Runs at `http://localhost:5000`. Make sure MongoDB is running locally, or point `MONGO_URI` at an Atlas cluster.

**2. Frontend**
```
cd frontend
npm install
cp .env.example .env     # only needed if backend isn't on localhost:5000
npm run dev
```
Runs at `http://localhost:5173`.

## Demo walkthrough (suggested order for a viva/presentation)

1. **Register** an admin account, then a student account (with a roll number) and a parent account.
2. **As admin:** create a room, then go to Rooms → Allocate → search for the student by name → Save.
3. **As admin:** go to Parents → Link the parent account to that student.
4. **As admin:** go to Mess Menu → set today's menu.
5. **As student:** log in, check the room info on the dashboard, raise a complaint, then scan the warden's QR code to check in (only works inside the configured time window — see below).
6. **As admin:** open QR Session to show the live check-in feed. Go to Complaints → update the status (the student gets a notification). Open the Dashboard to show the analytics charts.
7. **As parent:** log in and view the linked student's attendance percentage.

## Attendance window

Configured in `backend/.env`:
```
ATTENDANCE_WINDOW_START=19:00
ATTENDANCE_WINDOW_END=22:00
ATTENDANCE_LATE_AFTER=20:30
```
Checking in before 20:30 marks **present**; between 20:30 and 22:00 marks **late**; outside the window the
request is rejected. A cron job runs ~5 minutes after `ATTENDANCE_WINDOW_END` daily and marks any student
with no record that day as **absent**. For a live demo, temporarily widen the window in `.env` to cover
whatever time you're presenting at.

## Known limitations (worth mentioning in your report)

- **Attendance integrity:** the rotating QR stops remote check-ins, but a friend physically at the screen could still scan
  with someone else's logged-in phone. Geofencing (location check) was left out and is listed as future work.
- **Free hosting sleeps:** the free backend sleeps after 15 minutes idle (30–60 s cold start) and can miss the nightly
  absent job; the admin's *Mark absentees now* button is the manual backup.
- **Open registration:** anyone can currently self-register as any role, including admin. Fine for a
  classroom demo; a production version would restrict admin/mess_staff account creation to existing admins.
- **No file uploads:** complaints are text-only (no photo attachments).
- **Single mess menu:** one shared weekly menu, not per-hostel-block.

## Possible future enhancements

- Geofenced location check on top of QR attendance
- Email/SMS notifications (in-app notifications are done)
- Photo attachments on complaints
- Admin analytics dashboard (occupancy rate, complaint trends, attendance trends)
