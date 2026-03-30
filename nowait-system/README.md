# NoWait - Role-Based Smart Queue & Booking System

NoWait is a real-time queue platform with separate authenticated workspaces for users and admins. Users sign in to book tokens, track queue position, and monitor live wait time. Admins sign in to run the queue, control token movement, and manage the full ledger with live synchronization across every connected screen.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Socket.io Client
- Backend: Node.js, Express, Socket.io, MongoDB, Mongoose
- Auth: JWT-based login with `user` and `admin` roles

## Features

- Landing login screen with separate User Login and Admin Login modes
- Role-based protected routes for `/user` and `/admin`
- Secure self-service registration for `user` accounts, with seeded admin access
- Book a token automatically for today or tomorrow without manual time input
- User dashboard with personal token, current serving token, tokens ahead, and ETA
- Smart in-app notifications with sound support, live countdowns, and ETA updates
- Installable PWA support with manifest, service worker, and install prompt
- Estimated waiting time based on average service time
- Admin dashboard with queue stats, full queue list, and queue controls
- Display board for public token screens
- Toast notifications, loading states, and error handling

## Project Structure

```text
nowait-system/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    sockets/
    utils/
  frontend/
    src/
      components/
      context/
      hooks/
      layouts/
      pages/
        auth/
        user/
        admin/
      services/
      utils/
```

## Environment Setup

1. Backend

   Copy [`backend/.env.example`](/c:/Users/hp/Desktop/New%20folder%20(16)/nowait-system/backend/.env.example) to `backend/.env` and update values as needed.

2. Frontend

   Copy [`frontend/.env.example`](/c:/Users/hp/Desktop/New%20folder%20(16)/nowait-system/frontend/.env.example) to `frontend/.env` if you want custom API or socket URLs.

## Run Locally

1. Start MongoDB locally or point `MONGO_URI` to your database.
2. Start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. Start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open:

   - Login screen: `http://localhost:5173`
   - User dashboard: `http://localhost:5173/user`
   - Admin dashboard: `http://localhost:5173/admin`
   - Display board: `http://localhost:5173/display`

## Default Demo Accounts

- User: `user / user123`
- Admin: `admin / admin123`

These accounts are seeded automatically from [`backend/.env.example`](/c:/Users/hp/Desktop/New%20folder%20(16)/nowait-system/backend/.env.example) the first time they do not exist. You can change them in `backend/.env`.

## Default Backend Routes

- `POST /api/login`
- `GET /api/me`
- `POST /api/book-token`
- `GET /api/queue`
- `GET /api/queue-status`
- `GET /api/bookings`
- `POST /api/start-serving`
- `POST /api/next-token`
- `POST /api/skip-token`
- `POST /api/reset`
- `POST /api/reset-queue`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Verification Completed

- Frontend lint: `npm run lint`
- Frontend production build: `npm run build`
- Backend syntax check: `node --check` across backend `.js` files
