"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useRef } from "react";

const ACTIVE_INTERVAL_MS = 5 * 60 * 1000;
const IDLE_TIMEOUT_MS = 60 * 1000;
const TICK_MS = 30 * 1000;
const HUSTLE_ACTIVITY_RECORDED_EVENT = "hustle:activity-recorded";

export default function HustleActivityTracker() {
  const { user, isLoading } = useUser();
  const accumulatedMsRef = useRef(0);
  const lastTickAtRef = useRef(Date.now());
  const lastInteractionAtRef = useRef(Date.now());
  const isPostingRef = useRef(false);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    accumulatedMsRef.current = 0;
    lastTickAtRef.current = Date.now();
    lastInteractionAtRef.current = Date.now();
    isPostingRef.current = false;

    const markInteraction = () => {
      lastInteractionAtRef.current = Date.now();
    };

    const flushActiveInterval = async () => {
      if (isPostingRef.current) {
        return;
      }

      isPostingRef.current = true;

      try {
        const response = await fetch("/api/student/hustle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityType: "active_site_interval",
            referenceType: "session",
            sourceLabel: "Active on site",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to record active interval");
        }

        window.dispatchEvent(new Event(HUSTLE_ACTIVITY_RECORDED_EVENT));
      } catch (error) {
        console.error("Failed to record active hustle interval:", error);
      } finally {
        isPostingRef.current = false;
      }
    };

    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTickAtRef.current;
      lastTickAtRef.current = now;

      if (document.visibilityState !== "visible") {
        return;
      }

      if (now - lastInteractionAtRef.current > IDLE_TIMEOUT_MS) {
        return;
      }

      accumulatedMsRef.current += elapsed;

      if (accumulatedMsRef.current < ACTIVE_INTERVAL_MS) {
        return;
      }

      accumulatedMsRef.current -= ACTIVE_INTERVAL_MS;
      void flushActiveInterval();
    };

    const intervalId = window.setInterval(tick, TICK_MS);

    const eventOptions: AddEventListenerOptions = { passive: true };
    window.addEventListener("pointerdown", markInteraction, eventOptions);
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("scroll", markInteraction, eventOptions);
    window.addEventListener("mousemove", markInteraction, eventOptions);
    window.addEventListener("touchstart", markInteraction, eventOptions);
    window.addEventListener("focus", markInteraction);
    document.addEventListener("visibilitychange", markInteraction);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("scroll", markInteraction);
      window.removeEventListener("mousemove", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      window.removeEventListener("focus", markInteraction);
      document.removeEventListener("visibilitychange", markInteraction);
    };
  }, [isLoading, user]);

  return null;
}
