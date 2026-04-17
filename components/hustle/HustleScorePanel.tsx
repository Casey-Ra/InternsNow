"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HustleSummary = {
  score: number;
  streakDays: number;
  streakBonus: number;
  windowDays: number;
};

const HUSTLE_ACTIVITY_RECORDED_EVENT = "hustle:activity-recorded";

export default function HustleScorePanel() {
  const [summary, setSummary] = useState<HustleSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/student/hustle", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load hustle score");
      }

      const data = (await response.json()) as HustleSummary;
      setSummary(data);
    } catch {
      setError("We couldn't load your hustle score yet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSummary();

    const handleRecordedActivity = () => {
      void loadSummary();
    };

    window.addEventListener(
      HUSTLE_ACTIVITY_RECORDED_EVENT,
      handleRecordedActivity,
    );

    return () => {
      window.removeEventListener(
        HUSTLE_ACTIVITY_RECORDED_EVENT,
        handleRecordedActivity,
      );
    };
  }, []);

  if (loading) {
    return (
      <section className="mb-12 rounded-[2rem] border border-blue-100 bg-white/92 p-10 shadow-[0_24px_70px_rgba(37,99,235,0.14)] dark:border-white/10 dark:bg-gray-800/75">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading your hustle score...
        </p>
      </section>
    );
  }

  if (!summary) {
    return (
      <section className="mb-12 rounded-[2rem] border border-red-100 bg-white/92 p-10 shadow-xl dark:border-red-900/30 dark:bg-gray-800/75">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error ?? "We couldn't load your hustle score."}
        </p>
      </section>
    );
  }

  return (
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.28),_rgba(255,255,255,0.96)_42%,_rgba(219,234,254,0.92)_100%)] p-10 shadow-[0_28px_90px_rgba(37,99,235,0.18)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_rgba(17,24,39,0.96)_40%,_rgba(15,23,42,0.98)_100%)]">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold uppercase tracking-[0.32em] text-blue-600 dark:text-blue-300">
              Hustle Score
            </p>
            <Link
              href="/student/hustle-explained"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-300 underline underline-offset-2"
            >
              How is this calculated?
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end md:gap-6">
            <p className="text-[5rem] font-black leading-none tracking-[-0.08em] text-gray-950 dark:text-white md:text-[7.5rem] lg:text-[9rem]">
              {summary.score}
            </p>
            <p className="mb-3 max-w-lg text-base leading-7 text-gray-700 dark:text-gray-200 md:text-lg">
              Everything you do contributes to your hustle score. Inactivity
              will diminish it.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200/70 bg-white/70 px-7 py-6 backdrop-blur dark:border-blue-300/15 dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
            Daily Streak
          </p>
          <p className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">
            {summary.streakDays} day{summary.streakDays === 1 ? "" : "s"}
          </p>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            +{summary.streakBonus} streak bonus live
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </section>
  );
}
