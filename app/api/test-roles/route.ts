import { auth0 } from "@/lib/auth0";

export async function GET() {
  const session = await auth0.getSession();

  return Response.json({
    roles: session.user["https://internsnow.com/claims/roles"],
  });
}
