"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import OpportunityHustleButton from "./OpportunityHustleButton";
import LeavePromptModal from "./LeavePromptModal";

type OpportunityPageCTAProps = {
  applyUrl: string;
  referenceId: string;
  sourceLabel: string;
  isLoggedIn: boolean;
};

export default function OpportunityPageCTA({
  applyUrl,
  referenceId,
  sourceLabel,
  isLoggedIn,
}: OpportunityPageCTAProps) {
  const router = useRouter();
  const [externalLinkClicked, setExternalLinkClicked] = useState(false);
  const [activityLogged, setActivityLogged] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingHref = useRef<string | null>(null);

  const shouldPrompt = isLoggedIn && externalLinkClicked && !activityLogged;

  // Block browser close / hard refresh
  useEffect(() => {
    if (!shouldPrompt) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [shouldPrompt]);

  // Intercept clicks on internal Next.js links before they navigate
  useEffect(() => {
    if (!shouldPrompt) return;
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      // Let external links (new tab) through
      if (!href || !href.startsWith("/")) return;
      e.preventDefault();
      e.stopPropagation();
      pendingHref.current = href;
      setShowModal(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [shouldPrompt]);

  const navigatePending = useCallback(() => {
    const href = pendingHref.current;
    pendingHref.current = null;
    if (href) {
      router.push(href);
    }
  }, [router]);

  async function handleConfirm() {
    setSaving(true);
    try {
      await fetch("/api/student/hustle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: "job_application",
          referenceType: "opportunity",
          referenceId,
          sourceLabel,
          sourceUrl: applyUrl,
        }),
      });
    } finally {
      setSaving(false);
      setActivityLogged(true);
      setShowModal(false);
      navigatePending();
    }
  }

  function handleSkip() {
    setShowModal(false);
    navigatePending();
  }

  return (
    <>
      <a
        href={applyUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => setExternalLinkClicked(true)}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Apply Now
      </a>

      {isLoggedIn ? (
        <OpportunityHustleButton
          referenceId={referenceId}
          sourceLabel={sourceLabel}
          sourceUrl={applyUrl}
          onInitialStatusLoaded={(hasLogged) => {
            if (hasLogged) setActivityLogged(true);
          }}
          onActivityLogged={() => setActivityLogged(true)}
        />
      ) : null}

      {showModal ? (
        <LeavePromptModal
          heading="Did you apply for this position?"
          body="Log your application now so it counts toward your hustle score. Applications are worth 6 points this week."
          confirmLabel="Yes, log my application"
          skipLabel="No, skip"
          saving={saving}
          onConfirm={() => void handleConfirm()}
          onSkip={handleSkip}
        />
      ) : null}
    </>
  );
}
