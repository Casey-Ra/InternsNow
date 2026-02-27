// app/profile/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <h2 className="text-lg font-semibold">Profile failed to load</h2>
      <p className="mt-2 text-sm text-neutral-300">
        {error.message || "Something went wrong."}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
      >
        Try again
      </button>
    </div>
  );
}
