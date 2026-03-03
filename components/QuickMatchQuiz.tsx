"use client";

import { useState, type KeyboardEvent } from "react";
import {
  type IntakeInterest,
  defaultIntakeInterests,
} from "@/app/lib/utils/intakeRecommendations";

type QuickMatchQuizProps = {
  initialLocation: string;
  initialMajor: string;
  initialInterests: IntakeInterest[];
  action?: string;
  className?: string;
};

const totalSteps = 3;

const interestOptions: Array<{
  value: IntakeInterest;
  label: string;
  description: string;
}> = [
  {
    value: "internship",
    label: "Internships",
    description: "Short-term roles to build experience quickly.",
  },
  {
    value: "job",
    label: "Entry-level jobs",
    description: "Full-time opportunities for early-career candidates.",
  },
  {
    value: "event",
    label: "Events",
    description: "Networking, workshops, and employer meetups.",
  },
];

function getStartingStep(params: {
  initialLocation: string;
  initialMajor: string;
}): number {
  if (!params.initialLocation.trim()) {
    return 1;
  }

  if (!params.initialMajor.trim()) {
    return 2;
  }

  return totalSteps;
}

function normalizeInterests(interests: IntakeInterest[]): IntakeInterest[] {
  const uniqueInterests = new Set(interests);
  return interestOptions
    .map((option) => option.value)
    .filter((value) => uniqueInterests.has(value));
}

export default function QuickMatchQuiz({
  initialLocation,
  initialMajor,
  initialInterests,
  action = "/intake/results",
  className = "mt-8",
}: QuickMatchQuizProps) {
  const [location, setLocation] = useState(initialLocation);
  const [major, setMajor] = useState(initialMajor);
  const [interests, setInterests] = useState(
    normalizeInterests(
      initialInterests.length > 0 ? initialInterests : defaultIntakeInterests,
    ),
  );
  const [step, setStep] = useState(
    getStartingStep({ initialLocation, initialMajor }),
  );

  const progressPercent = Math.round((step / totalSteps) * 100);

  function moveStep(direction: -1 | 1) {
    setStep((currentStep) =>
      Math.min(totalSteps, Math.max(1, currentStep + direction)),
    );
  }

  function toggleInterest(interest: IntakeInterest) {
    setInterests((currentInterests) => {
      const nextInterests = currentInterests.includes(interest)
        ? currentInterests.filter((value) => value !== interest)
        : [...currentInterests, interest];

      return normalizeInterests(nextInterests);
    });
  }

  function handleAdvanceOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && step < totalSteps) {
      event.preventDefault();
      moveStep(1);
    }
  }

  return (
    <form action={action} method="GET" className={className}>
      <input type="hidden" name="submitted" value="1" />
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="major" value={major} />
      {interests.map((interest) => (
        <input key={interest} type="hidden" name="interests" value={interest} />
      ))}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                Progress
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
              {progressPercent}% complete
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-4 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-3">
            <span className={step >= 1 ? "font-semibold text-slate-700 dark:text-slate-200" : ""}>
              1. Preferred location
            </span>
            <span className={step >= 2 ? "font-semibold text-slate-700 dark:text-slate-200" : ""}>
              2. Field of study
            </span>
            <span className={step >= 3 ? "font-semibold text-slate-700 dark:text-slate-200" : ""}>
              3. Match type
            </span>
          </div>
        </div>

        <div className="px-6 py-8">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Question 1
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Where do you want to search?
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Add a city, state, or &quot;remote&quot;. Leave it blank if
                  you want broader results.
                </p>
              </div>

              <label className="block">
                <span className="sr-only">Preferred location</span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  onKeyDown={handleAdvanceOnEnter}
                  placeholder="Chicago, IL"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Question 2
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  What are you studying?
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  This helps rank roles and events that line up with your major
                  or career track.
                </p>
              </div>

              <label className="block">
                <span className="sr-only">Major or field of study</span>
                <input
                  value={major}
                  onChange={(event) => setMajor(event.target.value)}
                  onKeyDown={handleAdvanceOnEnter}
                  placeholder="Computer Science"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-lg text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Question 3
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  What should we match you with?
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Pick one or more. If you skip this step, we&apos;ll show all
                  categories.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {interestOptions.map((option) => {
                  const selected = interests.includes(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleInterest(option.value)}
                      className={`rounded-xl border px-4 py-4 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-400 dark:bg-blue-950/40"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                      }`}
                      aria-pressed={selected}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {option.label}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {option.description}
                          </p>
                        </div>
                        <span
                          className={`mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                            selected
                              ? "border-blue-500 bg-blue-500 px-2 text-white"
                              : "border-slate-300 px-2 text-slate-500 dark:border-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {selected ? "On" : "Off"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-800">
              {location.trim() || "Any location"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-800">
              {major.trim() || "Any major"}
            </span>
            <span className="rounded-full bg-white px-3 py-1 dark:bg-slate-800">
              {interests.length > 0
                ? `${interests.length} type${interests.length > 1 ? "s" : ""} selected`
                : "All match types"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => moveStep(-1)}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Back
              </button>
            ) : null}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => moveStep(1)}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next Question
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Show My Matches
              </button>
            )}

            <a
              href="/auth/login?screen_hint=signup&returnTo=%2Fstudent"
              className="rounded-lg border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/20"
            >
              Create Full Account
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
