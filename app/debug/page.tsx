import { auth0 } from "@/lib/auth0";

export default async function DebugPage() {
  const session = await auth0.getSession();

  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
