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

## Development Workflow

We use a branching workflow with CI/CD. **Never push directly to `main`.**

### Branch Structure

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production code | Live site |
| `develop` | Staging/testing | Preview URL |
| `feature/description-of-feature` | New features | Preview URL |
| `fix/description-of-fix` | Bug fixes | Preview URL |

### Making Changes

```bash
# 1. Start from develop (always pull latest first)
git checkout develop
git pull origin develop

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes, then commit
git add .
git commit -m "Add your feature description"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Create a Pull Request on GitHub
#    Base: develop  ←  Compare: feature/your-feature-name
```

### Pull Request Process

1. **Create PR** to `develop` branch
2. **CI runs automatically** - tests, linting, build check
3. **Merge** after CI passes
4. **Delete** your feature branch after merging

### Releasing to Production

When `develop` is stable and tested:
1. Create PR from `develop` → `main`
2. After merge, Vercel auto-deploys to production

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run test       # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Run ESLint
npm run type-check # Run TypeScript type checking
```

### CI/CD Pipeline

On every Pull Request, GitHub Actions automatically runs:
- ✅ **Tests** - Jest unit tests
- ✅ **Linting** - ESLint code quality checks
- ✅ **Type Check** - TypeScript validation
- ✅ **Build** - Vercel production build

PRs cannot be merged if CI fails.
