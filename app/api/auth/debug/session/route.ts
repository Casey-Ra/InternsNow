import { auth0 } from "@/lib/auth0";

export const GET = auth0.withApiAuthRequired(async function getSession() {
  const session = await auth0.getSession();

  return Response.json({
    sessionUser: session?.user || null,
    idToken: session?.idToken || null,
    accessToken: session?.accessToken || null,
  });
});
