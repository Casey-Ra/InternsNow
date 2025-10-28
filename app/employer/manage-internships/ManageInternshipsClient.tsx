"use client";

import React, { useState } from "react";

export interface InternshipItem {
  id: string;
  company_name: string;
  job_description: string;
  url: string;
  created_at: string;
}

export default function ManageInternshipsClient({ initialData }: { initialData: InternshipItem[] }) {
  const [items, setItems] = useState<InternshipItem[]>(initialData || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (id: string) => {
    setEditingId(id);
    setError(null);
  };

  const cancelEdit = () => setEditingId(null);

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

      setEditingId(null);
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
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
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to delete");
        return;
      }

      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (e: any) {
      setError(e?.message || "Unexpected error");
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
