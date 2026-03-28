import Link from "next/link";
import type {
  EventRecommendation,
  IntakeInterest,
  OpportunityRecommendation,
} from "@/app/lib/utils/intakeRecommendations";

type QuickMatchResultsProps = {
  location: string;
  major: string;
  interests: IntakeInterest[];
  usedFallbackInterests: boolean;
  opportunityMatches: OpportunityRecommendation[];
  eventMatches: EventRecommendation[];
};

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

export default function QuickMatchResults({
  location,
  major,
  interests,
  usedFallbackInterests,
  opportunityMatches,
  eventMatches,
}: QuickMatchResultsProps) {
  const selectedInterests = new Set(interests);
  const wantsOpportunities =
    selectedInterests.has("internship") || selectedInterests.has("job");
  const wantsEvents = selectedInterests.has("event");
  const noMatches =
    opportunityMatches.length === 0 && eventMatches.length === 0;

  return (
    <section
      id="matches"
      className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8"
    >
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
          Location: {location || "Any"}
        </span>
        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
          Major: {major || "Any"}
        </span>
        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-200">
          Interests: {interests.join(", ")}
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
            No direct matches found yet. You can still browse the full listings.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/opportunities"
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
  );
}
