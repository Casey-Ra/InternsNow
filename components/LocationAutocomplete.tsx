// components/LocationAutocomplete.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  onKeyDown,
}: {
  value: string;
  onChange: (next: string) => void;
  onSelect: (it: LocationItem) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSelection, setHasSelection] = useState(Boolean(value.trim()));

  const rootRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const justSelected = useRef(false);

  const q = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    if (!value.trim()) {
      setHasSelection(false);
    }
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (
        !rootRef.current.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      if (justSelected.current) {
        justSelected.current = false;
        return;
      }
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
      } catch (error: unknown) {
        if (!(error instanceof Error) || error.name !== "AbortError") {
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [q]);

  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
  }, [open, items, loading]);

  const dropdown =
    open && (loading || items.length > 0) && pos
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{ position: "absolute", top: pos.top, left: pos.left, width: pos.width }}
            className="z-[9999] overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/95 dark:bg-gray-950/90 backdrop-blur shadow-lg"
          >
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
                        justSelected.current = true;
                        setHasSelection(true);
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef}>
      <input
        value={value}
        onChange={(e) => {
          setHasSelection(false);
          onChange(e.target.value);
        }}
        onFocus={() => {
          if (!hasSelection && q.length >= 2) {
            setOpen(true);
          }
        }}
        onClick={() => {
          if (!hasSelection && q.length >= 2) {
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder ?? "City, State (or City, Country)"}
        className={className}
      />
      {dropdown}
    </div>
  );
}
