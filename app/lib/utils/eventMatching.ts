import type { EventItem } from "@/app/student/events/events";
import { expandOpportunityKeywords } from "@/app/lib/utils/opportunityMatching";

export type EventTextMatch = {
  hasLocationPreference: boolean;
  hasKeywordPreference: boolean;
  locationMatched: boolean;
  keywordMatched: boolean;
  keywordMatchCount: number;
  strictMatch: boolean;
  looseMatch: boolean;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9+#]+/g)
    .filter(Boolean);
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.map((value) => normalize(value ?? "")).filter(Boolean)),
  );
}

function containsTerm(haystack: string, term: string): boolean {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(" ")) {
    return haystack.includes(normalizedTerm);
  }

  if (normalizedTerm.length <= 3) {
    return new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, "i").test(haystack);
  }

  return haystack.includes(normalizedTerm);
}

function getLocationTerms(locations: string[]): string[] {
  const terms: string[] = [];

  for (const location of locations) {
    const normalizedLocation = normalize(location);
    if (!normalizedLocation) {
      continue;
    }

    terms.push(normalizedLocation);
    for (const token of tokenize(location)) {
      if (token.length >= 2) {
        terms.push(token);
      }
    }
  }

  return unique(terms);
}

function getEventSearchText(event: EventItem): string {
  return normalize(
    `${event.title} ${event.description} ${event.details} ${event.location} ${event.host} ${event.tags.join(" ")}`,
  );
}

export function analyzeEventText(
  text: string,
  preferences: {
    locations?: string[];
    keywords?: string[];
  },
): EventTextMatch {
  const normalizedText = normalize(text);
  const locations = preferences.locations ?? [];
  const keywords = preferences.keywords ?? [];
  const hasLocationPreference = locations.some((value) => normalize(value));
  const hasKeywordPreference = keywords.some((value) => normalize(value));
  const locationTerms = getLocationTerms(locations);
  const expandedKeywords = expandOpportunityKeywords(keywords);
  const matchedKeywordTerms = expandedKeywords.filter((term) =>
    containsTerm(normalizedText, term),
  );
  const keywordMatchCount = Math.min(matchedKeywordTerms.length, 4);
  const locationMatched =
    hasLocationPreference &&
    locationTerms.some((term) => containsTerm(normalizedText, term));
  const keywordMatched = keywordMatchCount > 0;
  const matchedDimensions = Number(locationMatched) + Number(keywordMatched);

  return {
    hasLocationPreference,
    hasKeywordPreference,
    locationMatched,
    keywordMatched,
    keywordMatchCount,
    strictMatch:
      (!hasLocationPreference || locationMatched) &&
      (!hasKeywordPreference || keywordMatched),
    looseMatch: matchedDimensions > 0,
  };
}

function scoreEventRelevance(match: EventTextMatch): number {
  let score = 0;

  if (match.strictMatch && (match.hasLocationPreference || match.hasKeywordPreference)) {
    score += 6;
  } else if (match.looseMatch) {
    score += 2;
  }

  if (match.locationMatched) {
    score += 3;
  }

  if (match.keywordMatched) {
    score += 4 + match.keywordMatchCount;
  }

  return score;
}

export function rankEventsByRelevance(
  events: EventItem[],
  preferences: {
    locations?: string[];
    keywords?: string[];
  },
): EventItem[] {
  const hasLocationPreference = (preferences.locations ?? []).some((value) =>
    normalize(value),
  );
  const hasKeywordPreference = (preferences.keywords ?? []).some((value) =>
    normalize(value),
  );

  if (!hasLocationPreference && !hasKeywordPreference) {
    return events;
  }

  return [...events]
    .map((event) => {
      const match = analyzeEventText(getEventSearchText(event), preferences);
      return {
        event,
        score: scoreEventRelevance(match),
      };
    })
    .sort((left, right) => right.score - left.score)
    .map(({ event }) => event);
}
