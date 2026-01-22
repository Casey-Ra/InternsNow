import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the shape of your session payload
interface SessionPayload {
  permissions?: string[];
  scope?: string;
  [key: string]: any;
}

interface Session {
  user?: any;
  accessToken?: string;
  idToken?: string;
  payload?: SessionPayload;
}

export async function GET(req: NextRequest) {
  // Tell TypeScript the type of session
  const session: Session | null = await auth0.getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user ?? null,
    accessToken: session.accessToken ?? null,
    idToken: session.idToken ?? null,
    permissions: session.payload?.permissions ?? null,
    scope: session.payload?.scope ?? null,
  });
}
