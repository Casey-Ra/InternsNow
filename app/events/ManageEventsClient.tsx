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

  return (
    <div className="space-y-8">
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
