"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export interface ManagedEventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  price: string;
  registrationLink: string;
  tags: string[];
  createdBy: string | null;
  createdByEmail: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  canManage: boolean;
}

interface EventFormState {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  price: string;
  registrationLink: string;
  tagsText: string;
}

interface ManageEventsClientProps {
  initialActiveEvents: ManagedEventItem[];
  initialArchivedEvents: ManagedEventItem[];
  currentUserSub: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const emptyFormState: EventFormState = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
  details: "",
  host: "",
  price: "",
  registrationLink: "",
  tagsText: "",
};

function parseTags(tagsText: string): string[] {
  const tags = tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 15);
  return Array.from(new Set(tags));
}

function tagsToText(tags: string[]): string {
  return tags.join(", ");
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function canManageItem(
  item: Pick<ManagedEventItem, "canManage" | "createdBy">,
  currentUserSub: string,
  isAdmin: boolean,
): boolean {
  return isAdmin || item.canManage || item.createdBy === currentUserSub;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "n/a";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function validateFormState(form: EventFormState): string | null {
  if (
    !form.title.trim() ||
    !form.date.trim() ||
    !form.time.trim() ||
    !form.location.trim() ||
    !form.description.trim() ||
    !form.details.trim() ||
    !form.host.trim() ||
    !form.price.trim() ||
    !form.registrationLink.trim()
  ) {
    return "Please fill out all required fields.";
  }

  if (!isHttpUrl(form.registrationLink.trim())) {
    return "Registration link must start with http:// or https://";
  }

  return null;
}

async function parseApiPayload(response: Response): Promise<{
  json: Record<string, unknown> | null;
  text: string;
}> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const bodyText = await response.text();

  if (!contentType.includes("application/json")) {
    return { json: null, text: bodyText };
  }

  try {
    const parsed = JSON.parse(bodyText) as Record<string, unknown>;
    return { json: parsed, text: bodyText };
  } catch {
    return { json: null, text: bodyText };
  }
}

function extractResponseError(
  response: Response,
  payload: { json: Record<string, unknown> | null; text: string },
  fallback: string,
): string {
  if (payload.json && typeof payload.json.error === "string") {
    return payload.json.error;
  }

  if (payload.text.trim().toLowerCase().startsWith("<!doctype") || payload.text.includes("<html")) {
    if (response.status === 401 || response.status === 403) {
      return "Your session is no longer authorized. Please sign in again.";
    }
    if (response.status === 404) {
      return "Sync endpoint not found. Please restart the dev server and try again.";
    }
    return "Received an HTML response instead of JSON. Please refresh and try again.";
  }

  return fallback;
}

function ownerLabel(item: ManagedEventItem, currentUserSub: string): string {
  if (item.createdBy && item.createdBy === currentUserSub) {
    return "You";
  }
  if (item.createdByEmail) {
    return item.createdByEmail;
  }
  if (item.createdBy) {
    return item.createdBy;
  }
  return "Unknown";
}

export default function ManageEventsClient({
  initialActiveEvents,
  initialArchivedEvents,
  currentUserSub,
  isAdmin,
  isAuthenticated,
}: ManageEventsClientProps) {
  const router = useRouter();
  const [activeEvents, setActiveEvents] =
    useState<ManagedEventItem[]>(initialActiveEvents);
  const [archivedEvents, setArchivedEvents] =
    useState<ManagedEventItem[]>(initialArchivedEvents);
  const [newEvent, setNewEvent] = useState<EventFormState>(emptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncingCommunity, setSyncingCommunity] = useState(false);
  const [resettingAndSyncingCommunity, setResettingAndSyncingCommunity] = useState(false);
  const [communitySyncFeedback, setCommunitySyncFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [syncingMeetup, setSyncingMeetup] = useState(false);
  const [resettingAndSyncingMeetup, setResettingAndSyncingMeetup] = useState(false);
  const [meetupSyncFeedback, setMeetupSyncFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [syncingEventbrite, setSyncingEventbrite] = useState(false);
  const [resettingAndSyncingEventbrite, setResettingAndSyncingEventbrite] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateNewField = (field: keyof EventFormState, value: string) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }));
  };

  const updateEventField = (
    id: string,
    field: keyof ManagedEventItem,
    value: string | string[],
  ) => {
    setActiveEvents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      setError("Please sign in to post an event.");
      return;
    }

    const validationError = validateFormState(newEvent);
    if (validationError) {
      setError(validationError);
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title.trim(),
          date: newEvent.date.trim(),
          time: newEvent.time.trim(),
          location: newEvent.location.trim(),
          description: newEvent.description.trim(),
          details: newEvent.details.trim(),
          host: newEvent.host.trim(),
          price: newEvent.price.trim(),
          registrationLink: newEvent.registrationLink.trim(),
          tags: parseTags(newEvent.tagsText),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Failed to create event");
        return;
      }

      const createdItem = data?.data as ManagedEventItem | undefined;
      if (createdItem) {
        setActiveEvents((prev) => [
          {
            ...createdItem,
            canManage: true,
          },
          ...prev,
        ]);
      }

      setNewEvent(emptyFormState);
      setSuccess("Event posted.");
      router.refresh();
    } catch (createError: unknown) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Unexpected error while creating event";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (id: string) => {
    setError(null);
    setSuccess(null);
    const item = activeEvents.find((event) => event.id === id);
    if (!item) {
      return;
    }

    if (!canManageItem(item, currentUserSub, isAdmin)) {
      setError("You do not have permission to edit this event.");
      return;
    }

    const validationError = validateFormState({
      title: item.title,
      date: item.date,
      time: item.time,
      location: item.location,
      description: item.description,
      details: item.details,
      host: item.host,
      price: item.price,
      registrationLink: item.registrationLink,
      tagsText: tagsToText(item.tags),
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingId(id);

    try {
      const response = await fetch("/api/events/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          date: item.date,
          time: item.time,
          location: item.location,
          description: item.description,
          details: item.details,
          host: item.host,
          price: item.price,
          registrationLink: item.registrationLink,
          tags: item.tags,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Failed to update event");
        return;
      }

      const updatedItem = data?.data as ManagedEventItem | undefined;
      if (updatedItem) {
        const nextCanManage = canManageItem(
          { ...updatedItem, canManage: false },
          currentUserSub,
          isAdmin,
        );

        setActiveEvents((prev) =>
          prev.map((event) =>
            event.id === id
              ? { ...updatedItem, canManage: nextCanManage }
              : event,
          ),
        );
      }

      setEditingId(null);
      setSuccess("Event updated.");
      router.refresh();
    } catch (updateError: unknown) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : "Unexpected error while updating event";
      setError(message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const target = activeEvents.find((event) => event.id === id);
    if (!target) {
      return;
    }

    if (!canManageItem(target, currentUserSub, isAdmin)) {
      setError("You do not have permission to remove this event.");
      return;
    }

    if (!window.confirm("Archive this event? It can still be recovered by admins.")) {
      return;
    }

    setError(null);
    setSuccess(null);
    setDeletingId(id);

    try {
      const response = await fetch("/api/events/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Failed to archive event");
        return;
      }

      setActiveEvents((prev) => prev.filter((event) => event.id !== id));
      setEditingId((prev) => (prev === id ? null : prev));

      if (isAdmin && data?.data) {
        const deletedItem = data.data as ManagedEventItem;
        setArchivedEvents((prev) => [
          {
            ...deletedItem,
            canManage: true,
          },
          ...prev,
        ]);
      }

      setSuccess("Event archived.");
      router.refresh();
    } catch (deleteError: unknown) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Unexpected error while archiving event";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const syncEventbriteChunk = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/events/eventbrite/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const payload = await parseApiPayload(res);
    const data = (payload.json ?? {}) as {
      error?: string;
      msg?: string;
      fetched?: number;
      created?: number;
      updated?: number;
      unchanged?: number;
      attemptedQueries?: number;
      failedQueries?: number;
      totalQueries?: number;
      chunkIndex?: number;
      chunkCount?: number;
    };

    return { res, payload, data };
  };

  const runRemainingEventbriteChunks = async (initial: {
    chunkIndex?: number;
    chunkCount?: number;
    fetched?: number;
    created?: number;
    updated?: number;
    unchanged?: number;
    attemptedQueries?: number;
    failedQueries?: number;
  }) => {
    const initialChunkIndex =
      typeof initial.chunkIndex === "number" ? initial.chunkIndex : 0;
    const initialChunkCount =
      typeof initial.chunkCount === "number" ? initial.chunkCount : 1;

    let fetched = initial.fetched ?? 0;
    let created = initial.created ?? 0;
    let updated = initial.updated ?? 0;
    let unchanged = initial.unchanged ?? 0;
    let attemptedQueries = initial.attemptedQueries ?? 0;
    let failedQueries = initial.failedQueries ?? 0;
    let completedChunks = 1;

    if (initialChunkCount > 1) {
      for (let offset = 1; offset < initialChunkCount; offset += 1) {
        const chunkIndex = (initialChunkIndex + offset) % initialChunkCount;
        const { res, payload, data } = await syncEventbriteChunk({ chunkIndex });

        if (!res.ok || !payload.json) {
          return {
            ok: false as const,
            error: extractResponseError(
              res,
              payload,
              `Failed while syncing chunk ${chunkIndex + 1}/${initialChunkCount}.`,
            ),
            fetched,
            created,
            updated,
            unchanged,
            attemptedQueries,
            failedQueries,
            completedChunks,
            chunkCount: initialChunkCount,
          };
        }

        fetched += data.fetched ?? 0;
        created += data.created ?? 0;
        updated += data.updated ?? 0;
        unchanged += data.unchanged ?? 0;
        attemptedQueries += data.attemptedQueries ?? 0;
        failedQueries += data.failedQueries ?? 0;
        completedChunks += 1;
      }
    }

    return {
      ok: true as const,
      fetched,
      created,
      updated,
      unchanged,
      attemptedQueries,
      failedQueries,
      completedChunks,
      chunkCount: initialChunkCount,
    };
  };

  const handleEventbriteSync = async () => {
    setError(null);
    setSyncFeedback(null);
    setSyncingEventbrite(true);

    try {
      const { res, payload, data } = await syncEventbriteChunk({});

      if (!res.ok) {
        setSyncFeedback({
          tone: "error",
          text: extractResponseError(res, payload, "Failed to grab Eventbrite events."),
        });
        return;
      }

      if (!payload.json) {
        setSyncFeedback({
          tone: "error",
          text: "Sync endpoint returned an unexpected response format.",
        });
        return;
      }

      const rollup = await runRemainingEventbriteChunks(data);

      if (!rollup.ok) {
        setSyncFeedback({
          tone: "error",
          text: `${rollup.error} Partial totals: ${rollup.fetched} fetched, ${rollup.created} created, ${rollup.updated} updated, ${rollup.unchanged} unchanged.`,
        });
        return;
      }

      const summary = [
        `${rollup.fetched} fetched`,
        `${rollup.created} created`,
        `${rollup.updated} updated`,
        `${rollup.unchanged} unchanged`,
      ].join(", ");

      setSyncFeedback({
        tone: "success",
        text: `${data?.msg || "Eventbrite grab completed."} ${summary}. chunks ${rollup.completedChunks}/${rollup.chunkCount} (queries ${rollup.attemptedQueries}, ${rollup.failedQueries} empty/failed).`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setSyncFeedback({
        tone: "error",
        text: message,
      });
    } finally {
      setSyncingEventbrite(false);
    }
  };

  const handleResetAndResyncEventbrite = async () => {
    if (
      !window.confirm(
        "Delete all Eventbrite events and resync across all chunks? This only removes source='eventbrite' rows.",
      )
    ) {
      return;
    }

    setError(null);
    setSyncFeedback(null);
    setResettingAndSyncingEventbrite(true);

    try {
      const res = await fetch("/api/events/eventbrite/reset-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await parseApiPayload(res);
      const data = (payload.json ?? {}) as {
        error?: string;
        msg?: string;
        deleted?: number;
        fetched?: number;
        created?: number;
        updated?: number;
        unchanged?: number;
        attemptedQueries?: number;
        failedQueries?: number;
        chunkIndex?: number;
        chunkCount?: number;
      };

      if (!res.ok) {
        setSyncFeedback({
          tone: "error",
          text: extractResponseError(
            res,
            payload,
            "Failed to delete and resync Eventbrite events.",
          ),
        });
        return;
      }

      if (!payload.json) {
        setSyncFeedback({
          tone: "error",
          text: "Eventbrite reset sync endpoint returned an unexpected response format.",
        });
        return;
      }

      const rollup = await runRemainingEventbriteChunks(data);
      if (!rollup.ok) {
        setSyncFeedback({
          tone: "error",
          text: `${rollup.error} Partial totals after delete: ${rollup.fetched} fetched, ${rollup.created} created, ${rollup.updated} updated, ${rollup.unchanged} unchanged.`,
        });
        return;
      }

      const summary = [
        `${data.deleted ?? 0} deleted`,
        `${rollup.fetched} fetched`,
        `${rollup.created} created`,
        `${rollup.updated} updated`,
        `${rollup.unchanged} unchanged`,
      ].join(", ");

      setSyncFeedback({
        tone: "success",
        text: `${data.msg || "Eventbrite delete and resync completed."} ${summary}. chunks ${rollup.completedChunks}/${rollup.chunkCount} (queries ${rollup.attemptedQueries}, ${rollup.failedQueries} empty/failed).`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (syncError: unknown) {
      const message =
        syncError instanceof Error ? syncError.message : "Unexpected error";
      setSyncFeedback({
        tone: "error",
        text: message,
      });
    } finally {
      setResettingAndSyncingEventbrite(false);
    }
  };

  const handleCommunitySync = async () => {
    setError(null);
    setCommunitySyncFeedback(null);
    setSyncingCommunity(true);

    try {
      const res = await fetch("/api/events/community/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await parseApiPayload(res);
      const data = (payload.json ?? {}) as {
        error?: string;
        msg?: string;
        fetched?: number;
        matched?: number;
        created?: number;
        updated?: number;
        unchanged?: number;
      };

      if (!res.ok) {
        setCommunitySyncFeedback({
          tone: "error",
          text: extractResponseError(res, payload, "Failed to sync community event feeds."),
        });
        return;
      }

      if (!payload.json) {
        setCommunitySyncFeedback({
          tone: "error",
          text: "Sync endpoint returned an unexpected response format.",
        });
        return;
      }

      const summary = [
        `${data?.matched ?? data?.fetched ?? 0} matched`,
        `${data?.created ?? 0} created`,
        `${data?.updated ?? 0} updated`,
        `${data?.unchanged ?? 0} unchanged`,
      ].join(", ");

      setCommunitySyncFeedback({
        tone: "success",
        text: `${data?.msg || "Community feed sync completed."} ${summary}.`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (syncError: unknown) {
      const message =
        syncError instanceof Error ? syncError.message : "Unexpected error";
      setCommunitySyncFeedback({
        tone: "error",
        text: message,
      });
    } finally {
      setSyncingCommunity(false);
    }
  };

  const handleMeetupSync = async () => {
    setError(null);
    setMeetupSyncFeedback(null);
    setSyncingMeetup(true);

    try {
      const res = await fetch("/api/events/meetup/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await parseApiPayload(res);
      const data = (payload.json ?? {}) as {
        error?: string;
        msg?: string;
        fetched?: number;
        created?: number;
        updated?: number;
        unchanged?: number;
      };

      if (!res.ok) {
        setMeetupSyncFeedback({
          tone: "error",
          text: extractResponseError(res, payload, "Failed to sync Meetup events."),
        });
        return;
      }

      if (!payload.json) {
        setMeetupSyncFeedback({
          tone: "error",
          text: "Sync endpoint returned an unexpected response format.",
        });
        return;
      }

      const summary = [
        `${data?.fetched ?? 0} fetched`,
        `${data?.created ?? 0} created`,
        `${data?.updated ?? 0} updated`,
        `${data?.unchanged ?? 0} unchanged`,
      ].join(", ");

      setMeetupSyncFeedback({
        tone: "success",
        text: `${data?.msg || "Meetup sync completed."} ${summary}.`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (syncError: unknown) {
      const message =
        syncError instanceof Error ? syncError.message : "Unexpected error";
      setMeetupSyncFeedback({
        tone: "error",
        text: message,
      });
    } finally {
      setSyncingMeetup(false);
    }
  };

  const handleResetAndResyncMeetup = async () => {
    if (
      !window.confirm(
        "Delete only Meetup events and resync from Meetup? Manually posted and other-source events will be kept.",
      )
    ) {
      return;
    }

    setError(null);
    setMeetupSyncFeedback(null);
    setResettingAndSyncingMeetup(true);

    try {
      const res = await fetch("/api/events/meetup/reset-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await parseApiPayload(res);
      const data = (payload.json ?? {}) as {
        deleted?: number;
        error?: string;
        msg?: string;
        fetched?: number;
        created?: number;
        updated?: number;
        unchanged?: number;
      };

      if (!res.ok) {
        setMeetupSyncFeedback({
          tone: "error",
          text: extractResponseError(
            res,
            payload,
            "Failed to delete and resync Meetup events.",
          ),
        });
        return;
      }

      if (!payload.json) {
        setMeetupSyncFeedback({
          tone: "error",
          text: "Reset sync endpoint returned an unexpected response format.",
        });
        return;
      }

      const summary = [
        `${data?.deleted ?? 0} deleted`,
        `${data?.fetched ?? 0} fetched`,
        `${data?.created ?? 0} created`,
        `${data?.updated ?? 0} updated`,
        `${data?.unchanged ?? 0} unchanged`,
      ].join(", ");

      setMeetupSyncFeedback({
        tone: "success",
        text: `${data?.msg || "Delete and resync completed."} ${summary}.`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (syncError: unknown) {
      const message =
        syncError instanceof Error ? syncError.message : "Unexpected error";
      setMeetupSyncFeedback({
        tone: "error",
        text: message,
      });
    } finally {
      setResettingAndSyncingMeetup(false);
    }
  };

  const handleResetAndResyncCommunity = async () => {
    if (
      !window.confirm(
        "Delete only community-feed events and resync from community feeds? Manually posted and other-source events will be kept.",
      )
    ) {
      return;
    }

    setError(null);
    setCommunitySyncFeedback(null);
    setResettingAndSyncingCommunity(true);

    try {
      const res = await fetch("/api/events/community/reset-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const payload = await parseApiPayload(res);
      const data = (payload.json ?? {}) as {
        deleted?: number;
        error?: string;
        msg?: string;
        fetched?: number;
        matched?: number;
        created?: number;
        updated?: number;
        unchanged?: number;
      };

      if (!res.ok) {
        setCommunitySyncFeedback({
          tone: "error",
          text: extractResponseError(
            res,
            payload,
            "Failed to delete and resync community events.",
          ),
        });
        return;
      }

      if (!payload.json) {
        setCommunitySyncFeedback({
          tone: "error",
          text: "Reset sync endpoint returned an unexpected response format.",
        });
        return;
      }

      const summary = [
        `${data?.deleted ?? 0} deleted`,
        `${data?.matched ?? data?.fetched ?? 0} matched`,
        `${data?.created ?? 0} created`,
        `${data?.updated ?? 0} updated`,
        `${data?.unchanged ?? 0} unchanged`,
      ].join(", ");

      setCommunitySyncFeedback({
        tone: "success",
        text: `${data?.msg || "Delete and resync completed."} ${summary}.`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (syncError: unknown) {
      const message =
        syncError instanceof Error ? syncError.message : "Unexpected error";
      setCommunitySyncFeedback({
        tone: "error",
        text: message,
      });
    } finally {
      setResettingAndSyncingCommunity(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Community Event Feeds
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Pull local networking events, meetups, panels, workshops, and industry talks
          from configured RSS and ICS feeds. This ignores concert-style events.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            disabled={syncingCommunity || resettingAndSyncingCommunity}
            onClick={handleCommunitySync}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {syncingCommunity ? "Syncing..." : "Sync Community Events"}
          </button>

          <button
            disabled={syncingCommunity || resettingAndSyncingCommunity}
            onClick={handleResetAndResyncCommunity}
            className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resettingAndSyncingCommunity
              ? "Deleting + Syncing..."
              : "Delete Community Events + Resync"}
          </button>

          {communitySyncFeedback && (
            <p
              className={`text-sm ${
                communitySyncFeedback.tone === "error"
                  ? "text-red-600"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              {communitySyncFeedback.text}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Eventbrite Grabber
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Grab events from Eventbrite (career fairs, networking events, job fairs, etc.)
          across major US cities. This will sync events to the database.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            disabled={syncingEventbrite || resettingAndSyncingEventbrite}
            onClick={() => void handleEventbriteSync()}
            className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {syncingEventbrite ? "Grabbing All Chunks..." : "Grab Eventbrite Events"}
          </button>

          <button
            disabled={syncingEventbrite || resettingAndSyncingEventbrite}
            onClick={() => void handleResetAndResyncEventbrite()}
            className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resettingAndSyncingEventbrite
              ? "Deleting + Syncing..."
              : "Delete Eventbrite Events + Resync"}
          </button>

          {syncFeedback && (
            <p
              className={`text-sm ${
                syncFeedback.tone === "error"
                  ? "text-red-600"
                  : "text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {syncFeedback.text}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Meetup Integration
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Sync upcoming Meetup events using the configured location and start-date
          query so your Events tab stays filled with real local events.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            disabled={syncingMeetup || resettingAndSyncingMeetup}
            onClick={() => void handleMeetupSync()}
            className="rounded bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {syncingMeetup ? "Syncing..." : "Sync Meetup Events"}
          </button>

          <button
            disabled={syncingMeetup || resettingAndSyncingMeetup}
            onClick={() => void handleResetAndResyncMeetup()}
            className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {resettingAndSyncingMeetup
              ? "Deleting + Syncing..."
              : "Delete Meetup Events + Resync"}
          </button>

          {meetupSyncFeedback && (
            <p
              className={`text-sm ${
                meetupSyncFeedback.tone === "error"
                  ? "text-red-600"
                  : "text-cyan-700 dark:text-cyan-300"
              }`}
            >
              {meetupSyncFeedback.text}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Post a New Event
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Logged-in users can post events. Only the event owner or an admin can
          edit and remove an event.
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                value={newEvent.title}
                onChange={(event) => updateNewField("title", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Location
              </label>
              <input
                value={newEvent.location}
                onChange={(event) => updateNewField("location", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Date
              </label>
              <input
                value={newEvent.date}
                onChange={(event) => updateNewField("date", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="Thu, Mar 14"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Time
              </label>
              <input
                value={newEvent.time}
                onChange={(event) => updateNewField("time", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="6:00 PM - 8:00 PM"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Host
              </label>
              <input
                value={newEvent.host}
                onChange={(event) => updateNewField("host", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Price
              </label>
              <input
                value={newEvent.price}
                onChange={(event) => updateNewField("price", event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                placeholder="Free"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Registration Link
            </label>
            <input
              value={newEvent.registrationLink}
              onChange={(event) =>
                updateNewField("registrationLink", event.target.value)
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              placeholder="https://example.com/register"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Short Description
            </label>
            <textarea
              value={newEvent.description}
              onChange={(event) =>
                updateNewField("description", event.target.value)
              }
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Full Details
            </label>
            <textarea
              value={newEvent.details}
              onChange={(event) => updateNewField("details", event.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Tags (comma-separated)
            </label>
            <input
              value={newEvent.tagsText}
              onChange={(event) => updateNewField("tagsText", event.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              placeholder="Networking, Careers, Tech"
            />
          </div>

          <button
            type="submit"
            disabled={creating || !isAuthenticated}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creating ? "Posting..." : "Post Event"}
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-200">
          {success}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Active Events
        </h2>

        {activeEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-sm text-gray-600 dark:text-gray-300">
            No active events yet.
          </div>
        ) : (
          activeEvents.map((item) => {
            const canManage = canManageItem(item, currentUserSub, isAdmin);
            const editing = editingId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-5"
              >
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={item.title}
                        onChange={(event) =>
                          updateEventField(item.id, "title", event.target.value)
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <input
                        value={item.location}
                        onChange={(event) =>
                          updateEventField(item.id, "location", event.target.value)
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <input
                        value={item.date}
                        onChange={(event) =>
                          updateEventField(item.id, "date", event.target.value)
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <input
                        value={item.time}
                        onChange={(event) =>
                          updateEventField(item.id, "time", event.target.value)
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <input
                        value={item.host}
                        onChange={(event) =>
                          updateEventField(item.id, "host", event.target.value)
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                      <input
                        value={item.price}
                        onChange={(event) =>
                          updateEventField(item.id, "price", event.target.value)
                        }
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    <input
                      value={item.registrationLink}
                      onChange={(event) =>
                        updateEventField(
                          item.id,
                          "registrationLink",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />

                    <textarea
                      value={item.description}
                      onChange={(event) =>
                        updateEventField(item.id, "description", event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />

                    <textarea
                      value={item.details}
                      onChange={(event) =>
                        updateEventField(item.id, "details", event.target.value)
                      }
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />

                    <input
                      value={tagsToText(item.tags)}
                      onChange={(event) =>
                        updateEventField(item.id, "tags", parseTags(event.target.value))
                      }
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      placeholder="Networking, Careers, Tech"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => handleSave(item.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {savingId === item.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.date} • {item.time}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.location}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Posted by {ownerLabel(item, currentUserSub)}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.details}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={`${item.id}-${tag}`}
                          className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <a
                        href={item.registrationLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Open registration
                      </a>
                      <span className="text-gray-500 dark:text-gray-400">
                        Host: {item.host}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Price: {item.price}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {canManage ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingId(item.id)}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {deletingId === item.id ? "Removing..." : "Remove"}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Only the owner or admin can edit/remove this event.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      {isAdmin && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Archived Events (Admin)
          </h2>

          {archivedEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-sm text-gray-600 dark:text-gray-300">
              No archived events.
            </div>
          ) : (
            archivedEvents.map((item) => (
              <article
                key={`archived-${item.id}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.date} • {item.time} • {item.location}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Archived {formatDateTime(item.deletedAt)}
                  </span>
                </div>
              </article>
            ))
          )}
        </section>
      )}
    </div>
  );
}
