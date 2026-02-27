"use client";

import * as React from "react";

export function InstitutionAutocomplete({
  value,
  onSelect,
}: {
  value: { id: number; name: string } | null;
  onSelect: (v: { id: number; name: string }) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value?.name ?? "");
  const [items, setItems] = React.useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // keep input in sync if parent changes value (e.g. initial load)
    setQuery(value?.name ?? "");
  }, [value?.id]);

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
          `/api/institutions/search?q=${encodeURIComponent(q)}`,
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
      <label className="text-sm">School / University</label>

      <input
        className="mt-1 w-full rounded-md border px-3 py-2"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)} // closes after click
        placeholder="Start typing a school..."
      />

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow">
          <div className="max-h-64 overflow-auto">
            {loading && (
              <div className="px-3 py-2 text-sm opacity-70">Searching…</div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-3 py-2 text-sm opacity-70">No matches</div>
            )}
            {items.map((it) => (
              <button
                key={it.id}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
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
