# InternsNow AI Coding Instructions

## Architecture Overview
InternsNow is a full-stack Next.js 15 application with App Router connecting students and employers for internship opportunities. The architecture uses Next.js API routes as the backend (no separate server), PostgreSQL with direct SQL queries, and JWT authentication.

## Development Patterns

### Database & Models
- **Direct SQL approach**: Use parameterized queries with `pg` pool (`app/lib/db.ts`)
- **Model pattern**: Functions in `app/lib/models/User.ts` like `createUser()`, `findUserByUsername()`
- **Table initialization**: Models auto-create tables on import (see User.ts `init()` function)
- **Connection**: Support multiple env vars: `POSTGRES_URL || DATABASE_URL || PG_URI`
- **SSL**: Automatically handle production SSL: `ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false`

### API Routes (Next.js App Router)
- **Location**: `app/api/auth/[action]/route.ts` pattern
- **Request handling**: Use `NextRequest.json()` for body parsing
- **Response pattern**: Always return `NextResponse.json()` with consistent structure:
  ```ts
  return NextResponse.json({ error: "Message" }, { status: 400 });
  return NextResponse.json({ msg: "Success", data: result });
  ```
- **Error handling**: Catch DB unique constraint errors (code "23505") for user-friendly messages

### Authentication & Security
- **JWT pattern**: Sign with `process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET`
- **Password hashing**: Use `bcryptjs` with salt rounds of 10
- **Environment**: Support multiple JWT secret sources for flexibility

### Component Architecture
- **Variant-based components**: Use discriminated unions for flexible theming (see `Header.tsx`)
- **Page structure**: Always include `<Header variant="student|employer" />` and `<Footer variant="..." />`
- **Styling**: Tailwind with dark mode support using `dark:` prefix
- **Layout pattern**: Consistent wrapper: `min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800`

### File Organization
- **Pages**: Role-based directories (`app/student/`, `app/employer/`)
- **Shared components**: Root-level `components/` directory
- **Business logic**: `app/lib/` for database, models, utilities
- **Path aliases**: Use `@/*` for root-relative imports

### Development Workflow
- **Dev server**: `npm run dev --turbopack` (Turbopack enabled for faster builds)
- **Environment**: Copy `.env.example` to `.env.local` for local development
- **Database setup**: Create local PostgreSQL database matching connection string
- **Production**: Vercel + Neon PostgreSQL with automatic environment variable injection

### UI Patterns
- **Color schemes**: Blue for students (`bg-blue-600`), green for employers (`bg-green-600`)
- **Navigation**: Variant-specific nav links and CTAs in Header component
- **Forms**: Consistent input styling with focus states and dark mode
- **Cards**: White/gray-800 backgrounds with rounded-xl and shadow-lg

### Key Dependencies
- **Runtime**: Next.js 15, React 19, TypeScript
- **Database**: `pg` (PostgreSQL driver)
- **Auth**: `bcryptjs` + `jsonwebtoken`
- **Styling**: Tailwind CSS v4