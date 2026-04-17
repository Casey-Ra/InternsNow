export type ProfileCompletionInput = {
  location?: string | null;
  bio?: string | null;
  skillsCount?: number | null;
  interestsCount?: number | null;
  educationCount?: number | null;
  workCount?: number | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
};

export type ProfileCompletionSummary = {
  percent: number;
  completed: number;
  total: number;
  nextSteps: string[];
};

function hasText(value?: string | null): boolean {
  return Boolean((value ?? "").trim());
}

export function getProfileCompletionSummary(
  input: ProfileCompletionInput,
): ProfileCompletionSummary {
  const checks = [
    { done: hasText(input.location), missing: "Add your location" },
    { done: hasText(input.bio), missing: "Write a short bio" },
    {
      done: Number(input.skillsCount ?? 0) > 0,
      missing: "Add your top skills",
    },
    {
      done: Number(input.interestsCount ?? 0) > 0,
      missing: "Add your interests",
    },
    {
      done: Number(input.educationCount ?? 0) > 0,
      missing: "Add your education",
    },
    {
      done: Number(input.workCount ?? 0) > 0,
      missing: "Add work or internship experience",
    },
    {
      done:
        hasText(input.linkedin) ||
        hasText(input.github) ||
        hasText(input.portfolio),
      missing: "Add a LinkedIn, GitHub, or portfolio link",
    },
  ];

  const completed = checks.filter((item) => item.done).length;
  const total = checks.length;
  const percent = Math.round((completed / total) * 100);

  return {
    percent,
    completed,
    total,
    nextSteps: checks.filter((item) => !item.done).map((item) => item.missing),
  };
}
