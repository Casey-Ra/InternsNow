import { auth0 } from "@/lib/auth0";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
  const screenHint = request.nextUrl.searchParams.get("screen_hint");

  try {
    return await auth0.startInteractiveLogin({
      returnTo,
      authorizationParameters: screenHint ? { screen_hint: screenHint } : undefined,
    });
  } catch (error) {
    console.error("Auth0 login start failed:", error);
    return new Response("Auth0 login is not configured correctly.", {
      status: 500,
    });
  }
}
