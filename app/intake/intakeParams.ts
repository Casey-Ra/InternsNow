import {
  defaultIntakeInterests,
  parseIntakeInterests,
  type IntakeInterest,
} from "@/app/lib/utils/intakeRecommendations";

export type IntakeSearchParams = {
  location?: string | string[];
  major?: string | string[];
  interests?: string | string[];
  submitted?: string | string[];
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function parseIntakeParams(params: IntakeSearchParams): {
  submitted: boolean;
  location: string;
  major: string;
  parsedInterests: IntakeInterest[];
  effectiveInterests: IntakeInterest[];
  usedFallbackInterests: boolean;
} {
  const submitted = firstValue(params.submitted) === "1";
  const location = firstValue(params.location).trim();
  const major = firstValue(params.major).trim();
  const parsedInterests = parseIntakeInterests(params.interests);
  const effectiveInterests =
    parsedInterests.length > 0 ? parsedInterests : defaultIntakeInterests;

  return {
    submitted,
    location,
    major,
    parsedInterests,
    effectiveInterests,
    usedFallbackInterests: submitted && parsedInterests.length === 0,
  };
}
