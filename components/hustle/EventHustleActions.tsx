"use client";

import { useEffect, useMemo, useState } from "react";
import { inferEventEnd } from "@/app/lib/utils/eventTiming";

type EventHustleActionsProps = {
  referenceId: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceDate: string;
  sourceTime: string;
  sourceLocation: string;
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
  sourceDate,
  sourceTime,
}: {
  referenceId: string;
  sourceLabel: string;
  sourceDate: string;
  sourceTime: string;
}) {
  const params = new URLSearchParams({
    referenceType: "event",
    referenceId,
    sourceLabel,
    sourceDate,
    sourceTime,
  });

  return `/api/student/hustle?${params.toString()}`;
}

export default function EventHustleActions({
  referenceId,
  sourceLabel,
  sourceUrl,
  sourceDate,
  sourceTime,
  sourceLocation,
  onActivityLogged,
  onInitialStatusLoaded,
}: EventHustleActionsProps) {
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [saving, setSaving] = useState<null | "rsvp" | "attended" | "missed">(
    null,
  );
  const [status, setStatus] = useState<ReferenceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusUrl = useMemo(
    () =>
      buildStatusQuery({
        referenceId,
        sourceLabel,
        sourceDate,
        sourceTime,
      }),
    [referenceId, sourceDate, sourceLabel, sourceTime],
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
      onInitialStatusLoaded?.(
        resolved.eventRsvp || resolved.eventAttended || resolved.eventMissed,
      );
    } catch {
      setError("We couldn't load your event status.");
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusUrl]);

  async function recordActivity(activityType: "event_rsvp" | "event_attended" | "event_missed") {
    try {
      setSaving(
        activityType === "event_rsvp"
          ? "rsvp"
          : activityType === "event_attended"
            ? "attended"
            : "missed",
      );
      setError(null);

      const response = await fetch("/api/student/hustle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activityType,
          referenceType: "event",
          referenceId,
          sourceLabel,
          sourceUrl,
          sourceDate,
          sourceTime,
          sourceLocation,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save event activity");
      }

      setStatus((current) => ({
        jobApplication: current?.jobApplication ?? false,
        eventRsvp:
          activityType === "event_rsvp" ? true : (current?.eventRsvp ?? false),
        eventAttended:
          activityType === "event_attended"
            ? true
            : (current?.eventAttended ?? false),
        eventMissed:
          activityType === "event_missed"
            ? true
            : (current?.eventMissed ?? false),
      }));
      onActivityLogged?.();
    } catch {
      setError("We couldn't save that event update.");
    } finally {
      setSaving(null);
    }
  }

  const eventEnded = (() => {
    const endsAt = inferEventEnd(sourceDate, sourceTime);
    if (!endsAt) {
      return false;
    }

    return endsAt.getTime() < Date.now();
  })();

  const hasRsvped = status?.eventRsvp ?? false;
  const hasAnsweredAttendance =
    (status?.eventAttended ?? false) || (status?.eventMissed ?? false);
  const shouldPromptForAttendance =
    eventEnded && hasRsvped && !hasAnsweredAttendance;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void recordActivity("event_rsvp")}
          disabled={loadingStatus || saving !== null || hasRsvped}
          className="inline-flex items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70 dark:text-emerald-300"
        >
          {loadingStatus
            ? "Checking hustle status..."
            : saving === "rsvp"
              ? "Saving RSVP..."
              : hasRsvped
                ? "RSVP Logged"
                : "I RSVP'd"}
        </button>

        {shouldPromptForAttendance ? (
          <>
            <button
              type="button"
              onClick={() => void recordActivity("event_attended")}
              disabled={saving !== null}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving === "attended" ? "Saving..." : "Yes, I Went"}
            </button>
            <button
              type="button"
              onClick={() => void recordActivity("event_missed")}
              disabled={saving !== null}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {saving === "missed" ? "Saving..." : "No, I Missed It"}
            </button>
          </>
        ) : null}
      </div>

      {shouldPromptForAttendance ? (
        <p className="text-sm text-blue-700 dark:text-blue-300">
          This event looks like it already ended. Did you actually make it?
        </p>
      ) : null}

      {!eventEnded && hasRsvped ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          RSVP saved. After the event ends, we’ll ask if you went so your hustle
          score can count the bigger attendance boost.
        </p>
      ) : null}

      {eventEnded && status?.eventAttended ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Attendance confirmed. This one counts a lot more than just the RSVP.
        </p>
      ) : null}

      {eventEnded && status?.eventMissed ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Marked as missed. We won’t keep prompting you for this event.
        </p>
      ) : null}

      {!hasRsvped ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Log your RSVP here once you register so we can follow up after the
          event ends.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
