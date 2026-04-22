"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { analyzeOpportunityText } from "@/app/lib/utils/opportunityMatching";

interface Internship {
  id: string;
  company_name: string;
  job_description: string;
  url: string;
  created_at: Date;
}

interface UserHints {
  locations: string[];
  keywords: string[];
  major: string;
  source: "default" | "profile";
}

const INTERNSHIP_TITLE_PATTERN =
  /\b(intern(?:ship)?|co-?op|apprentice(?:ship)?|fellowship)\b/i;

function isInternship(companyName: string) {
  const titlePart = companyName.includes(" - ")
    ? companyName.slice(companyName.indexOf(" - ") + 3)
    : companyName;
  return INTERNSHIP_TITLE_PATTERN.test(titlePart);
}

function formatDate(iso?: string | Date) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function scoreRelevance(
  item: Internship,
  hints: UserHints,
  match = analyzeOpportunityText(
    `${item.company_name} ${item.job_description}`,
    hints,
  ),
): number {
  let score = 0;

  if (match.strictMatch && (match.hasLocationPreference || match.hasKeywordPreference)) {
    score += 6;
  } else if (match.looseMatch) {
    score += 2;
  }

  if (match.locationMatched) {
    score += match.remotePreference ? 5 : match.preferredLocationMatched ? 4 : 3;
  } else if (!match.hasLocationPreference && match.remoteMatched) {
    score += 1;
  }

  if (match.keywordMatched) {
    score += 4 + match.keywordMatchCount;
  }

  // Recency boost — newer posts get a small edge
  const ageMs = Date.now() - new Date(item.created_at).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays < 7) score += 1;

  return score;
}

const DEFAULT_COUNT = 10;

type OpportunityType = "all" | "internships" | "jobs";

export default function OpportunitiesList({
  internships,
  userHints,
}: {
  internships: Internship[];
  userHints: UserHints;
}) {
  const [typeFilter] = useState<OpportunityType>("all");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [showAll, setShowAll] = useState(false);

  const isSearching = typeFilter !== "all" || keyword !== "" || location !== "";
  const hasHints = userHints.locations.length > 0 || userHints.keywords.length > 0;

  // Ranked list for the default view (top 10 by relevance)
  const ranked = useMemo(() => {
    if (!hasHints) return internships;
    return internships
      .map((internship) => {
        const match = analyzeOpportunityText(
          `${internship.company_name} ${internship.job_description}`,
          userHints,
        );

        return {
          internship,
          match,
          score: scoreRelevance(internship, userHints, match),
        };
      })
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        return new Date(right.internship.created_at).getTime() -
          new Date(left.internship.created_at).getTime();
      })
      .map(({ internship }) => internship);
  }, [internships, userHints, hasHints]);

  const filtered = useMemo(() => {
    const source = isSearching ? internships : ranked;
    return source.filter((i) => {
      if (typeFilter === "internships" && !isInternship(i.company_name)) return false;
      if (typeFilter === "jobs" && isInternship(i.company_name)) return false;

      const text = `${i.company_name} ${i.job_description}`.toLowerCase();

      if (keyword) {
        const terms = keyword
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean);
        if (!terms.every((t) => text.includes(t))) return false;
      }

      if (location) {
        const locationMatch = analyzeOpportunityText(text, {
          locations: [location],
        });
        if (!locationMatch.locationMatched) return false;
      }

      return true;
    });
  }, [internships, ranked, isSearching, typeFilter, keyword, location]);

  const displayLimit = isSearching || showAll ? filtered.length : DEFAULT_COUNT;
  const visible = filtered.slice(0, displayLimit);
  const hasMore = !isSearching && !showAll && filtered.length > DEFAULT_COUNT;


  return (
    <>
      {/* Default heading */}
      {!isSearching && (
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {hasHints
            ? userHints.source === "profile"
              ? `Top ${Math.min(DEFAULT_COUNT, filtered.length)} opportunities based on your profile, including ${userHints.major}. Use the filters to search for more.`
              : `Top ${Math.min(DEFAULT_COUNT, filtered.length)} opportunities softly ranked toward ${userHints.major}. Use the filters to adjust the mix.`
            : `Showing the ${Math.min(DEFAULT_COUNT, filtered.length)} most recent opportunities. Use the filters to search.`}
        </p>
      )}

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Keywords (e.g. React, marketing)"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowAll(false);
            }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Location (e.g. Austin, Remote)"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowAll(false);
            }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {isSearching && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filtered.length} {filtered.length === 1 ? "result" : "results"} matching
            filters
          </p>
        )}
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">
            {isSearching
              ? "No opportunities match your filters. Try broadening your search."
              : "No opportunities available yet. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {visible.map((i) => (
            <div
              key={i.id}
              className="relative border border-gray-100 dark:border-gray-700 rounded-lg p-6"
            >
              <Link
                href={`/opportunities/${i.id}`}
                className="absolute inset-0 z-10 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                aria-label={`View details for ${i.company_name}`}
              >
                <span className="sr-only">View details</span>
              </Link>
              <div className="relative z-20 pointer-events-none md:flex md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {i.company_name}
                  </h3>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {i.job_description.length > 800
                      ? `${i.job_description.slice(0, 800)}...`
                      : i.job_description}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(i.created_at)}
                  </p>
                  <span className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 transition-colors"
              >
                Show all {filtered.length} opportunities
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
