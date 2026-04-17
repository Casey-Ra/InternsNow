"use client";

type LeavePromptModalProps = {
  heading: string;
  body: string;
  confirmLabel: string;
  skipLabel?: string;
  saving?: boolean;
  onConfirm: () => void;
  onSkip: () => void;
};

export default function LeavePromptModal({
  heading,
  body,
  confirmLabel,
  skipLabel = "No, skip",
  saving = false,
  onConfirm,
  onSkip,
}: LeavePromptModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onSkip}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {heading}
        </h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{body}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {skipLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
