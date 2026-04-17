import { describe, expect, test } from "@jest/globals";
import {
  computeCurrentStreakDays,
  computeHustleScore,
  computeInactivityPenalty,
  computeStreakBonus,
  getHustleMomentumLabel,
} from "./hustleScore";

describe("hustleScore", () => {
  test("weights event attendance much more than RSVP", () => {
    expect(
      computeHustleScore({
        daily_login: 1,
        active_site_interval: 1,
        profile_edit: 1,
        event_rsvp: 1,
        event_attended: 1,
        job_application: 1,
      }),
    ).toBe(35);
  });

  test("returns a useful momentum label", () => {
    expect(getHustleMomentumLabel(0)).toBe("Ready to build momentum");
    expect(getHustleMomentumLabel(8)).toBe("Getting started");
    expect(getHustleMomentumLabel(20)).toBe("Nice momentum");
    expect(getHustleMomentumLabel(32)).toBe("Strong week");
  });

  test("penalizes 2 points per inactive day after first activity", () => {
    // Active Apr 14, 16, 17 — first activity Apr 14, one gap (Apr 15) → penalty 2
    expect(
      computeInactivityPenalty(
        ["2026-04-17", "2026-04-16", "2026-04-14"],
        7,
        "2026-04-17",
      ),
    ).toBe(2);

    // Fully active week → no penalty
    expect(
      computeInactivityPenalty(
        ["2026-04-17", "2026-04-16", "2026-04-15", "2026-04-14", "2026-04-13", "2026-04-12", "2026-04-11"],
        7,
        "2026-04-17",
      ),
    ).toBe(0);

    // No activity at all → no penalty (nothing to decay from)
    expect(computeInactivityPenalty([], 7, "2026-04-17")).toBe(0);

    // First activity is today → no inactive days yet
    expect(computeInactivityPenalty(["2026-04-17"], 7, "2026-04-17")).toBe(0);
  });

  test("computes a current streak bonus from consecutive activity days", () => {
    const streakDays = computeCurrentStreakDays(
      ["2026-04-17", "2026-04-16", "2026-04-15", "2026-04-13"],
      "2026-04-17",
    );

    expect(streakDays).toBe(3);
    expect(computeStreakBonus(streakDays)).toBe(3);
  });
});
