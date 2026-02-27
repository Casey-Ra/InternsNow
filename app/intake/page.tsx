import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAllInternships } from "@/app/lib/models/Internship";
import { getLiveEvents } from "@/app/student/events/events";
import {
  buildIntakeRecommendations,
  defaultIntakeInterests,
  parseIntakeInterests,
} from "@/app/lib/utils/intakeRecommendations";
import type {
  EventRecommendation,
  OpportunityRecommendation,
} from "@/app/lib/utils/intakeRecommendations";

export const dynamic = "force-dynamic";

type SearchParams = {
  location?: string | string[];
  major?: string | string[];
  interests?: string | string[];
  submitted?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

function formatDate(dateLike: Date | string): string {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function IntakePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const submitted = firstValue(params.submitted) === "1";
  const location = firstValue(params.location).trim();
  const major = firstValue(params.major).trim();
  const parsedInterests = parseIntakeInterests(params.interests);
  const effectiveInterests =
    parsedInterests.length > 0 ? parsedInterests : defaultIntakeInterests;

  const selectedInterests = new Set(effectiveInterests);
  const wantsOpportunities =
    selectedInterests.has("internship") || selectedInterests.has("job");
  const wantsEvents = selectedInterests.has("event");
  const usedFallbackInterests = submitted && parsedInterests.length === 0;

  let opportunityMatches: OpportunityRecommendation[] = [];
  let eventMatches: EventRecommendation[] = [];

  if (submitted) {
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

    opportunityMatches = recommendations.opportunities.slice(0, 8);
    eventMatches = recommendations.events.slice(0, 6);
  }

  const noMatches =
    submitted && opportunityMatches.length === 0 && eventMatches.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header variant="default" />

      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Quick Match
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              Answer a few questions and see limited internships, entry-level
              jobs, and networking events right away. No account required.
            </p>
          </div>

          <form action="/intake" method="GET" className="mt-8 space-y-6">
            <input type="hidden" name="submitted" value="1" />

            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Location
                </span>
                <input
                  name="location"
                  defaultValue={location}
                  placeholder="Chicago, IL"
                  className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Major
                </span>
                <input
                  name="major"
                  defaultValue={major}
                  placeholder="Computer Science"
                  className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Interests
              </legend>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <input
                    type="checkbox"
                    name="interests"
                    value="internship"
                    defaultChecked={selectedInterests.has("internship")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    Internship
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <input
                    type="checkbox"
                    name="interests"
                    value="job"
                    defaultChecked={selectedInterests.has("job")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    Job
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                  <input
                    type="checkbox"
                    name="interests"
                    value="event"
                    defaultChecked={selectedInterests.has("event")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    Event
                  </span>
                </label>
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Show My Matches
              </button>
              <a
                href="/auth/login?screen_hint=signup&returnTo=%2Fstudent"
                className="rounded-lg border border-blue-200 dark:border-blue-800 px-6 py-3 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Create Full Account
              </a>
            </div>
          </form>
        </section>

        {submitted && (
          <section className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
                Location: {location || "Any"}
              </span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
                Major: {major || "Any"}
              </span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
                Interests: {effectiveInterests.join(", ")}
              </span>
            </div>

            {usedFallbackInterests && (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                No interests were selected, so all categories are shown.
              </p>
            )}

            {wantsOpportunities && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Internship and Job Matches
                </h2>
                {opportunityMatches.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    No opportunity matches yet. Try a broader location or major.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {opportunityMatches.map((match) => (
                      <article
                        key={match.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {match.companyName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 font-medium text-blue-700 dark:text-blue-300">
                              {match.label}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatDate(match.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {truncate(match.description, 260)}
                        </p>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Why this matched: {match.reasons.join(" ")}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href={match.detailsHref}
                            className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            View Details
                          </Link>
                          <a
                            href={match.applyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                          >
                            Apply
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {wantsEvents && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Event Matches
                </h2>
                {eventMatches.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">
                    No event matches yet. Try a broader location or major.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {eventMatches.map((eventMatch) => (
                      <article
                        key={eventMatch.id}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {eventMatch.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                              {eventMatch.date} • {eventMatch.time}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {eventMatch.location}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                          {eventMatch.description}
                        </p>
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          Why this matched: {eventMatch.reasons.join(" ")}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link
                            href={eventMatch.detailsHref}
                            className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            View Details
                          </Link>
                          <a
                            href={eventMatch.registrationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                          >
                            Register
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {noMatches && (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
                <p className="text-gray-700 dark:text-gray-200">
                  No direct matches found yet. You can still browse the full
                  listings.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/student/find-opportunities"
                    className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Browse Opportunities
                  </Link>
                  <Link
                    href="/student/events"
                    className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Browse Events
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer variant="default" />
    </div>
  );
}
