import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";
import {
  DEFAULT_STUDENT_MAJOR,
  getStudentMajorsOrDefault,
} from "@/app/lib/utils/studentDefaults";

export type DiscoveryPreferences = {
  locations: string[];
  keywords: string[];
  major: string;
  source: "default" | "profile";
};

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean),
    ),
  );
}

export async function getDiscoveryPreferences(): Promise<DiscoveryPreferences> {
  const defaultPreferences: DiscoveryPreferences = {
    locations: [],
    keywords: [DEFAULT_STUDENT_MAJOR],
    major: DEFAULT_STUDENT_MAJOR,
    source: "default",
  };

  try {
    const session = await auth0.getSession();
    const auth0Sub =
      typeof session?.user?.sub === "string" ? session.user.sub : null;

    if (!auth0Sub) {
      return defaultPreferences;
    }

    const userRes = await pool.query(
      `SELECT user_id, location, skills, interests FROM "USER" WHERE auth0_sub = $1 LIMIT 1`,
      [auth0Sub],
    );

    if (userRes.rows.length === 0) {
      return defaultPreferences;
    }

    const user = userRes.rows[0];
    const userId = user.user_id as number;

    const [workRes, majorRes] = await Promise.all([
      pool.query(
        `SELECT w.city, s.state_name, s.state_code
         FROM "WORK EXPERIENCE" w
         LEFT JOIN "US_STATES" s ON s.id = w.state_id
         WHERE w.user_id = $1`,
        [userId],
      ),
      pool.query(
        `SELECT um.name
         FROM "USER MAJOR" um
         JOIN "EDUCATION" e ON e.edu_id = um.education_id
         WHERE e.user_id = $1`,
        [userId],
      ),
    ]);

    const profileLocation =
      typeof user.location === "string" ? user.location.trim() : "";

    const locations = profileLocation
      ? [profileLocation]
      : unique(
          workRes.rows.flatMap((row) => [row.city, row.state_name, row.state_code]),
        );

    const majors = getStudentMajorsOrDefault(
      majorRes.rows.map((row) =>
        typeof row.name === "string" ? row.name : null,
      ),
    );

    const rawInterests = Array.isArray(user.interests) ? user.interests : [];
    const rawSkills = Array.isArray(user.skills) ? user.skills : [];
    const interests = rawInterests.filter(
      (value: unknown): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
    const skills = rawSkills.filter(
      (value: unknown): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );

    const hasSavedMajor = majorRes.rows.some(
      (row) => typeof row.name === "string" && row.name.trim().length > 0,
    );
    const hasProfileSignal =
      Boolean(profileLocation) ||
      locations.length > 0 ||
      hasSavedMajor ||
      interests.length > 0 ||
      skills.length > 0;

    return {
      locations,
      keywords: unique([...majors, ...interests, ...skills]),
      major: majors[0] ?? DEFAULT_STUDENT_MAJOR,
      source: hasProfileSignal ? "profile" : "default",
    };
  } catch {
    return defaultPreferences;
  }
}
