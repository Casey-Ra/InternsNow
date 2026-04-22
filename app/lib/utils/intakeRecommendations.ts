import type { Internship } from "@/app/lib/models/Internship";
import type { EventItem } from "@/app/student/events/events";
import { analyzeOpportunityText } from "@/app/lib/utils/opportunityMatching";
import { analyzeEventText } from "@/app/lib/utils/eventMatching";

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

const internshipSignals = [
  "intern",
  "internship",
  "co-op",
  "co op",
  "student",
  "campus",
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toTimestamp(value: Date | string): number {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
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

  const locationPreference = input.location.trim();
  const majorPreference = input.major.trim();

  return internships
    .map((internship) => {
      const haystack = normalize(
        `${internship.company_name} ${internship.job_description}`,
      );
      const label = getOpportunityLabel(haystack);
      const breakdown = analyzeOpportunityText(haystack, {
        locations: locationPreference ? [locationPreference] : [],
        keywords: majorPreference ? [majorPreference] : [],
      });

      let score = 1 + breakdown.keywordMatchCount * 2;
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

      if (breakdown.strictMatch) {
        score += 6;
      } else if (breakdown.looseMatch) {
        score += 2;
      }

      if (breakdown.locationMatched) {
        score += breakdown.remotePreference
          ? 3
          : breakdown.preferredLocationMatched
            ? 3
            : 2;
        reasons.push(
          breakdown.remotePreference
            ? "Matches your remote preference."
            : breakdown.preferredLocationMatched
              ? "Matches your preferred location."
              : "Available remotely.",
        );
      }

      if (breakdown.keywordMatched && majorPreference) {
        reasons.push(`Related to ${majorPreference}.`);
      }

      return {
        id: internship.id,
        companyName: internship.company_name,
        description: internship.job_description,
        applyUrl: internship.url,
        detailsHref: `/opportunities/${internship.id}`,
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

  const locationPreference = input.location.trim();
  const majorPreference = input.major.trim();

  return eventList
    .map((event) => {
      const haystack = normalize(
        `${event.title} ${event.description} ${event.details} ${event.location} ${event.tags.join(" ")}`,
      );
      const reasons: string[] = ["Matches your event interest."];
      const breakdown = analyzeEventText(haystack, {
        locations: locationPreference ? [locationPreference] : [],
        keywords: majorPreference ? [majorPreference] : [],
      });
      let score = 2;

      if (breakdown.strictMatch && (breakdown.hasLocationPreference || breakdown.hasKeywordPreference)) {
        score += 6;
      } else if (breakdown.looseMatch) {
        score += 2;
      }

      if (breakdown.locationMatched) {
        score += 3;
        reasons.push("In or near your preferred location.");
      }

      if (breakdown.keywordMatched && majorPreference) {
        score += 4 + breakdown.keywordMatchCount;
        reasons.push(`Relevant to ${majorPreference}.`);
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
