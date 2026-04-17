"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SeekingValue = "job" | "internship" | "both" | null;

type Props = {
  initial: SeekingValue;
  showApplyButton?: boolean;
};

function toFlags(v: SeekingValue): { job: boolean; internship: boolean } {
  return {
    job: v === "job" || v === "both",
    internship: v === "internship" || v === "both",
  };
}

function fromFlags(job: boolean, internship: boolean): SeekingValue {
  if (job && internship) return "both";
  if (job) return "job";
  if (internship) return "internship";
  return null;
}

const SEEKING_CACHE_KEY = "internsnow_seeking";

async function saveSeeking(value: SeekingValue) {
  await fetch("/api/student/seeking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seeking: value }),
  });
  try {
    if (value) localStorage.setItem(SEEKING_CACHE_KEY, value);
    else localStorage.removeItem(SEEKING_CACHE_KEY);
  } catch {}
}

export default function SeekingToggle({ initial, showApplyButton = false }: Props) {
  const [initialFlags] = useState(toFlags(initial));
  const [flags, setFlags] = useState(toFlags(initial));
  const router = useRouter();

  const isDirty =
    flags.job !== initialFlags.job || flags.internship !== initialFlags.internship;

  function toggle(key: "job" | "internship") {
    const next = { ...flags, [key]: !flags[key] };
    setFlags(next);

    if (!showApplyButton) {
      void saveSeeking(fromFlags(next.job, next.internship)).then(() => {
        router.refresh();
      });
    }
  }

  async function handleApply() {
    await saveSeeking(fromFlags(flags.job, flags.internship));
    window.location.reload();
  }

  const options: { key: "internship" | "job"; label: string }[] = [
    { key: "internship", label: "Internships" },
    { key: "job", label: "Full-time jobs" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
        Seeking:
      </span>
      {options.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => toggle(key)}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-semibold border transition",
            flags[key]
              ? "bg-blue-600 text-white border-blue-500/50 shadow-sm"
              : "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
      {showApplyButton && isDirty && (
        <button
          type="button"
          onClick={() => void handleApply()}
          className="rounded-full px-4 py-1.5 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition"
        >
          Apply
        </button>
      )}
    </div>
  );
}
