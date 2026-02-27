import type { Internship } from "@/app/lib/models/Internship";
import type { EventItem } from "@/app/student/events/events";

export const intakeInterestValues = ["internship", "job", "event"] as const;

export type IntakeInterest = (typeof intakeInterestValues)[number];

export const defaultIntakeInterests: IntakeInterest[] = [...intakeInterestValues];

export interface IntakeInput {
  location: string;
  major: string;
  interests: IntakeInterest[];
}

export interface OpportunityRecommendation {
  id: string;
  companyName: string;
  description: string;
  applyUrl: string;
  detailsHref: string;
  createdAt: Date | string;
  label: "Internship" | "Entry-Level Job";
  reasons: string[];
  score: number;
}

export interface EventRecommendation {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  detailsHref: string;
  registrationLink: string;
  reasons: string[];
  score: number;
}

export interface IntakeRecommendationResult {
  opportunities: OpportunityRecommendation[];
  events: EventRecommendation[];
}

type ScoreBreakdown = {
  score: number;
  locationMatched: boolean;
  majorMatchCount: number;
};

const internshipSignals = [
  "intern",
  "internship",
  "co-op",
  "co op",
  "student",
  "campus",
];

const majorHints: Array<{ aliases: string[]; keywords: string[] }> = [
  {
    aliases: ["computer science", "software", "it", "information technology"],
    keywords: [
      "software",
      "developer",
      "engineering",
      "frontend",
      "backend",
      "api",
      "react",
      "typescript",
      "data",
      "ai",
      "cybersecurity",
      "python",
    ],
  },
  {
    aliases: ["data science", "analytics", "statistics", "math"],
    keywords: [
      "data",
      "analytics",
      "machine learning",
      "python",
      "sql",
      "tableau",
      "visualization",
      "reporting",
    ],
  },
  {
    aliases: ["marketing", "communications", "media"],
    keywords: [
      "marketing",
      "campaign",
      "social media",
      "content",
      "brand",
      "communications",
      "growth",
    ],
  },
  {
    aliases: ["finance", "accounting", "economics"],
    keywords: [
      "finance",
      "financial",
      "budget",
      "accounting",
      "analyst",
      "consulting",
      "excel",
      "client",
    ],
  },
  {
    aliases: ["business", "management", "operations"],
    keywords: [
      "operations",
      "strategy",
      "management",
      "consulting",
      "business",
      "supply chain",
      "logistics",
      "process",
    ],
  },
  {
    aliases: ["design", "ux", "ui", "product"],
    keywords: [
      "design",
      "ux",
      "ui",
      "product",
      "creative",
      "portfolio",
      "prototype",
    ],
  },
  {
    aliases: ["health", "biology", "pre-med", "medicine"],
    keywords: [
      "health",
      "healthcare",
      "clinical",
      "biology",
      "medical",
      "research",
    ],
  },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  const tokens = normalize(value).split(/[^a-z0-9+#]+/g).filter(Boolean);
  return Array.from(new Set(tokens));
}

function toTimestamp(value: Date | string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getLocationTokens(location: string): string[] {
  return tokenize(location).filter((token) => token.length >= 2);
}

function getMajorKeywords(major: string): string[] {
  const normalizedMajor = normalize(major);
  if (!normalizedMajor) {
    return [];
  }

  const fromHints = majorHints
    .filter(({ aliases }) => aliases.some((alias) => normalizedMajor.includes(alias)))
    .flatMap(({ keywords }) => keywords);

  return Array.from(new Set([...tokenize(major), ...fromHints]));
}

function scoreText(
  haystack: string,
  locationTokens: string[],
  majorKeywords: string[],
): ScoreBreakdown {
  let score = 1;
  const locationMatched =
    locationTokens.length > 0 &&
    locationTokens.some((token) => haystack.includes(token));

  if (locationMatched) {
    score += 3;
  }

  const matchedMajorKeywords = majorKeywords.filter(
    (keyword) => keyword.length > 2 && haystack.includes(keyword),
  );
  const majorMatchCount = Math.min(matchedMajorKeywords.length, 3);
  score += majorMatchCount * 2;

  return { score, locationMatched, majorMatchCount };
}

function getOpportunityLabel(text: string): "Internship" | "Entry-Level Job" {
  return internshipSignals.some((signal) => text.includes(signal))
    ? "Internship"
    : "Entry-Level Job";
}

function buildOpportunityRecommendations(
  internships: Internship[],
  input: IntakeInput,
): OpportunityRecommendation[] {
  const wantsOpportunities =
    input.interests.includes("internship") || input.interests.includes("job");

  if (!wantsOpportunities) {
    return [];
  }

  const locationTokens = getLocationTokens(input.location);
  const majorKeywords = getMajorKeywords(input.major);

  return internships
    .map((internship) => {
      const haystack = normalize(
        `${internship.company_name} ${internship.job_description}`,
      );
      const label = getOpportunityLabel(haystack);
      const breakdown = scoreText(haystack, locationTokens, majorKeywords);

      let score = breakdown.score;
      const reasons: string[] = [];

      if (label === "Internship" && input.interests.includes("internship")) {
        score += 2;
        reasons.push("Matches your internship interest.");
      } else if (label === "Entry-Level Job" && input.interests.includes("job")) {
        score += 2;
        reasons.push("Matches your job interest.");
      } else {
        score += 1;
        reasons.push("Aligned with your early-career interests.");
      }

      if (breakdown.locationMatched) {
        reasons.push("Contains your location keywords.");
      }

      if (breakdown.majorMatchCount > 0 && input.major.trim()) {
        reasons.push(`Related to ${input.major.trim()}.`);
      }

      return {
        id: internship.id,
        companyName: internship.company_name,
        description: internship.job_description,
        applyUrl: internship.url,
        detailsHref: `/student/find-opportunities/${internship.id}`,
        createdAt: internship.created_at,
        label,
        reasons,
        score,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
    });
}

function buildEventRecommendations(
  eventList: EventItem[],
  input: IntakeInput,
): EventRecommendation[] {
  if (!input.interests.includes("event")) {
    return [];
  }

  const locationTokens = getLocationTokens(input.location);
  const majorKeywords = getMajorKeywords(input.major);

  return eventList
    .map((event) => {
      const haystack = normalize(
        `${event.title} ${event.description} ${event.details} ${event.location} ${event.tags.join(" ")}`,
      );

      const breakdown = scoreText(haystack, locationTokens, majorKeywords);
      const reasons: string[] = ["Matches your event interest."];
      const score = breakdown.score + 2;

      if (breakdown.locationMatched) {
        reasons.push("In or near your preferred location.");
      }

      if (breakdown.majorMatchCount > 0 && input.major.trim()) {
        reasons.push(`Relevant to ${input.major.trim()}.`);
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date,
        time: event.time,
        detailsHref: `/student/events/${event.id}`,
        registrationLink: event.registrationLink,
        reasons,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);
}

export function parseIntakeInterests(
  raw: string | string[] | undefined,
): IntakeInterest[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const parsed: IntakeInterest[] = [];

  for (const value of values) {
    const normalizedValue = normalize(value);
    if (
      normalizedValue === "internship" ||
      normalizedValue === "job" ||
      normalizedValue === "event"
    ) {
      const interest = normalizedValue as IntakeInterest;
      if (!parsed.includes(interest)) {
        parsed.push(interest);
      }
    }
  }

  return parsed;
}

export function buildIntakeRecommendations(params: {
  internships: Internship[];
  eventList: EventItem[];
  input: IntakeInput;
}): IntakeRecommendationResult {
  return {
    opportunities: buildOpportunityRecommendations(
      params.internships,
      params.input,
    ),
    events: buildEventRecommendations(params.eventList, params.input),
  };
}
