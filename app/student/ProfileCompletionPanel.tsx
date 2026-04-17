import Link from "next/link";
import pool from "@/lib/db";
import { getProfileCompletionSummary as buildProfileCompletionSummary } from "@/app/lib/utils/profileCompletion";

type ProfileCompletionPanelProps = {
  auth0Sub: string;
};

async function getProfileCompletionSummary(
  auth0Sub: string,
): Promise<ReturnType<typeof buildProfileCompletionSummary>> {
  let row:
    | {
        location?: string | null;
        bio?: string | null;
        skills_count?: number | string | null;
        interests_count?: number | string | null;
        linkedin?: string | null;
        github?: string | null;
        portfolio?: string | null;
        education_count?: number | string | null;
        work_count?: number | string | null;
      }
    | undefined;

  try {
    const result = await pool.query(
      `
        SELECT
          NULLIF(TRIM(location), '') AS location,
          NULLIF(TRIM(bio), '') AS bio,
          COALESCE(array_length(skills, 1), 0) AS skills_count,
          COALESCE(array_length(interests, 1), 0) AS interests_count,
          NULLIF(TRIM(linkedin), '') AS linkedin,
          NULLIF(TRIM(github), '') AS github,
          NULLIF(TRIM(portfolio), '') AS portfolio,
          (
            SELECT COUNT(*)
            FROM "EDUCATION" e
            WHERE e.user_id = "USER".user_id
          ) AS education_count,
          (
            SELECT COUNT(*)
            FROM "WORK EXPERIENCE" w
            WHERE w.user_id = "USER".user_id
          ) AS work_count
        FROM "USER"
        WHERE auth0_sub = $1
        LIMIT 1
      `,
      [auth0Sub],
    );

    row = result.rows[0] as typeof row;
  } catch (error) {
    console.error("Failed to load profile completion summary:", error);
  }

  return buildProfileCompletionSummary({
    location: row?.location,
    bio: row?.bio,
    skillsCount: Number(row?.skills_count ?? 0),
    interestsCount: Number(row?.interests_count ?? 0),
    educationCount: Number(row?.education_count ?? 0),
    workCount: Number(row?.work_count ?? 0),
    linkedin: row?.linkedin,
    github: row?.github,
    portfolio: row?.portfolio,
  });
}

export default async function ProfileCompletionPanel({
  auth0Sub,
}: ProfileCompletionPanelProps) {
  const summary = await getProfileCompletionSummary(auth0Sub);

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-xl dark:border-white/10 dark:bg-gray-800/70">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
            Profile Completion
          </p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            {summary.percent}% complete
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
            A stronger profile leads to better matching, cleaner applications,
            and more relevant opportunities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/student/profile/view"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            View Profile
          </Link>
          <Link
            href="/student/profile/edit"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
            style={{ width: `${summary.percent}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {summary.completed} of {summary.total} profile signals are filled in.
        </p>
      </div>

      {summary.nextSteps.length > 0 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {summary.nextSteps.slice(0, 3).map((step) => (
            <div
              key={step}
              className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-gray-700 dark:bg-slate-900/40 dark:text-gray-200"
            >
              {step}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-4 text-sm text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          Your profile is in great shape. Keep it updated as you gain new
          experience.
        </div>
      )}
    </section>
  );
}
