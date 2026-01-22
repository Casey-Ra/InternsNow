import { auth0 } from "@/lib/auth0";

export const GET = auth0.withApiAuthRequired(async (req) => {
  const session = req.auth;

  return Response.json({
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    idToken: session?.idToken ?? null,
    permissions: session?.payload?.permissions ?? null,
    scope: session?.payload?.scope ?? null,
  });
});
