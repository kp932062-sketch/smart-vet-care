# VetCare Platform

VetCare is a full-stack veterinary clinic platform with a Node.js/Express backend and a React/Vite frontend.

## Project Structure

- backend: API server, business logic, database access (MySQL + Prisma)
- frontend: Client web app (React + Vite)
- docs: Project documentation and reports

## Tech Stack

- Backend: Node.js, Express, Prisma, MySQL
- Frontend: React, Vite, Axios
- Realtime: Socket.IO

## Environment Variables

### Backend

Create backend/.env from backend/.env.example and fill real values.

Required variables:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- DATABASE_URL
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD

### Frontend

Create frontend/.env from frontend/.env.example.

- VITE_API_URL=http://localhost:5000/api
- VITE_SOCKET_URL=http://localhost:5000

Local MySQL default in this workspace is 127.0.0.1:3310.

## Local Setup

1. Install backend dependencies

```bash
cd backend
npm install
```

2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

3. Start backend

```bash
cd ../backend
npm run dev
```

4. Start frontend

```bash
cd ../frontend
npm run dev
```

Frontend default URL: http://localhost:5173
Backend health URL: http://localhost:5000/api/health
Database default URL: mysql://smartvet_user:***@127.0.0.1:3310/smartvet

## Production Notes

- Do not commit .env files.
- Use strong secrets for JWT and admin credentials.
- Configure CORS_ORIGIN and FRONTEND_URL for deployed domains.
- Keep uploads and logs outside the repository.
- Use a managed MySQL instance in production.

## Security Checklist

- Secrets replaced with placeholders in tracked files
- .gitignore excludes env files, logs, uploads, local DB artifacts, and node_modules
- Removed legacy env templates containing conflicting DB settings

## Run Helpers

Root scripts:

- start-vetcare.ps1: starts local MySQL, backend, frontend
- start-vetcare.bat: PowerShell-policy-safe wrapper for start-vetcare.ps1
- start-local-mysql.bat: PowerShell-policy-safe wrapper for start-local-mysql.ps1
- start-website.bat: starts backend + frontend
- stop-website.bat: stops helper terminal windows

# smart-vet-care
