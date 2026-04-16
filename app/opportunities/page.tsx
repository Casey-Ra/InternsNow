import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllInternships } from "@/app/lib/models/Internship";
import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";
import Link from "next/link";
import OpportunitiesList from "./OpportunitiesList";

export const dynamic = "force-dynamic";

async function getUserHints(): Promise<{ locations: string[]; keywords: string[] }> {
  try {
    const session = await auth0.getSession();
    if (!session) return { locations: [], keywords: [] };

    const auth0Sub = session.user.sub;

    // Get user_id and profile-level fields
    const userRes = await pool.query(
      `SELECT user_id, location, skills, interests FROM "USER" WHERE auth0_sub = $1`,
      [auth0Sub],
    );
    if (userRes.rows.length === 0) return { locations: [], keywords: [] };

    const u = userRes.rows[0];
    const userId = u.user_id;

    // Get location hints from work experience + profile location
    const workRes = await pool.query(
      `SELECT w.city, s.state_name, s.state_code
       FROM "WORK EXPERIENCE" w
       LEFT JOIN "US_STATES" s ON s.id = w.state_id
       WHERE w.user_id = $1`,
      [userId],
    );

    // Get keyword hints from majors + profile interests/skills
    const majorRes = await pool.query(
      `SELECT um.name
       FROM "USER MAJOR" um
       JOIN "EDUCATION" e ON e.edu_id = um.education_id
       WHERE e.user_id = $1`,
      [userId],
    );

    const profileLocation =
      typeof u.location === "string" ? u.location.trim() : "";

    const locations: string[] = [];
    if (profileLocation) {
      locations.push(profileLocation);
    } else {
      for (const w of workRes.rows) {
        if (w.city) locations.push(w.city);
        if (w.state_name) locations.push(w.state_name);
        if (w.state_code) locations.push(w.state_code);
      }
    }

    const keywords: string[] = [];
    for (const m of majorRes.rows) {
      if (m.name) keywords.push(m.name);
    }
    if (Array.isArray(u.interests)) keywords.push(...u.interests);
    if (Array.isArray(u.skills)) keywords.push(...u.skills);

    return {
      locations: [...new Set(locations.filter(Boolean))],
      keywords: [...new Set(keywords.filter(Boolean))],
    };
  } catch {
    return { locations: [], keywords: [] };
  }
}

export default async function OpportunitiesPage() {
  const [internships, userHints] = await Promise.all([
    getAllInternships(),
    getUserHints(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Jobs &amp; Internships
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Browse the latest internships and job opportunities submitted by employers.
            </p>
          </div>

          <OpportunitiesList internships={internships} userHints={userHints} />

          <div className="mt-10 flex justify-center">
            <Link
              href="/manage-internships"
              className="inline-flex items-center rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Manage &amp; Sync Jobs/Internships
            </Link>
          </div>
        </div>
      </main>

      <Footer variant="default" />
    </div>
  );
}
