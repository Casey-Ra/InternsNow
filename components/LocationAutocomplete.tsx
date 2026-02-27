// components/LocationAutocomplete.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LocationItem = {
  id: string;
  label: string;
};

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  onSelect: (it: LocationItem) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const q = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        setLoading(true);
        const res = await fetch(
          `/api/lookups/locations?q=${encodeURIComponent(q)}`,
          {
            signal: ac.signal,
            credentials: "include",
          },
        );
        if (!res.ok) {
          setItems([]);
          return;
        }
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch (e: any) {
        if (e?.name !== "AbortError") setItems([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <div ref={rootRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "City, State (or City, Country)"}
        className={className}
      />

      {open && (loading || items.length > 0) ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/95 dark:bg-gray-950/90 backdrop-blur shadow-lg">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
              Searching…
            </div>
          ) : (
            <ul className="max-h-64 overflow-auto py-1">
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-100/70 dark:hover:bg-white/10"
                    onClick={() => {
                      onSelect(it);
                      setOpen(false);
                    }}
                  >
                    {it.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
