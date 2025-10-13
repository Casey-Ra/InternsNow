import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Clear the is_edu cookie and redirect to Auth0 logout (so session is cleared there too)
  const returnTo = process.env.AUTH0_LOGOUT_REDIRECT || "http://localhost:3000/";

  const auth0Logout = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  auth0Logout.search = new URLSearchParams({
    client_id: process.env.AUTH0_CLIENT_ID || "",
    returnTo,
  }).toString();

  const res = NextResponse.redirect(auth0Logout.toString());
  // clear cookie
  res.cookies.set("is_edu", "", { maxAge: 0, path: "/" });
  return res;
}
