# SYRA

SYRA is a full-stack web application providing a customizable voice/text assistant. The repository contains a Node.js + Express backend (MongoDB, Cloudinary, Gemini integration) and a React + Vite frontend.

## Tech stack
- Backend: Node.js, Express, MongoDB (Mongoose), Cloudinary, axios, JWT
- Frontend: React, Vite, TailwindCSS (optional), react-router
- Dev tools: nodemon (backend), Vite (frontend)

## Repository layout

```
README.md
backend/           # Express API server
  ├─ config/       # DB, token, cloudinary helpers
  ├─ controllers/  # auth & user controllers
  ├─ middlewares/  # auth, multer
  ├─ models/       # User model
  ├─ routes/       # auth and user routes
  ├─ index.js      # server entry
frontend/          # React app (Vite)
  ├─ src/
  └─ package.json
```

## Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- A MongoDB connection string (Atlas or local)
- (Optional) Cloudinary account for image uploads
- (Optional) Gemini-like API endpoint if using backend assistant integration

## Environment variables
Create a `.env` file in the `backend/` folder with the following keys (example):

```
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GEMINI_API_URL=https://your-gemini-api-endpoint
```

Notes:
- The backend expects the cookie named `token` (JWT) for authenticated routes.
- `GEMINI_API_URL` is used by the assistant integration in `backend/gemini.js`.

## Install & Run

Backend (API):

```powershell
cd backend
npm install
# create .env (see example above)
npm run dev
```

Frontend (development):

```powershell
cd frontend
npm install
npm run dev
```

Build frontend for production:

```powershell
cd frontend
npm run build
```

## Available scripts (from package.json)
- backend: `npm run dev` -> runs `nodemon index.js`
- frontend: `npm run dev` (vite), `npm run build`, `npm run preview`, `npm run lint`

## API Summary

Base URL (default for local dev): http://localhost:5000

Auth endpoints:
- POST /api/auth/signup — create a new user. Body: { name, email, password }
- POST /api/auth/signin — login. Body: { email, password }
- GET /api/auth/logout — clears the auth cookie

User endpoints (protected — cookie auth):
- GET /api/user/current — returns the current user (excludes password)
- POST /api/user/update — update assistant settings. Accepts form-data with `assistantImage` file or an `imageUrl` in body and `assistantName` in body
- POST /api/user/asktoassistant — send `command` in body to the assistant; returns JSON response from configured Gemini-like service

Authentication
- The server sets an HTTP-only cookie named `token` upon signup/signin. Requests to protected routes must include that cookie.

Example (curl) - note: curl doesn't send browser cookies by default; the frontend handles auth via cookies.

## Uploads/Images
- Image uploads are handled by multer and uploaded to Cloudinary via `backend/config/cloudinary.js`. Make sure Cloudinary env vars are set.

## Notes and tips
- CORS is configured in `backend/index.js` for `http://localhost:5173` (the frontend dev server). If you run the frontend on a different port, update the CORS origin.
- The assistant integration in `backend/gemini.js` expects the `GEMINI_API_URL` env var. Its response is parsed as JSON inside a string and certain `type` keys are handled in `askToAssistant`.

## Troubleshooting
- `db connected` not printed: verify `MONGODB_URL` and network access.
- `token not found` on protected routes: ensure the `token` cookie is present (login completed) and CORS credentials are enabled in frontend fetch/axios (withCredentials: true).
- Cloudinary upload issues: verify all Cloudinary env vars and that uploaded file path is accessible.

## Contributing
- Open an issue for feature requests or bugs.
- Create a branch per feature/fix and open a pull request against `main`.

## License
This project currently does not include a license file. Add `LICENSE` with your preferred license.

## Contact
Repository owner: Sanket Barhate

- Add a `.env.example` file to `backend/` with placeholders
- Add a short README in the `frontend/` and `backend/` folders with per-service instructions
"# SYRA Project" 
