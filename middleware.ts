import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

function isPlaceholder(value?: string) {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized === "ci-example.auth0.com" ||
    normalized === "ci-client-id" ||
    normalized === "ci-client-secret" ||
    normalized === "ci-test-secret-not-for-production"
  );
}

function hasAuth0Config() {
  const requiredValues = [
    process.env.AUTH0_DOMAIN,
    process.env.AUTH0_CLIENT_ID,
    process.env.AUTH0_CLIENT_SECRET,
    process.env.AUTH0_SECRET,
  ];

  return (
    requiredValues.every(
      (value) => typeof value === "string" && value.trim(),
    ) && requiredValues.every((value) => !isPlaceholder(value))
  );
}

export async function middleware(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth/");
  const allowFallbackRedirect =
    process.env.NODE_ENV !== "production" && isAuthRoute;

  // Keep /auth/login stable in CI/dev only when Auth0 is intentionally unavailable.
  if (allowFallbackRedirect && !hasAuth0Config()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("auth0", "unavailable");
    return NextResponse.redirect(loginUrl);
  }

  try {
    return await auth0.middleware(request);
  } catch (error) {
    // Avoid hard 500s from middleware invocation failures. Route-level handlers
    // still enforce auth and permissions where required.
    console.error("Auth0 middleware error:", error);

    if (allowFallbackRedirect) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("auth0", "unavailable");
      return NextResponse.redirect(loginUrl);
    }

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
