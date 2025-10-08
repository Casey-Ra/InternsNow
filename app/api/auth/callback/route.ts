import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/app/lib/models/User";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 },
      );
    }

    // Prepare token exchange request
    const response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          code,
          redirect_uri: process.env.AUTH0_CALLBACK_URL,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth0 token exchange failed:", errorText);
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: 500 },
      );
    }

    const tokens = await response.json();

    console.log("Auth0 Tokens received:", tokens);

    const idToken = tokens.id_token;
    const userInfoResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );
    const userInfo = await userInfoResponse.json();

    console.log("Authenticated user info:", userInfo);

    console.log("Auth0 user info received:", userInfo);

    await createUser(userInfo.sub, userInfo.email, "student");

    // Redirect the user to a page (e.g dashboard)
    return NextResponse.redirect("http://localhost:3000/");
  } catch (err: any) {
    console.error("Auth0 callback error:", err);
    return NextResponse.json(
      { error: "Auth0 callback failed", details: err.message },
      { status: 500 },
    );
  }
}
