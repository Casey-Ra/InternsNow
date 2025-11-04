// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0"; // path to your client file

// --- EDU enforcement setup ---
const hasEduEnv = typeof process.env.EDU_ENFORCEMENT !== "undefined";
let EDU_ENFORCEMENT = false;

if (hasEduEnv) {
  EDU_ENFORCEMENT = process.env.EDU_ENFORCEMENT === "true";
}

const EXACT_PUBLIC_PATHS = [
  "/",
  "/favicon.ico",
  "/not-edu",
  "/student/login",
  "/student/register",
  "/about",
  "/contact",
];

const PREFIX_PUBLIC_PATHS = [
  "/_next",
  "/static",
  "/public",
  "/api",
  "/employer",
];

// --- Middleware handler ---
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip EDU enforcement for static/public files
  if (
    PREFIX_PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    EXACT_PUBLIC_PATHS.some((p) => pathname === p)
  ) {
    // For all other requests, still let Auth0’s middleware handle session rolling, etc.
    return await auth0.middleware(request);
  }

  // 2. EDU enforcement logic
  if (EDU_ENFORCEMENT) {
    const isEdu = request.cookies.get("is_edu")?.value;

    if (isEdu === "false") {
      return NextResponse.redirect(new URL("/not-edu", request.url));
    }

    if (isEdu !== "true") {
      return NextResponse.redirect(new URL("/student/login", request.url));
    }
  }

  // 3. Finally, run Auth0’s middleware (handles auth/session)
  return await auth0.middleware(request);
}

// --- Matcher configuration ---
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
