import type { Metadata } from "next";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HustleScorePanel from "@/components/hustle/HustleScorePanel";
import ProfileCompletionPanel from "./ProfileCompletionPanel";
import pool from "@/lib/db";

export const metadata: Metadata = {
  title: "Student Portal - Find Your Dream Internship | InternsNow",
  description:
    "Discover internships and entry-level positions at top companies. Build your experience, network with professionals, and kickstart your dream career.",
  keywords: [
    "student jobs",
    "internships",
    "entry level",
    "career opportunities",
    "college students",
  ],
  openGraph: {
    title: "Student Portal - Find Your Dream Internship | InternsNow",
    description:
      "Discover internships and entry-level positions at top companies.",
    url: "https://internsnow.vercel.app/student",
  },
};

export default async function StudentLandingPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const auth0Sub =
    typeof session.user.sub === "string" ? session.user.sub : null;

  if (!auth0Sub) {
    redirect("/auth/login");
  }

  const seekingResult = await pool.query(
    `SELECT seeking FROM "USER" WHERE auth0_sub = $1 LIMIT 1`,
    [auth0Sub],
  ).catch(() => null);
  const seeking = seekingResult?.rows[0]?.seeking as "job" | "internship" | "both" | null ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      {/* Hero Section */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <HustleScorePanel />

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center mb-16">
            <div>
              <p className="text-lg font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300 mb-4">
                Student Home
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome Back
                <span className="text-blue-600 block">Keep Your Momentum Moving</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
                Show up, stay active, and keep building momentum. Your home
                screen is set up to make the next move feel obvious.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/opportunities"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow hover:bg-blue-500"
                >
                  {seeking === "job"
                    ? "Jobs for you"
                    : seeking === "internship"
                      ? "Internships for you"
                      : "Jobs & Internships for you"}
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-7 py-4 text-base font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Events for you
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white/70 dark:bg-gray-800/70 border border-white/70 dark:border-white/10 p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Stay In Motion
              </h2>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Keep your rhythm up this week. Consistency matters, and the
                students who keep moving tend to see the best outcomes.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-4">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Keep showing up
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    Momentum compounds when you stay engaged instead of
                    disappearing for long stretches.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-4">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Small actions add up
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                    The more consistently you engage here, the stronger your
                    week looks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ProfileCompletionPanel auth0Sub={auth0Sub} />
        </div>
      </main>

      <Footer variant="student" />
    </div>
  );
}
