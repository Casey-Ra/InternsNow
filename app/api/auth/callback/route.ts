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

    const email: string | undefined = userInfo.email;
    const isEdu = !!email && email.toLowerCase().endsWith(".edu");

<<<<<<< Updated upstream
    // If user is .edu, create/update them in our DB and allow access.
    if (isEdu) {
      await createUser(userInfo.sub, email, "student");

      const res = NextResponse.redirect(new URL("/", request.url));
      res.cookies.set("is_edu", "true", {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res;
    }

    // Non-.edu users: do not create an account and redirect to a notice page.
    const res = NextResponse.redirect(new URL("/not-edu", request.url));
    // set a short-lived cookie so middleware can detect non-edu users and block access
    res.cookies.set("is_edu", "false", {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // expire quickly (10 minutes)
      maxAge: 60 * 10,
    });
    return res;
=======
    // Redirect the user to a page (e.g dashboard)
    //return NextResponse.redirect("http://localhost:3000/"); for local dev
    return NextResponse.redirect(
      "https://internsnow-1iwbokzpm-interns-now.vercel.app",
    );
>>>>>>> Stashed changes
  } catch (err: any) {
    console.error("Auth0 callback error:", err);
    return NextResponse.json(
      { error: "Auth0 callback failed", details: err.message },
      { status: 500 },
    );
  }
}
