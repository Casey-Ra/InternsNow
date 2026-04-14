"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface InternshipItem {
  id: string;
  company_name: string;
  job_description: string;
  url: string;
  created_at: string;
}

type SyncBoardResult = {
  token: string;
  companyName: string;
  error?: string;
};

type SyncTotals = {
  created?: number;
  updated?: number;
  unchanged?: number;
  matched?: number;
};

type SyncResponse = {
  error?: string;
  msg?: string;
  totals?: SyncTotals;
  boards?: SyncBoardResult[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

export default function ManageInternshipsClient({
  initialData,
  initialGreenhouseBoards,
  initialLeverBoards,
}: {
  initialData: InternshipItem[];
  initialGreenhouseBoards: string;
  initialLeverBoards: string;
}) {
  const [items, setItems] = useState<InternshipItem[]>(initialData || []);
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [greenhouseBoards, setGreenhouseBoards] = useState(initialGreenhouseBoards);
  const [syncingGreenhouse, setSyncingGreenhouse] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [leverBoards, setLeverBoards] = useState(initialLeverBoards);
  const [syncingLever, setSyncingLever] = useState(false);
  const [leverSyncFeedback, setLeverSyncFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialData || []);
  }, [initialData]);

  const startEdit = (id: string) => {
    setEditingId(id);
    setError(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleGreenhouseSync = async () => {
    setError(null);
    setSyncFeedback(null);
    setSyncingGreenhouse(true);

    try {
      const res = await fetch("/api/internships/greenhouse/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardsText: greenhouseBoards.trim() || undefined,
        }),
      });

      const data = (await res.json()) as SyncResponse;
      if (!res.ok) {
        setSyncFeedback({
          tone: "error",
          text: data?.error || "Failed to sync Greenhouse jobs.",
        });
        return;
      }

      const failedBoards = Array.isArray(data?.boards)
        ? data.boards.filter((board) => Boolean(board.error))
        : [];
      const totals = data?.totals ?? {};
      const summary = [
        `${totals.created ?? 0} created`,
        `${totals.updated ?? 0} updated`,
        `${totals.unchanged ?? 0} unchanged`,
        `${totals.matched ?? 0} matched`,
      ].join(", ");
      const failures =
        failedBoards.length > 0
          ? ` Failed boards: ${failedBoards
              .map(
                (board) =>
                  `${board.companyName || board.token} (${board.error ?? "unknown error"})`,
              )
              .join("; ")}`
          : "";

      setSyncFeedback({
        tone: "success",
        text: `${data?.msg || "Greenhouse sync completed."} ${summary}.${failures}`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (error: unknown) {
      setSyncFeedback({
        tone: "error",
        text: getErrorMessage(error),
      });
    } finally {
      setSyncingGreenhouse(false);
    }
  };

  const handleLeverSync = async () => {
    setError(null);
    setLeverSyncFeedback(null);
    setSyncingLever(true);

    try {
      const res = await fetch("/api/internships/lever/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardsText: leverBoards.trim() || undefined,
        }),
      });

      const data = (await res.json()) as SyncResponse;
      if (!res.ok) {
        setLeverSyncFeedback({
          tone: "error",
          text: data?.error || "Failed to sync Lever jobs.",
        });
        return;
      }

      const failedBoards = Array.isArray(data?.boards)
        ? data.boards.filter((board) => Boolean(board.error))
        : [];
      const totals = data?.totals ?? {};
      const summary = [
        `${totals.created ?? 0} created`,
        `${totals.updated ?? 0} updated`,
        `${totals.unchanged ?? 0} unchanged`,
        `${totals.matched ?? 0} matched`,
      ].join(", ");
      const failures =
        failedBoards.length > 0
          ? ` Failed boards: ${failedBoards
              .map(
                (board) =>
                  `${board.companyName || board.token} (${board.error ?? "unknown error"})`,
              )
              .join("; ")}`
          : "";

      setLeverSyncFeedback({
        tone: "success",
        text: `${data?.msg || "Lever sync completed."} ${summary}.${failures}`,
      });

      try {
        router.refresh();
      } catch {
        window.location.reload();
      }
    } catch (err: unknown) {
      setLeverSyncFeedback({
        tone: "error",
        text: getErrorMessage(err),
      });
    } finally {
      setSyncingLever(false);
    }
  };

  const handleSave = async (id: string) => {
    setError(null);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;

    const item = items[idx];

    if (!item.company_name || !item.job_description || !item.url) {
      setError("All fields are required");
      return;
    }

    setSaving(id);

    try {
      const res = await fetch("/api/internships/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save");
        return;
      }

      // update local state with returned data if provided
      if (data?.data) {
        setItems((prev) => prev.map((p) => (p.id === id ? data.data : p)));
      }

      // refresh server-rendered pages so edits reflect everywhere
      try {
        router.refresh();
      } catch {
        window.location.reload();
      }

      setEditingId(null);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this internship? This cannot be undone.")) return;
    setError(null);
    setDeleting(id);

    try {
      const res = await fetch("/api/internships/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send url as well so server can fallback to deleting by url if id mismatches
        body: JSON.stringify({ id, url: items.find((p) => p.id === id)?.url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to delete");
        return;
      }

      // remove locally and refresh server-rendered data
      setItems((prev) => prev.filter((p) => p.id !== id));
      try {
        router.refresh();
      } catch {
        // fallback: full reload
        window.location.reload();
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setDeleting(null);
    }
  };

  const updateField = (id: string, field: keyof InternshipItem, value: string) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import from Greenhouse
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Use one board per line in the format <code>board_token|Company Name</code>.
              Leave it as-is to use <code>GREENHOUSE_BOARDS</code>. Internship-style
              roles are filtered with <code>GREENHOUSE_KEYWORDS</code>.
            </p>
          </div>

          <textarea
            className="min-h-28 w-full rounded border border-emerald-200 bg-white p-3 font-mono text-sm dark:border-emerald-800 dark:bg-gray-900"
            placeholder={"openai|OpenAI\nstripe|Stripe"}
            value={greenhouseBoards}
            onChange={(event) => setGreenhouseBoards(event.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={syncingGreenhouse}
              onClick={handleGreenhouseSync}
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {syncingGreenhouse ? "Syncing..." : "Sync Greenhouse"}
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
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import from Lever
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Use one board per line in the format <code>company_slug|Company Name</code>.
              Leave it as-is to use <code>LEVER_BOARDS</code>. Internship-style
              roles are filtered with <code>LEVER_KEYWORDS</code>.
            </p>
          </div>

          <textarea
            className="min-h-28 w-full rounded border border-blue-200 bg-white p-3 font-mono text-sm dark:border-blue-800 dark:bg-gray-900"
            placeholder={"netflix|Netflix\nplaid|Plaid"}
            value={leverBoards}
            onChange={(event) => setLeverBoards(event.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={syncingLever}
              onClick={handleLeverSync}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {syncingLever ? "Syncing..." : "Sync Lever"}
            </button>

            {leverSyncFeedback && (
              <p
                className={`text-sm ${
                  leverSyncFeedback.tone === "error"
                    ? "text-red-600"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {leverSyncFeedback.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {items.length === 0 && <div className="text-sm text-gray-600">No internships found.</div>}

      {items.map((it) => (
        <div key={it.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
          {editingId === it.id ? (
            <div className="space-y-3">
              <input className="w-full rounded border p-2" value={it.company_name} onChange={(e) => updateField(it.id, "company_name", e.target.value)} />
              <textarea className="w-full rounded border p-2" rows={6} value={it.job_description} onChange={(e) => updateField(it.id, "job_description", e.target.value)} />
              <input className="w-full rounded border p-2" value={it.url} onChange={(e) => updateField(it.id, "url", e.target.value)} />

              <div className="flex items-center space-x-3">
                <button disabled={!!saving} onClick={() => handleSave(it.id)} className="px-3 py-1 bg-blue-600 text-white rounded">{saving === it.id ? "Saving..." : "Save"}</button>
                <button onClick={cancelEdit} className="px-3 py-1 border rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="md:flex md:items-start md:justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{it.company_name}</h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{it.job_description.length > 400 ? `${it.job_description.slice(0, 400)}...` : it.job_description}</p>
                <a href={it.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Open link</a>
              </div>

              <div className="mt-3 md:mt-0 md:ml-4 flex items-center space-x-2">
                <button onClick={() => startEdit(it.id)} className="px-3 py-1 border rounded">Edit</button>
                <button disabled={!!deleting} onClick={() => handleDelete(it.id)} className="px-3 py-1 bg-red-600 text-white rounded">{deleting === it.id ? "Deleting..." : "Delete"}</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
