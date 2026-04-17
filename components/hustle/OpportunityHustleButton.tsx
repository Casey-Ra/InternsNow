"use client";

import { useEffect, useMemo, useState } from "react";

type OpportunityHustleButtonProps = {
  referenceId: string;
  sourceLabel: string;
  sourceUrl: string;
  onActivityLogged?: () => void;
  onInitialStatusLoaded?: (hasLogged: boolean) => void;
};

type ReferenceStatus = {
  jobApplication: boolean;
  eventRsvp: boolean;
  eventAttended: boolean;
  eventMissed: boolean;
};

function buildStatusQuery({
  referenceId,
  sourceLabel,
}: {
  referenceId: string;
  sourceLabel: string;
}) {
  const params = new URLSearchParams({
    referenceType: "opportunity",
    referenceId,
    sourceLabel,
  });

  return `/api/student/hustle?${params.toString()}`;
}

export default function OpportunityHustleButton({
  referenceId,
  sourceLabel,
  sourceUrl,
  onActivityLogged,
  onInitialStatusLoaded,
}: OpportunityHustleButtonProps) {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<ReferenceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusUrl = useMemo(
    () => buildStatusQuery({ referenceId, sourceLabel }),
    [referenceId, sourceLabel],
  );

  async function loadStatus() {
    try {
      setLoadingStatus(true);
      setError(null);

      const response = await fetch(statusUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load status");
      }

      const data = (await response.json()) as {
        referenceStatus?: ReferenceStatus;
      };

      const resolved = data.referenceStatus ?? {
        jobApplication: false,
        eventRsvp: false,
        eventAttended: false,
        eventMissed: false,
      };
      setStatus(resolved);
      onInitialStatusLoaded?.(resolved.jobApplication);
    } catch {
      setError("We couldn't load your hustle status.");
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusUrl]);

  async function handleLogApplication() {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/student/hustle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityType: "job_application",
          referenceType: "opportunity",
          referenceId,
          sourceLabel,
          sourceUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record application");
      }

      setStatus((current) => ({
        jobApplication: true,
        eventRsvp: current?.eventRsvp ?? false,
        eventAttended: current?.eventAttended ?? false,
        eventMissed: current?.eventMissed ?? false,
      }));
      onActivityLogged?.();
    } catch {
      setError("We couldn't save that application.");
    } finally {
      setSaving(false);
    }
  }

  const hasApplied = status?.jobApplication ?? false;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogApplication}
        disabled={loadingStatus || saving || hasApplied}
        className="inline-flex items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:text-emerald-300"
      >
        {loadingStatus
          ? "Checking hustle status..."
          : saving
            ? "Saving application..."
            : hasApplied
              ? "Application Logged"
              : "I Applied"}
      </button>

      {hasApplied ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Nice. This application is already counted in your weekly hustle score.
        </p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mark it once you apply so your weekly score stays up to date.
        </p>
      )}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
