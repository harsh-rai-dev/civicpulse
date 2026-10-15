# CivicPulse

CivicPulse is a local-only academic application designed to help citizens report civic issues and track their status, while providing municipal authorities with a prioritized queue for action.

## Tech Stack

- **Frontend**: React + Vite, TypeScript, Axios, Lucide React
- **Backend**: Node.js + Express, TypeScript, JSON file-based storage
- **Shared**: Shared TypeScript types for data consistency

## Prerequisites

- Node.js (v18 or higher)
- npm

## Folder Structure

- `/frontend`: React application (Vite)
- `/backend`: Node.js/Express server
- `/shared`: Shared TypeScript definitions

## Setup Steps

1. **Clone the repository** (if not already done).

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env to add your secrets if necessary
   npm run dev
   ```
   The backend will start on [http://localhost:4000](http://localhost:4000).

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will start on [http://localhost:3000](http://localhost:3000).

## Default Admin Login

- **URL**: [http://localhost:3000/login](http://localhost:3000/login) (Select Municipal Authority Portal)
- **Email**: `admin@civicpulse.gov.in`
- **Password**: `Admin@1234`

## Features

- **Citizen Portal**: Report issues, track progress, upvote community issues.
- **Official Portal**: View prioritized issue queue, update status, and provide resolution notes.
- **Priority Engine**: Automatic priority calculation based on category, emergency status, and upvotes.
- **Local Storage**: All data is stored locally in `backend/data.json`.
