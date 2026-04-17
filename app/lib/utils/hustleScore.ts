export const HUSTLE_WINDOW_DAYS = 14;
export const HUSTLE_STREAK_BONUS_PER_DAY = 1;
export const HUSTLE_INACTIVITY_PENALTY_PER_DAY = 2;

export const HUSTLE_ACTIVITY_WEIGHTS = {
  daily_login: 1,
  active_site_interval: 1,
  profile_edit: 3,
  job_application: 5,
  event_rsvp: 5,
  event_attended: 20,
  event_missed: 0,
} as const;

export type HustleActivityType = keyof typeof HUSTLE_ACTIVITY_WEIGHTS;

export type HustleCounts = Record<HustleActivityType, number>;

export function emptyHustleCounts(): HustleCounts {
  return {
    daily_login: 0,
    active_site_interval: 0,
    profile_edit: 0,
    job_application: 0,
    event_rsvp: 0,
    event_attended: 0,
    event_missed: 0,
  };
}

export function computeHustleScore(counts: Partial<HustleCounts>): number {
  return (Object.entries(HUSTLE_ACTIVITY_WEIGHTS) as Array<
    [HustleActivityType, number]
  >).reduce((score, [activityType, weight]) => {
    return score + (counts[activityType] ?? 0) * weight;
  }, 0);
}

export function computeStreakBonus(streakDays: number): number {
  return Math.max(0, streakDays) * HUSTLE_STREAK_BONUS_PER_DAY;
}

export function computeInactivityPenalty(
  activityDays: string[],
  windowDays: number,
  currentDay: string,
): number {
  if (activityDays.length === 0) return 0;

  const uniqueDays = new Set(activityDays);
  // Don't penalize days before the user's first recorded activity
  const earliestDay = activityDays.reduce((min, d) => (d < min ? d : min));
  let inactiveDays = 0;
  const cursor = new Date(`${currentDay}T00:00:00.000Z`);

  for (let i = 0; i < windowDays; i++) {
    const dayKey = cursor.toISOString().slice(0, 10);
    if (dayKey >= earliestDay && !uniqueDays.has(dayKey)) {
      inactiveDays++;
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return inactiveDays * HUSTLE_INACTIVITY_PENALTY_PER_DAY;
}

export function computeCurrentStreakDays(
  activityDays: string[],
  currentDay: string,
): number {
  const uniqueDays = new Set(activityDays);
  let streak = 0;
  const cursor = new Date(`${currentDay}T00:00:00.000Z`);

  while (uniqueDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function getHustleMomentumLabel(score: number): string {
  if (score >= 30) {
    return "Strong week";
  }

  if (score >= 16) {
    return "Nice momentum";
  }

  if (score > 0) {
    return "Getting started";
  }

  return "Ready to build momentum";
}
