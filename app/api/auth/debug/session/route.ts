import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define session type if needed
interface Session {
  user?: any;
  accessToken?: string;
  idToken?: string;
  payload?: {
    [key: string]: any;
  };
}

export async function GET(req: NextRequest) {
  const session: Session | null = await auth0.getSession(req);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    sessionUser: session.user ?? null,
    idToken: session.idToken ?? null,
    accessToken: session.accessToken ?? null,
  });
}
