# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server with Turbopack on http://localhost:3000
npm run build            # Build for production
npm run lint             # Run ESLint (max 100 warnings allowed)
npm run type-check       # TypeScript type checking
npm run test             # Run Jest unit tests
npm run test:watch       # Jest watch mode
npm run cypress          # Open Cypress UI
npm run cypress:headless # Run Cypress tests headlessly
npm run cypress:e2e      # Run E2E tests only
npm run cypress:component # Run component tests only
```

To run a single Jest test file:
```bash
npx jest path/to/file.test.ts
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `POSTGRES_URL` | `DATABASE_URL` | `PG_URI` — PostgreSQL connection (all three variable names are supported)
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET`, `AUTH0_CALLBACK_URL` — from project owner
- `JWT_SECRET` — for JWT signing

## Architecture

**InternsNow** is a Next.js 15 App Router application connecting students with internship opportunities. It uses PostgreSQL (Neon in production), Auth0 for authentication, and deploys to Vercel.

### Directory Structure

- `app/` — Next.js pages, layouts, and API routes
  - `api/` — API endpoints grouped by resource (`auth/`, `internships/`, `events/`, `lookups/`, `profile/`)
  - `lib/` — Business logic: `db.ts` (connection pool), `models/` (data entities), `auth/` (authorization), `utils/` (helpers + unit tests)
  - `student/` — Student-facing dashboard pages
  - `intake/` — Quick Match quiz for new students
- `components/` — Shared React components
- `cypress/` — E2E and component tests

### Authentication

Auth0 is the authentication provider. `middleware.ts` wraps all requests. Client components use `useUser()` from `@auth0/nextjs-auth0/client`; server code uses session utilities from `@auth0/nextjs-auth0/server`.

Roles are stored in two places and checked in this order:
1. Auth0 custom claim: `https://internsnow.com/claims/roles`
2. Database fallback: `users.role` column

Role authorization logic lives in `app/lib/auth/eventAccess.ts`.

### Database Layer

PostgreSQL via `pg` Pool. Models in `app/lib/models/` handle all CRUD:
- `User.ts` — Auth0 integration (`auth0_id`, `email`, `role`)
- `Internship.ts` — UUID primary key, unique URL constraints
- `Event.ts` — Soft deletes via `deleted_at` timestamp
- `FluencyTest.ts` — AI assessment data

Use parameterized queries (`$1`, `$2`, ...). SSL is auto-enabled for non-local hosts.

### API Conventions

- Response format: `{ msg: "...", data: {...} }` for success, `{ error: "..." }` for failures
- Status codes: 201 creation, 400 validation, 401 auth, 409 conflict (unique constraint), 500 server error
- Catch PostgreSQL error code `"23505"` for unique constraint violations
- Use `revalidatePath()` after mutations to invalidate ISR cache
- Lookup/search APIs return empty arrays (not 500) when DB is unavailable

### Component Conventions

- **Variant pattern**: Components accept `variant` prop with discriminated union (e.g., `Header` accepts `"student" | "employer" | "default"`)
- **Theming**: Blue for students, green for employers; Tailwind `dark:` prefix throughout
- **Path aliases**: Use `@/*` for root-relative imports

### Git Workflow

Branch strategy: `main` (production) → `develop` (staging) → `feature/*` (features). Always PR to `develop` first, then promote to `main`. See `WORKFLOW.md` for details.

### Testing Notes

See `TODO_TESTING_COMPAT.md` for known CI/testing limitations. The test suite assumes database availability; Cypress specs use mock Auth0 values in CI. Some compatibility shims exist (empty array returns) to avoid 500 errors in CI without a real database.
