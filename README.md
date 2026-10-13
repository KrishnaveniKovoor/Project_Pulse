# ProjectPulse

ProjectPulse is a full-stack project management application for teams and organizations. It helps manage organizations, projects, teams, tasks, sprints, milestones, issues, comments, notifications, and activity tracking in a single dashboard.

## Features

- Organization management
- User and role-based access control
- Project creation and membership management
- Team and team member management
- Task planning and tracking
- Sprint management
- Milestone tracking
- Issue tracking
- Comments and discussions
- Notifications and activity feeds
- Dashboard-style reporting and project stats

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- CORS and dotenv configuration

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- lucide-react

## Project Structure

```text
ProjectPulse_Final/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── uploads/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
├── .gitignore
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ installed
- MongoDB running locally or a reachable MongoDB Atlas connection
- npm installed

## Backend Setup

1. Open the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create or update the `.env` file in `backend/` with values similar to:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/projectpulse
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
DNS_SERVERS=1.1.1.1,8.8.8.8
```

4. Start the backend server:

```bash
npm run dev
```

The API runs by default on:

```text
http://localhost:5000
```

## Frontend Setup

1. Open the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend runs by default on:

```text
http://localhost:5173
```

## Deployment Guide & Troubleshooting

### Why Registration Fails on Deployment (and How to Fix It)

1. **Missing or Incorrect `VITE_API_URL` on the Frontend:**
   - The React frontend needs to know where your backend API is hosted.
   - In your frontend host (e.g. Vercel / Netlify dashboard), add an Environment Variable:
     ```env
     VITE_API_URL=https://your-backend-service.onrender.com/api
     ```
   - *Note:* Vite embeds environment variables at **build time**. After adding or modifying `VITE_API_URL`, you must trigger a **Redeploy / Rebuild** on Vercel/Netlify.
   - If `VITE_API_URL` is omitted, the frontend defaults to `/api`, sending requests to the frontend static host (which returns 404 or index.html instead of communicating with the backend).

2. **CORS Restrictions on Backend:**
   - The backend checks `CLIENT_URL` to allow requests from your frontend domain.
   - In your backend host (e.g. Render / Railway dashboard), set:
     ```env
     CLIENT_URL=https://your-frontend.vercel.app
     ```
   - The backend also automatically allows `*.vercel.app`, `*.netlify.app`, `*.onrender.com`, and localhost.

3. **MongoDB Atlas Network Access (IP Whitelist):**
   - Cloud hosts (Render, Railway, etc.) use dynamic outbound IPs.
   - In your MongoDB Atlas dashboard:
     - Go to **Network Access** -> **Add IP Address**.
     - Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
     - Without this, the backend cannot connect to MongoDB and registration will fail.

4. **Missing Backend Environment Variables:**
   - In Render / Railway / Heroku, make sure the following variables are set:
     - `MONGODB_URI`: your full MongoDB connection string (e.g. `mongodb+srv://...`)
     - `JWT_SECRET`: your secret key for token signing (e.g. a 32+ character random string)
     - `CLIENT_URL`: your frontend deployment URL
     - `NODE_ENV`: `production`

5. **SPA Page Refresh & Direct Navigation (404 Not Found):**
   - Single Page Applications require rewrite rules so that paths like `/register`, `/login`, and `/dashboard` load `index.html`.
   - `frontend/vercel.json` and `frontend/public/_redirects` are included to handle rewrites on Vercel and Netlify.

### Quick Deployment Setup

#### Backend (e.g. Render / Railway)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check Endpoint:** `/api/health` or `/`
- **Required Environment Variables:** `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

#### Frontend (e.g. Vercel / Netlify)
- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Required Environment Variable:** `VITE_API_URL=https://<your-backend-url>/api`

## Seed Data

The backend includes a seeding script that creates demo data and default users.

Run:

```bash
cd backend
npm run seed
```

This creates sample organization, users, teams, projects, tasks, sprints, milestones, and issues.

### Default seeded users

- Admin: `admin@projectpulse.com` / `password123`
- Project Manager: `pm@projectpulse.com` / `password123`
- Developer: `dev@projectpulse.com` / `password123`
- Stakeholder: `stakeholder@projectpulse.com` / `password123`

## API Overview

The backend exposes REST endpoints under `/api` for:

- Authentication: `/api/auth`
- Users: `/api/users`
- Organizations: `/api/organizations`
- Teams: `/api/teams`
- Projects: `/api/projects`
- Tasks: `/api/tasks`
- Sprints: `/api/sprints`
- Milestones: `/api/milestones`
- Issues: `/api/issues`
- Comments: `/api/comments`
- Notifications: `/api/notifications`
- Activities: `/api/activities`
- Attachments: `/api/attachments`
- Reports: `/api/reports`

## Production Build

### Frontend production build

```bash
cd frontend
npm run build
```

### Backend production start

```bash
cd backend
npm start
```

## Notes

- The backend uses JWT-based authentication and role-based authorization.
- The frontend is configured to connect to the backend through the `CLIENT_URL` and API host configuration.
- If your environment uses MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

## License

This project is provided as a local development project and does not include a formal license file unless added later.
