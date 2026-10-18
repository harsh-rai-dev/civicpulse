# CivicPulse

CivicPulse is a civic complaint platform. Citizens report local issues with a photo, the community upvotes the ones that matter most and the municipal authority resolves them through a dispatch console with an official note.

## Features

- **Citizen portal**: register, log in, report an issue (category, zone, block, description, photo), upvote community issues, and track status.
- **Official portal**: a Dispatch Console with Critical, Pending, In Progress and Resolved queues. A complaint cannot be marked Resolved without an official note.
- **Vote-based priority**: new complaints start as Low. The Emergency checkbox is the only way to mark a complaint Critical. Otherwise priority follows upvotes: 0-2 Low, 3-4 Medium, 5 or more High.
- **Sorted queues**: complaints are ordered by priority, then votes, then oldest first.
- **Separate portals**: citizen credentials do not work on the Official portal, and the reverse. Status changes are checked for the admin role on the server.
- **Password reset**: OTP sent by email through EmailJS.
- **Public stats**: the Home page shows live complaint counts from the backend.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Axios, Lucide React
- **Backend**: Node.js, Express, TypeScript, JWT, bcrypt
- **Storage**: JSON file (`backend/data.json`), created automatically on first run
- **Shared**: common TypeScript types in `/shared`

## Folder Structure

- `/frontend`: React application (Vite)
- `/backend`: Express server
- `/shared`: shared TypeScript definitions

## Prerequisites

- Node.js v18 or higher
- npm

## Local Setup

1. **Clone the repository**
```bash
   git clone https://github.com/harsh-rai-dev/civicpulse.git
   cd civicpulse
```

2. **Backend**
```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
```
   The backend starts on [http://localhost:4000](http://localhost:4000).

3. **Frontend** (in a second terminal)
```bash
   cd frontend
   npm install
   npm run dev
```
   The frontend starts on [http://localhost:3000](http://localhost:3000) and talks to the backend through `/api`.

## Environment Variables

Set these in `backend/.env`:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Required. The server will not start without it. Use a long random value. |
| `PORT` | Backend port (default 4000). |
| `EMAILJS_SERVICE_ID` | EmailJS service ID, for password reset OTP emails. |
| `EMAILJS_TEMPLATE_ID` | EmailJS template ID. |
| `EMAILJS_PUBLIC_KEY` | EmailJS public key. |

## Demo Admin Login

These credentials are for demo purposes only.

- **URL**: [http://localhost:3000/login](http://localhost:3000/login) (choose Municipal Authority)
- **Email**: `admin@civicpulse.gov.in`
- **Password**: `Admin@1234`

## Deployment

CivicPulse can run on a single Linux server:

1. Build the backend (`npm run build` in `/backend`) and run it with a process manager such as PM2 (entry point: `dist/backend/src/app.js`).
2. Build the frontend (`npm run build` in `/frontend`) and serve the `dist` folder with nginx.
3. Configure nginx to proxy `/api/` to the backend, and set `client_max_body_size` high enough for photo uploads (complaint photos are sent as base64 in JSON).

It was demonstrated on an AWS EC2 t3.micro instance (Ubuntu 24.04) with nginx and PM2, over plain HTTP.
