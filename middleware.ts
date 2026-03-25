import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

function hasAuth0Config() {
  const requiredValues = [
    process.env.APP_BASE_URL,
    process.env.AUTH0_DOMAIN,
    process.env.AUTH0_CLIENT_ID,
    process.env.AUTH0_CLIENT_SECRET,
    process.env.AUTH0_SECRET,
  ];

  return requiredValues.every((value) => typeof value === "string" && value.trim());
}

export async function middleware(request: NextRequest) {
  // Keep /auth/login stable in CI/dev only when Auth0 is intentionally unavailable.
  if (
    process.env.NODE_ENV !== "production" &&
    request.nextUrl.pathname === "/auth/login" &&
    !hasAuth0Config()
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    return await auth0.middleware(request);
  } catch (error) {
    // Avoid hard 500s from middleware invocation failures. Route-level handlers
    // still enforce auth and permissions where required.
    console.error("Auth0 middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
