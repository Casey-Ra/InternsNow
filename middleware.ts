import { NextRequest, NextResponse } from "next/server";

// Toggle enforcement via env var: set EDU_ENFORCEMENT=true to enable. Any other value or missing -> disabled.
// Determine enforcement: check if EDU_ENFORCEMENT is defined in server env (.env.local)
const hasEduEnv = typeof process.env.EDU_ENFORCEMENT !== "undefined";


let EDU_ENFORCEMENT = false;//If no EDU_ENFORCEMENT env var is set
if (hasEduEnv) { //If there is an EDU_ENFORCEMENT env var set
  if (process.env.EDU_ENFORCEMENT === "true") {
    EDU_ENFORCEMENT = true;
  }
  else {
    EDU_ENFORCEMENT = false;
}
} 



// Paths that should be accessible without .edu check
// exact matches (use strict equality)
const EXACT_PUBLIC_PATHS = [
  "/",
  "/favicon.ico",
  "/not-edu",
  "/student/login",
  "/student/register",
  "/about",
  "/contact",
];

// prefix matches (use startsWith)
const PREFIX_PUBLIC_PATHS = ["/_next", "/static", "/public", "/api", "/employer"];

export function middleware(request: NextRequest) {
  // If enforcement is disabled, allow all requests through
  if (!EDU_ENFORCEMENT) return NextResponse.next();
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PREFIX_PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    EXACT_PUBLIC_PATHS.some((p) => pathname === p)
  ) {
    return NextResponse.next();
  }

  const isEdu = request.cookies.get("is_edu")?.value;

  // If cookie explicitly false, redirect to /not-edu
  if (isEdu === "false") {
    return NextResponse.redirect(new URL("/not-edu", request.url));
  }

  // If cookie missing or not true, redirect to login so user can authenticate
  if (isEdu !== "true") {
    return NextResponse.redirect(new URL("/student/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // run middleware for all routes except Next.js internals (images, static)
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
