import { randomUUID } from "crypto";
import pool from "../db";
import { inferEventEnd } from "@/app/lib/utils/eventTiming";
import {
  computeHustleScore,
  computeCurrentStreakDays,
  computeStreakBonus,
  computeInactivityPenalty,
  emptyHustleCounts,
  getHustleMomentumLabel,
  HUSTLE_ACTIVITY_WEIGHTS,
  HUSTLE_WINDOW_DAYS,
  type HustleActivityType,
  type HustleCounts,
} from "@/app/lib/utils/hustleScore";

export type HustleReferenceType = "event" | "opportunity" | "session";

export interface StudentHustleActivity {
  id: string;
  auth0Sub: string;
  activityType: HustleActivityType;
  referenceType: HustleReferenceType;
  referenceId: string | null;
  referenceKey: string;
  dedupeKey: string;
  sourceLabel: string;
  sourceUrl: string | null;
  sourceDate: string | null;
  sourceTime: string | null;
  sourceLocation: string | null;
  sourceEndsAt: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordHustleActivityInput {
  auth0Sub: string;
  activityType: HustleActivityType;
  referenceType: HustleReferenceType;
  referenceId?: string | null;
  sourceLabel: string;
  sourceUrl?: string | null;
  sourceDate?: string | null;
  sourceTime?: string | null;
  sourceLocation?: string | null;
  occurredAt?: Date;
}

export interface PendingAttendanceConfirmation {
  referenceKey: string;
  referenceId: string | null;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  endedAt: string | null;
}

export interface HustleReferenceStatus {
  jobApplication: boolean;
  eventRsvp: boolean;
  eventAttended: boolean;
  eventMissed: boolean;
}

export interface WeeklyHustleSummary {
  score: number;
  streakDays: number;
  streakBonus: number;
  inactivityPenalty: number;
  counts: HustleCounts;
  weights: typeof HUSTLE_ACTIVITY_WEIGHTS;
  windowDays: number;
  momentumLabel: string;
  pendingAttendanceConfirmations: PendingAttendanceConfirmation[];
}

let schemaEnsured = false;

function formatUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalizeKeyPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function buildHustleReferenceKey(input: {
  referenceType: HustleReferenceType;
  referenceId?: string | null;
  sourceLabel: string;
  sourceDate?: string | null;
  sourceTime?: string | null;
}): string {
  const { referenceType, referenceId, sourceLabel, sourceDate, sourceTime } =
    input;

  if (referenceId && referenceId.trim()) {
    return `${referenceType}:${referenceId.trim()}`;
  }

  const fallback = normalizeKeyPart(
    [sourceLabel, sourceDate ?? "", sourceTime ?? ""].filter(Boolean).join("|"),
  );

  return `${referenceType}:${fallback || "manual-entry"}`;
}

function buildDedupeKey(
  activityType: HustleActivityType,
  referenceKey: string,
): string {
  return `${activityType}:${referenceKey}`;
}

async function ensureStudentHustleActivitySchema() {
  if (schemaEnsured) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_hustle_activity (
      id TEXT PRIMARY KEY,
      auth0_sub TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      reference_type TEXT NOT NULL,
      reference_id TEXT,
      reference_key TEXT NOT NULL,
      dedupe_key TEXT NOT NULL,
      source_label TEXT NOT NULL,
      source_url TEXT,
      source_date TEXT,
      source_time TEXT,
      source_location TEXT,
      source_ends_at TIMESTAMP WITH TIME ZONE,
      occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE student_hustle_activity
      ADD COLUMN IF NOT EXISTS auth0_sub TEXT,
      ADD COLUMN IF NOT EXISTS activity_type TEXT,
      ADD COLUMN IF NOT EXISTS reference_type TEXT,
      ADD COLUMN IF NOT EXISTS reference_id TEXT,
      ADD COLUMN IF NOT EXISTS reference_key TEXT,
      ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
      ADD COLUMN IF NOT EXISTS source_label TEXT,
      ADD COLUMN IF NOT EXISTS source_url TEXT,
      ADD COLUMN IF NOT EXISTS source_date TEXT,
      ADD COLUMN IF NOT EXISTS source_time TEXT,
      ADD COLUMN IF NOT EXISTS source_location TEXT,
      ADD COLUMN IF NOT EXISTS source_ends_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_student_hustle_activity_user_date
    ON student_hustle_activity (auth0_sub, occurred_at DESC)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_student_hustle_activity_reference
    ON student_hustle_activity (auth0_sub, reference_key)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_student_hustle_activity_pending
    ON student_hustle_activity (auth0_sub, activity_type, source_ends_at DESC)
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_student_hustle_activity_dedupe
    ON student_hustle_activity (auth0_sub, dedupe_key)
  `);

  schemaEnsured = true;
}

function toIso(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function mapStudentHustleActivity(
  row: Record<string, unknown>,
): StudentHustleActivity {
  return {
    id: String(row.id ?? ""),
    auth0Sub: String(row.auth0_sub ?? ""),
    activityType: row.activity_type as HustleActivityType,
    referenceType: row.reference_type as HustleReferenceType,
    referenceId:
      typeof row.reference_id === "string" ? row.reference_id : null,
    referenceKey: String(row.reference_key ?? ""),
    dedupeKey: String(row.dedupe_key ?? ""),
    sourceLabel: String(row.source_label ?? ""),
    sourceUrl: typeof row.source_url === "string" ? row.source_url : null,
    sourceDate: typeof row.source_date === "string" ? row.source_date : null,
    sourceTime: typeof row.source_time === "string" ? row.source_time : null,
    sourceLocation:
      typeof row.source_location === "string" ? row.source_location : null,
    sourceEndsAt: toIso(row.source_ends_at),
    occurredAt: toIso(row.occurred_at) ?? new Date(0).toISOString(),
    createdAt: toIso(row.created_at) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updated_at) ?? new Date(0).toISOString(),
  };
}

export async function recordStudentHustleActivity(
  input: RecordHustleActivityInput,
): Promise<{ created: boolean; activity: StudentHustleActivity }> {
  await ensureStudentHustleActivitySchema();

  const referenceKey = buildHustleReferenceKey(input);
  const dedupeKey = buildDedupeKey(input.activityType, referenceKey);
  const sourceEndsAt =
    input.referenceType === "event"
      ? inferEventEnd(input.sourceDate ?? "", input.sourceTime ?? "")
      : null;

  const insertResult = await pool.query(
    `
      INSERT INTO student_hustle_activity (
        id,
        auth0_sub,
        activity_type,
        reference_type,
        reference_id,
        reference_key,
        dedupe_key,
        source_label,
        source_url,
        source_date,
        source_time,
        source_location,
        source_ends_at,
        occurred_at
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14
      )
      ON CONFLICT (auth0_sub, dedupe_key) DO NOTHING
      RETURNING
        id,
        auth0_sub,
        activity_type,
        reference_type,
        reference_id,
        reference_key,
        dedupe_key,
        source_label,
        source_url,
        source_date,
        source_time,
        source_location,
        source_ends_at,
        occurred_at,
        created_at,
        updated_at
    `,
    [
      `hstl-${randomUUID()}`,
      input.auth0Sub,
      input.activityType,
      input.referenceType,
      input.referenceId ?? null,
      referenceKey,
      dedupeKey,
      input.sourceLabel.trim(),
      input.sourceUrl ?? null,
      input.sourceDate ?? null,
      input.sourceTime ?? null,
      input.sourceLocation ?? null,
      sourceEndsAt,
      input.occurredAt ?? new Date(),
    ],
  );

  if (insertResult.rows[0]) {
    return {
      created: true,
      activity: mapStudentHustleActivity(
        insertResult.rows[0] as Record<string, unknown>,
      ),
    };
  }

  const existingResult = await pool.query(
    `
      SELECT
        id,
        auth0_sub,
        activity_type,
        reference_type,
        reference_id,
        reference_key,
        dedupe_key,
        source_label,
        source_url,
        source_date,
        source_time,
        source_location,
        source_ends_at,
        occurred_at,
        created_at,
        updated_at
      FROM student_hustle_activity
      WHERE auth0_sub = $1
        AND dedupe_key = $2
      LIMIT 1
    `,
    [input.auth0Sub, dedupeKey],
  );

  return {
    created: false,
    activity: mapStudentHustleActivity(
      existingResult.rows[0] as Record<string, unknown>,
    ),
  };
}

export async function recordDailyLogin(
  auth0Sub: string,
  now = new Date(),
): Promise<{ created: boolean; activity: StudentHustleActivity }> {
  const dayKey = formatUtcDayKey(now);

  return recordStudentHustleActivity({
    auth0Sub,
    activityType: "daily_login",
    referenceType: "session",
    referenceId: dayKey,
    sourceLabel: `Daily login ${dayKey}`,
    occurredAt: now,
  });
}

export async function recordDailyProfileEdit(
  auth0Sub: string,
  now = new Date(),
): Promise<{ created: boolean; activity: StudentHustleActivity }> {
  const dayKey = formatUtcDayKey(now);

  return recordStudentHustleActivity({
    auth0Sub,
    activityType: "profile_edit",
    referenceType: "session",
    referenceId: dayKey,
    sourceLabel: `Profile updated ${dayKey}`,
    occurredAt: now,
  });
}

export async function recordActiveSiteInterval(
  auth0Sub: string,
  now = new Date(),
): Promise<{ created: boolean; activity: StudentHustleActivity }> {
  const bucketStart = new Date(
    Math.floor(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000),
  );

  return recordStudentHustleActivity({
    auth0Sub,
    activityType: "active_site_interval",
    referenceType: "session",
    referenceId: bucketStart.toISOString(),
    sourceLabel: "Active on site",
    occurredAt: now,
  });
}

export async function getWeeklyHustleSummary(
  auth0Sub: string,
  now = new Date(),
): Promise<WeeklyHustleSummary> {
  await ensureStudentHustleActivitySchema();

  const counts = emptyHustleCounts();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - HUSTLE_WINDOW_DAYS);

  const countsResult = await pool.query(
    `
      SELECT
        COUNT(*) FILTER (
          WHERE activity_type = 'daily_login'
            AND occurred_at >= $2
        ) AS daily_login_count,
        COUNT(*) FILTER (
          WHERE activity_type = 'active_site_interval'
            AND occurred_at >= $2
        ) AS active_site_interval_count,
        COUNT(*) FILTER (
          WHERE activity_type = 'profile_edit'
            AND occurred_at >= $2
        ) AS profile_edit_count,
        COUNT(*) FILTER (
          WHERE activity_type = 'job_application'
            AND occurred_at >= $2
        ) AS job_application_count,
        COUNT(*) FILTER (
          WHERE activity_type = 'event_rsvp'
            AND occurred_at >= $2
        ) AS event_rsvp_count,
        COUNT(*) FILTER (
          WHERE activity_type = 'event_attended'
            AND occurred_at >= $2
        ) AS event_attended_count,
        COUNT(*) FILTER (
          WHERE activity_type = 'event_missed'
            AND occurred_at >= $2
        ) AS event_missed_count
      FROM student_hustle_activity
      WHERE auth0_sub = $1
    `,
    [auth0Sub, windowStart],
  );

  const countRow = countsResult.rows[0] as Record<string, unknown> | undefined;
  counts.daily_login = Number(countRow?.daily_login_count ?? 0);
  counts.active_site_interval = Number(
    countRow?.active_site_interval_count ?? 0,
  );
  counts.profile_edit = Number(countRow?.profile_edit_count ?? 0);
  counts.job_application = Number(countRow?.job_application_count ?? 0);
  counts.event_rsvp = Number(countRow?.event_rsvp_count ?? 0);
  counts.event_attended = Number(countRow?.event_attended_count ?? 0);
  counts.event_missed = Number(countRow?.event_missed_count ?? 0);

  const promptWindowStart = new Date(now);
  promptWindowStart.setDate(promptWindowStart.getDate() - 14);

  const activityDaysResult = await pool.query(
    `
      SELECT DISTINCT ((occurred_at AT TIME ZONE 'UTC')::date)::text AS activity_day
      FROM student_hustle_activity
      WHERE auth0_sub = $1
      ORDER BY activity_day DESC
      LIMIT 400
    `,
    [auth0Sub],
  );

  const pendingResult = await pool.query(
    `
      SELECT
        pending.reference_key,
        pending.reference_id,
        pending.source_label,
        pending.source_date,
        pending.source_time,
        pending.source_location,
        pending.source_ends_at
      FROM (
        SELECT DISTINCT ON (reference_key)
          reference_key,
          reference_id,
          source_label,
          source_date,
          source_time,
          source_location,
          source_ends_at
        FROM student_hustle_activity rsvp
        WHERE rsvp.auth0_sub = $1
          AND rsvp.activity_type = 'event_rsvp'
          AND rsvp.source_ends_at IS NOT NULL
          AND rsvp.source_ends_at <= $2
          AND rsvp.source_ends_at >= $3
          AND NOT EXISTS (
            SELECT 1
            FROM student_hustle_activity answered
            WHERE answered.auth0_sub = rsvp.auth0_sub
              AND answered.reference_key = rsvp.reference_key
              AND answered.activity_type IN ('event_attended', 'event_missed')
          )
        ORDER BY reference_key, source_ends_at DESC
      ) pending
      ORDER BY pending.source_ends_at DESC
      LIMIT 5
    `,
    [auth0Sub, now, promptWindowStart],
  );

  const pendingAttendanceConfirmations = pendingResult.rows.map((row) => ({
    referenceKey: String(row.reference_key ?? ""),
    referenceId:
      typeof row.reference_id === "string" ? row.reference_id : null,
    title: String(row.source_label ?? ""),
    date: typeof row.source_date === "string" ? row.source_date : null,
    time: typeof row.source_time === "string" ? row.source_time : null,
    location:
      typeof row.source_location === "string" ? row.source_location : null,
    endedAt: toIso(row.source_ends_at),
  }));

  const activityDays = activityDaysResult.rows.map((row) =>
    String(row.activity_day ?? ""),
  );
  const currentDay = formatUtcDayKey(now);
  const streakDays = computeCurrentStreakDays(activityDays, currentDay);
  const streakBonus = computeStreakBonus(streakDays);
  const inactivityPenalty = computeInactivityPenalty(
    activityDays,
    HUSTLE_WINDOW_DAYS,
    currentDay,
  );
  const score = Math.max(
    0,
    computeHustleScore(counts) + streakBonus - inactivityPenalty,
  );

  return {
    score,
    streakDays,
    streakBonus,
    inactivityPenalty,
    counts,
    weights: HUSTLE_ACTIVITY_WEIGHTS,
    windowDays: HUSTLE_WINDOW_DAYS,
    momentumLabel: getHustleMomentumLabel(score),
    pendingAttendanceConfirmations,
  };
}

export async function getHustleReferenceStatus(
  auth0Sub: string,
  referenceKey: string,
): Promise<HustleReferenceStatus> {
  await ensureStudentHustleActivitySchema();

  const result = await pool.query(
    `
      SELECT activity_type
      FROM student_hustle_activity
      WHERE auth0_sub = $1
        AND reference_key = $2
    `,
    [auth0Sub, referenceKey],
  );

  return result.rows.reduce<HustleReferenceStatus>(
    (status, row) => {
      switch (row.activity_type) {
        case "job_application":
          status.jobApplication = true;
          break;
        case "event_rsvp":
          status.eventRsvp = true;
          break;
        case "event_attended":
          status.eventAttended = true;
          break;
        case "event_missed":
          status.eventMissed = true;
          break;
        default:
          break;
      }
      return status;
    },
    {
      jobApplication: false,
      eventRsvp: false,
      eventAttended: false,
      eventMissed: false,
    },
  );
}
