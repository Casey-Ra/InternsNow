import { NextRequest, NextResponse } from "next/server";

// Toggle enforcement via env var: set EDU_ENFORCEMENT=false to disable in dev
const EDU_ENFORCEMENT = (() => {
  const v = process.env.EDU_ENFORCEMENT ?? process.env.NEXT_PUBLIC_EDU_ENFORCEMENT;
  if (!v) return true; // default on
  return !(v === "false" || v === "0" || v.toLowerCase() === "off");
})();

// Paths that should be accessible without .edu check
const PUBLIC_PATHS = [
  "/_next",
  "/favicon.ico",
  "/api",
  "/not-edu",
  "/student/login",
  "/student/register",
  "/employer",
  "/about",
  "/contact",
  "/public",
];

export function middleware(request: NextRequest) {
  // If enforcement is disabled, allow all requests through
  if (!EDU_ENFORCEMENT) return NextResponse.next();
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
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
