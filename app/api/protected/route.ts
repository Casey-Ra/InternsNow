import { auth0 } from "@/lib/auth0";

export const GET = auth0.withApiAuthRequired(async function handler() {
  const session = await auth0.getSession();

  return Response.json({
    message: "This is a protected API route",
    user: session?.user,
  });
});
