import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import QuickMatchQuiz from "@/components/QuickMatchQuiz";
import QuickMatchResults from "@/components/QuickMatchResults";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAllInternships } from "@/app/lib/models/Internship";
import { getLiveEvents } from "@/app/student/events/events";
import { buildIntakeRecommendations } from "@/app/lib/utils/intakeRecommendations";
import { parseIntakeParams, type IntakeSearchParams } from "../intakeParams";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<IntakeSearchParams>;
};

export default async function IntakeResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const {
    submitted,
    location,
    major,
    effectiveInterests,
    usedFallbackInterests,
  } = parseIntakeParams(params);

  if (!submitted) {
    redirect("/intake");
  }

  const [internships, events] = await Promise.all([
    getAllInternships(),
    getLiveEvents(),
  ]);

  const recommendations = buildIntakeRecommendations({
    internships,
    eventList: events,
    input: {
      location,
      major,
      interests: effectiveInterests,
    },
  });

  const opportunityMatches = recommendations.opportunities.slice(0, 8);
  const eventMatches = recommendations.events.slice(0, 6);

  return (
    <AnimatedBackground subtle>
      <Header variant="default" tone="dark" />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        <section className="bg-slate-900 border border-slate-700 rounded-xl p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                Quick Match Results
              </p>
              <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
                Your Matches
              </h1>
            </div>

            <Link
              href="/intake"
              className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Start Over
            </Link>
          </div>
        </section>

        <QuickMatchResults
          location={location}
          major={major}
          interests={effectiveInterests}
          usedFallbackInterests={usedFallbackInterests}
          opportunityMatches={opportunityMatches}
          eventMatches={eventMatches}
        />

        <section className="mt-8 bg-slate-900 border border-slate-700 rounded-xl p-8">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Refine your answers
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Open the quiz again if you want to adjust your location,
                    field of study, or match types.
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Edit Quiz
                </span>
              </div>
            </summary>

            <QuickMatchQuiz
              initialLocation={location}
              initialMajor={major}
              initialInterests={effectiveInterests}
              className="mt-6"
            />
          </details>
        </section>
      </main>

      <Footer variant="default" tone="dark" />
    </AnimatedBackground>
  );
}
