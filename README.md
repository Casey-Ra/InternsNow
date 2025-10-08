# InternsNow

A modern internship platform connecting students with opportunities, built with Next.js and PostgreSQL.

## Architecture

This is a full-stack Next.js application with:
- **Frontend**: React components with Tailwind CSS
- **Backend**: Next.js API routes (no separate server needed)
- **Database**: PostgreSQL (local development) / Neon (production)
- **Authentication**: JWT-based auth system

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update the database connection in `.env.local`:
```env
PG_URI=postgresql://your_username@localhost:5432/internsnow
JWT_SECRET=your_secure_jwt_secret_here

# Auth0 Configuration
(ask project owner for this information)
AUTH0_DOMAIN=dev-xxxxxx.us.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_CALLBACK_URL=http://localhost:3000/api/auth/callback
```

### 3. Set Up Local Database
Install PostgreSQL if you haven't:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb internsnow
```

### 4. Run Development Server
```bash
npm run dev
```

Your app will be available at:
- **Frontend**: http://localhost:3000
- **API Routes/Backend**: http://localhost:3000/api

## API Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User authentication

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with `pg` driver
- **Authentication**: JWT with bcryptjs
- **Deployment**: Vercel + Neon
