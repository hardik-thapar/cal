# ✅ Cal.com Clone - Fullstack Assignment

This is a developer-centric Cal.com clone built with **Next.js 14**, **FastAPI**, and **PostgreSQL**.

## 🚀 Deployment Guide

### 1. Database (Railway / Supabase / Neon)
- Create a PostgreSQL database instance.
- Copy your `DATABASE_URL` (e.g., `postgresql://...`).

### 2. Backend (Railway / Render)
- Set root directory to `backend/`.
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `CORS_ORIGINS`: `*` (or your frontend URL for better security).
- **Start Command**: `Procfile` is included. If manual: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### 3. Frontend (Vercel / Netlify)
- Set root directory to `frontend/`.
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: Your deployed backend URL + `/api` (e.g., `https://cal-api.railway.app/api`).
- **Build Settings**:
  - Build Command: `npm run build`
  - Output Directory: `.next`

---

## 🛠️ Local Development

### Backend
1. `cd backend`
2. `python -m venv venv`
3. `source venv/bin/activate` (MacOS/Linux) or `venv\Scripts\activate` (Windows)
4. `pip install -r requirements.txt`
5. `python seed.py` (Deletes and recreates database schema)
6. `python server.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## ✅ Key Deliverables Verified
- [x] **Premium UI**: Matches Cal.com aesthetic (Dark Mode).
- [x] **Conflict Prevention**: Double-booking is strictly prevented across ALL event types.
- [x] **Cascading Deletes**: Deleting an event type cleans up its bookings automatically.
- [x] **Public Profile**: A root `/public` page listing all shareable event types.
- [x] **Timezone Support**: Automatically detects attendee/host timezone.
