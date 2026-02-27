"use client";

import * as React from "react";

type Item = { id: number; name: string };

export function MajorAutocomplete({
  selectedLabel,
  onSelect,
}: {
  selectedLabel: string; // formData.major
  onSelect: (it: Item) => void; // set formData.major to it.name
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(selectedLabel ?? "");
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);

  // keep input synced when profile loads
  React.useEffect(() => {
    setQuery(selectedLabel ?? "");
  }, [selectedLabel]);

  React.useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/majors/search?q=${encodeURIComponent(q)}`,
        );
        const data = await res.json();
        setItems(data.items ?? []);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Major / Focus
      </label>

      <input
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Start typing a major..."
      />

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
          <div className="max-h-64 overflow-auto">
            {loading && (
              <div className="px-4 py-2 text-sm opacity-70">Searching…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-4 py-2 text-sm opacity-70">No matches</div>
            )}

            {items.map((it) => (
              <button
                key={it.id}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(it);
                  setQuery(it.name);
                  setOpen(false);
                }}
              >
                {it.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
