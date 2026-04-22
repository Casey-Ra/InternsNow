import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllInternships } from "@/app/lib/models/Internship";
import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";
import Link from "next/link";
import OpportunitiesList from "./OpportunitiesList";
import SeekingToggle from "@/components/SeekingToggle";
import { getDiscoveryPreferences } from "@/app/lib/utils/discoveryPreferences";

export const dynamic = "force-dynamic";

async function getUserSeeking(): Promise<"job" | "internship" | "both" | null> {
  try {
    const session = await auth0.getSession();
    if (!session) return null;
    const res = await pool.query(
      `SELECT seeking FROM "USER" WHERE auth0_sub = $1 LIMIT 1`,
      [session.user.sub],
    );
    const v = res.rows[0]?.seeking;
    return v === "job" || v === "internship" || v === "both" ? v : null;
  } catch {
    return null;
  }
}

export default async function OpportunitiesPage() {
  const [internships, discoveryPreferences, seeking] = await Promise.all([
    getAllInternships(),
    getDiscoveryPreferences(),
    getUserSeeking(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Jobs &amp; Internships
              </h1>
              {seeking !== null ? (
                <SeekingToggle initial={seeking} showApplyButton />
              ) : null}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Browse the latest opportunities submitted by employers.
            </p>
          </div>

          <OpportunitiesList
            internships={internships}
            userHints={discoveryPreferences}
          />

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
