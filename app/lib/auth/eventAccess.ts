import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";

const ROLE_CLAIM_KEY = "https://internsnow.com/claims/roles";

export interface EventActor {
  sub: string;
  email: string | null;
  roles: string[];
  isAdmin: boolean;
}

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function extractClaimRoles(user: Record<string, unknown>): string[] {
  const claimValue = user[ROLE_CLAIM_KEY];
  if (!Array.isArray(claimValue)) {
    return [];
  }

  return claimValue
    .map((role) => (typeof role === "string" ? normalizeRole(role) : ""))
    .filter(Boolean);
}

async function getDbRole(auth0Id: string): Promise<string | null> {
  try {
    const result = await pool.query(
      "SELECT role FROM users WHERE auth0_id = $1 LIMIT 1",
      [auth0Id],
    );
    const role = result.rows[0]?.role;
    return typeof role === "string" ? normalizeRole(role) : null;
  } catch {
    return null;
  }
}

function isAdminRole(role: string): boolean {
  return role === "admin" || role === "superadmin";
}

export async function getEventActor(): Promise<EventActor | null> {
  try {
    const session = await auth0.getSession();
    const user = session?.user as Record<string, unknown> | undefined;

    if (!user || typeof user.sub !== "string") {
      return null;
    }

    const dbRole = await getDbRole(user.sub);
    const claimRoles = extractClaimRoles(user);
    const roles = Array.from(
      new Set([
        ...claimRoles,
        ...(dbRole ? [dbRole] : []),
      ]),
    );

    return {
      sub: user.sub,
      email: typeof user.email === "string" ? user.email : null,
      roles,
      isAdmin: roles.some(isAdminRole),
    };
  } catch (error) {
    console.error("Failed to resolve event actor:", error);
    return null;
  }
}

export function canManageEvent(
  eventOwnerSub: string | null,
  actor: EventActor,
): boolean {
  if (actor.isAdmin) {
    return true;
  }
  return Boolean(eventOwnerSub && eventOwnerSub === actor.sub);
}
