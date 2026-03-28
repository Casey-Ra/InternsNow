import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optional: type for session
interface Session {
  user?: Record<string, unknown>;
  accessToken?: string;
  idToken?: string;
  payload?: Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const session: Session | null = await auth0.getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    message: "This is a protected API route",
    user: session.user ?? null,
  });
}
