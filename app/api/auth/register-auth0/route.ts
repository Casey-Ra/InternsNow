import { NextResponse } from "next/server";

export async function GET() {
  const authUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize`);
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.AUTH0_CLIENT_ID!,
    redirect_uri: process.env.AUTH0_CALLBACK_URL!,
    scope: "openid profile email",
    screen_hint: "signup",
  }).toString();

  return NextResponse.redirect(authUrl.toString());
}
