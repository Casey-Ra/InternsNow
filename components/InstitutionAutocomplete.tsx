"use client";

import * as React from "react";
import { createPortal } from "react-dom";

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

  const justSelected = React.useRef(false);

  React.useEffect(() => {
    const t = setTimeout(async () => {
      if (justSelected.current) {
        justSelected.current = false;
        return;
      }
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
        setItems(Array.isArray(data) ? data : (data.items ?? []));
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [query]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; width: number } | null>(null);

  React.useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
  }, [open, items, loading]);

  const dropdown =
    open && pos
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "absolute", top: pos.top, left: pos.left, width: pos.width }}
            className="z-[9999] rounded-md border bg-white dark:bg-gray-800 shadow"
          >
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
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    justSelected.current = true;
                    onSelect(it);
                    setQuery(it.name);
                    setOpen(false);
                  }}
                >
                  {it.name}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef}>
      <label className="text-sm">School / University</label>

      <input
        className="mt-1 w-full rounded-md border px-3 py-2"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => {
          if (dropdownRef.current?.contains(document.activeElement)) return;
          setOpen(false);
        }, 150)}
        placeholder="Start typing a school..."
      />
      {dropdown}
    </div>
  );
}
