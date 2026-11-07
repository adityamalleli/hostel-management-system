# Deploying the Hostel Management System (free)

Goal: put the app online over HTTPS so students can open it on their phones, install it as an app, and scan the QR code.

| Part | Where | Cost |
|---|---|---|
| Database | MongoDB Atlas (you already have this) | Free |
| Backend (Node/Express) | Render | Free |
| Frontend (React PWA) | Vercel | Free |

## 0. Before you start

1. **Reset your Atlas database password.** The old one was shared in a chat, so create a new one in Atlas > Database Access and use only the new one from now on.
2. **Atlas > Network Access:** add `0.0.0.0/0` (Allow access from anywhere). Render's free servers have changing IP addresses.
3. **Push the project to GitHub.** The included `.gitignore` keeps `.env` out of git. Never upload your `.env` file.

```
cd hostel-management-system
git init
git add .
git commit -m "Hostel management system"
git branch -M main
git remote add origin https://github.com/<your-username>/hostel-management-system.git
git push -u origin main
```

## 1. Backend on Render

1. Render dashboard > **New +** > **Web Service** > connect your GitHub repo.
2. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
3. **Environment variables** (Environment tab):

| Key | Value |
|---|---|
| `MONGO_URI` | your Atlas connection string, with the new password |
| `JWT_SECRET` | a long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `TZ` | `Asia/Kolkata` |
| `ATTENDANCE_WINDOW_START` | `19:00` (change to cover your demo time) |
| `ATTENDANCE_WINDOW_END` | `22:00` |
| `ATTENDANCE_LATE_AFTER` | `20:30` |
| `ATTENDANCE_REQUIRE_QR` | `true` |
| `QR_TOKEN_TTL_SECONDS` | `40` |
| `CLIENT_ORIGIN` | add this in step 3, after the frontend is live |

4. Deploy. Open `https://<your-service>.onrender.com/` and you should see `{"message":"Hostel Management System API is running"}`.

## 2. Frontend on Vercel

1. Vercel dashboard > **Add New** > **Project** > import the same GitHub repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
3. **Environment variable:** `VITE_API_URL` = `https://<your-service>.onrender.com/api`
4. Deploy. You get a link like `https://<your-app>.vercel.app`.

## 3. Connect the two

1. On Render, set `CLIENT_ORIGIN` = your Vercel link (no trailing slash), then redeploy the backend.
2. Open the Vercel link, register an admin and a student, and test the flow.

## 4. Install on a phone

- **Android (Chrome):** open the link, tap **Install app** in the top bar (or Chrome menu > Install app).
- **iPhone (Safari):** open the link, tap **Share** > **Add to Home Screen**.

The student scans the QR shown on the admin's **QR Session** page (laptop or projector).

## Free-tier things to know

- **Cold start:** Render's free backend sleeps after 15 minutes without traffic, and the first request afterwards takes 30 to 60 seconds. **Open the site 5 minutes before your demo** and log in once to wake it up.
- **Missed nightly job:** a sleeping server can miss the 5-minutes-after-window absent sweep. Use **Attendance > Mark absentees now** to run it manually.
- **Time zone:** the server is pinned to Asia/Kolkata (set `TZ` too), so the check-in window uses Indian time.
- **Updates:** push to GitHub and both Render and Vercel redeploy automatically. Installed apps update themselves the next time they open.
