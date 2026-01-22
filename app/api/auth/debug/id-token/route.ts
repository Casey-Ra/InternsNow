import { auth0 } from "@/lib/auth0";

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return Response.json({ error: "No session" });
  }

  return Response.json({
    user: session.user,
    tokenSet: session.tokenSet,
  });
}
