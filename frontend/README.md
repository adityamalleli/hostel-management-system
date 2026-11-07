# Hostel Management System — Frontend (v2: redesigned UI, QR attendance, analytics)

React (Vite) frontend for the Hostel Management System.

## What's included

- **Login & Register** pages, role selection at registration (admin/student/mess_staff/parent)
- **Admin dashboard** — tabs for Rooms (create/allocate/deallocate/delete), Complaints (filter + update status/remarks), Attendance (view/override by date), Mess Menu (edit weekly)
- **Student dashboard** — overview (room/roll number), raise & track complaints, attendance check-in button + history, view weekly mess menu
- **Mess staff dashboard** — edit the weekly mess menu
- **Parent dashboard** — view ward's attendance history and percentage, view mess menu
- **Parents tab (admin)** — search and link a parent account to their ward student
- **Student picker** — type-ahead search by name/roll number, used for room allocation and ward linking
  (replaces manually pasting a MongoDB ID)
- JWT stored in `localStorage`, attached automatically to every API call, auto-redirect to login on expiry
- Role-based route protection (`ProtectedRoute`), auto-redirect from `/` to the right dashboard, and a 404 page

## Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```
2. Copy `.env.example` to `.env` (only needed if your backend isn't on `localhost:5000`):
   ```
   cp .env.example .env
   ```
3. Make sure the backend (see `../backend`) is running first.
4. Start the dev server:
   ```
   npm run dev
   ```
   Opens at `http://localhost:5173`.

## Notes

- **Styling** is intentionally clean/functional rather than heavily designed — appropriate for a mini project demo.
- **Validation** is basic required-field validation; errors show as inline text rather than toast notifications.
- See the top-level `README.md` for the full demo walkthrough and known limitations to mention in your report.
