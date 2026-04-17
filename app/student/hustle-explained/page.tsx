import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Hustle Score Explained — InternsNow",
};

const activities = [
  {
    type: "event_attended",
    label: "Attended an event",
    points: 20,
    description:
      "Showing up in person is the highest-value action you can take. Networking, workshops, and career fairs compound over time.",
  },
  {
    type: "job_application",
    label: "Submitted a job application",
    points: 5,
    description:
      "Each application logged here counts toward your weekly score. Log it right after you apply so nothing slips through.",
  },
  {
    type: "event_rsvp",
    label: "RSVP'd to an event",
    points: 5,
    description:
      "Committing to an event is a meaningful step. After the event ends, we'll ask whether you actually attended for the full points.",
  },
  {
    type: "profile_edit",
    label: "Updated your profile",
    points: 3,
    description:
      "Keeping your profile current improves matching quality. Counts once per day no matter how many edits you make.",
  },
  {
    type: "active_site_interval",
    label: "Active on the platform",
    points: 1,
    description:
      "Awarded automatically for every 5 minutes of active use — browsing listings, reading events, exploring resources.",
  },
  {
    type: "daily_login",
    label: "Daily login",
    points: 1,
    description:
      "Just showing up counts. Awarded once per day when you visit.",
  },
  {
    type: "event_missed",
    label: "Missed an event you RSVP'd to",
    points: 0,
    description:
      "No penalty, but no attendance bonus either. We track it so we stop prompting you about the same event.",
  },
];

export default function HustleExplainedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="student" />

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <div>
          <Link
            href="/student"
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline mb-6"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            How your hustle score works
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Your hustle score reflects how actively you&apos;re building your career
            this week. It resets and recomputes every 7 days based on your
            recent activity — not a lifetime total.
          </p>
        </div>

        {/* Activity breakdown */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            What earns points
          </h2>
          <div className="space-y-3">
            {activities.map((a) => (
              <div
                key={a.type}
                className="flex gap-5 rounded-2xl bg-white dark:bg-gray-800 px-6 py-5 shadow-sm"
              >
                <div className="flex-shrink-0 w-14 text-center">
                  <span
                    className={`text-2xl font-black ${
                      a.points >= 20
                        ? "text-blue-600 dark:text-blue-400"
                        : a.points >= 3
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {a.points > 0 ? `+${a.points}` : "—"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {a.label}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {a.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Streak */}
        <section className="rounded-2xl bg-white dark:bg-gray-800 px-6 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Streak bonus
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Every consecutive day you have any activity adds{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              +1 bonus point
            </span>{" "}
            on top of your score. A 7-day streak adds +7. Break the streak and
            it resets to zero.
          </p>
        </section>

        {/* Decay */}
        <section className="rounded-2xl bg-white dark:bg-gray-800 px-6 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Inactivity penalty
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Every day within the past 7 days where you had{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              no activity
            </span>{" "}
            subtracts 2 points from your score. Days before you first joined
            don&apos;t count against you. The score floors at zero.
          </p>
        </section>

        {/* 7-day window */}
        <section className="rounded-2xl bg-white dark:bg-gray-800 px-6 py-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Rolling 14-day window
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Only activity from the past 14 days counts. This keeps the score
            current — a strong stretch three weeks ago won&apos;t carry you forever.
            Show up consistently and the score reflects it.
          </p>
        </section>
      </main>

      <Footer variant="default" />
    </div>
  );
}
