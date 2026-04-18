import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import pool from "../db";

const MEETUP_GQL_URL = "https://www.meetup.com/gql2";
const MEETUP_PERSISTED_QUERY_HASH =
  process.env.MEETUP_PERSISTED_QUERY_HASH ??
  "3f7480361301be1b3208df0cd724930a22f7741d3c24666ab5b37a381ff4e0e8";
const DEFAULT_START_DATE_RANGE = "2026-04-08T12:00:00.000-04:00[US/Eastern]";

type JsonRecord = Record<string, unknown>;

type MeetupEvent = {
  externalId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  details: string;
  host: string;
  registrationLink: string;
};

export type MeetupSyncRequest = {
  first?: number;
  lat?: number;
  lon?: number;
  startDateRange?: string;
};

export type MeetupSyncResult = {
  ok: boolean;
  message: string;
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
  error?: string;
};

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function pickString(record: JsonRecord, keys: string[]): string {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) {
      return value;
    }
  }
  return "";
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value: Date): string {
  return value.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value: Date): string {
  return value.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTimeRange(start: Date, end?: Date | null): string {
  if (!end) {
    return formatTime(start);
  }
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function normalizeLocation(value: string): string {
  return value || "Location on Meetup";
}

function normalizeDescription(value: string, fallback: string): string {
  const text = stripHtml(value);
  if (text) {
    return text.slice(0, 5000);
  }
  return fallback;
}

function normalizeId(rawId: string, url: string): string {
  if (rawId) {
    return rawId;
  }

  const urlParts = url.split("?")[0].split("#")[0].split("/").filter(Boolean);
  const tail = urlParts[urlParts.length - 1] ?? "";
  return tail || `meetup-${randomUUID()}`;
}

function collectObjects(value: unknown, collector: JsonRecord[]) {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectObjects(item, collector);
    }
    return;
  }

  const record = value as JsonRecord;
  collector.push(record);

  for (const nested of Object.values(record)) {
    collectObjects(nested, collector);
  }
}

function resolveLocation(record: JsonRecord): string {
  const direct = pickString(record, [
    "venueName",
    "venueAddress",
    "location",
    "city",
    "locality",
  ]);
  if (direct) {
    return direct;
  }

  const venue = asRecord(record.venue);
  if (venue) {
    const venueName = pickString(venue, ["name"]);
    const city = pickString(venue, ["city", "locality"]);
    const state = pickString(venue, ["state", "region"]);

    const pieces = [venueName, city, state].filter(Boolean);
    if (pieces.length > 0) {
      return pieces.join(", ");
    }
  }

  return "";
}

function parseDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function parseCandidate(record: JsonRecord): MeetupEvent | null {
  const url = pickString(record, ["eventUrl", "url", "link", "eventLink"]);
  if (!url || !url.includes("meetup.com")) {
    return null;
  }

  const title = pickString(record, ["title", "name", "eventTitle"]);
  if (!title) {
    return null;
  }

  const rawDate = pickString(record, [
    "dateTime",
    "startDateTime",
    "startTime",
    "time",
    "date",
  ]);
  const start = parseDate(rawDate);
  if (!start) {
    return null;
  }

  const rawEnd = pickString(record, ["endTime", "endDateTime"]);
  const end = parseDate(rawEnd);

  const group = asRecord(record.group);
  const host =
    pickString(record, ["host", "groupName"]) ||
    (group ? pickString(group, ["name"]) : "") ||
    "Meetup";

  const descriptionText = pickString(record, ["description", "shortDescription", "summary"]);
  const detailsText = pickString(record, ["plainTextDescription", "howToFindUs"]);

  const location = normalizeLocation(resolveLocation(record));

  const rawId = pickString(record, ["id", "eventId", "urlname"]);
  const externalId = normalizeId(rawId, url);

  const description = normalizeDescription(descriptionText, title);
  const details = normalizeDescription(detailsText || descriptionText, description);

  return {
    externalId,
    title: stripHtml(title).slice(0, 255) || "Untitled Meetup Event",
    date: formatDate(start),
    time: formatTimeRange(start, end),
    location,
    description,
    details,
    host: stripHtml(host).slice(0, 255) || "Meetup",
    registrationLink: url,
  };
}

function dedupeEvents(events: MeetupEvent[]): MeetupEvent[] {
  const seen = new Set<string>();
  const result: MeetupEvent[] = [];

  for (const event of events) {
    const key = `${event.externalId}|${event.registrationLink}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(event);
  }

  return result;
}

async function ensureSourceColumns() {
  await pool.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
      ADD COLUMN IF NOT EXISTS external_id TEXT
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_source ON events (source)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_events_external_id ON events (external_id)
  `);
}

async function upsertMeetupEvent(
  event: MeetupEvent,
): Promise<"created" | "updated" | "unchanged"> {
  const existing = await pool.query(
    `SELECT id, updated_at FROM events WHERE external_id = $1 AND source = 'meetup'`,
    [event.externalId],
  );

  const tags = ["meetup", "networking"];

  if (existing.rows.length === 0) {
    const newId = `evt-${randomUUID()}`;
    await pool.query(
      `
      INSERT INTO events (
        id,
        title,
        date,
        time,
        location,
        description,
        details,
        host,
        price,
        registration_link,
        tags,
        source,
        external_id,
        created_by,
        created_by_email
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'meetup', $12, 'meetup-sync', 'meetup@internsnow.app'
      )
      `,
      [
        newId,
        event.title,
        event.date,
        event.time,
        event.location,
        event.description,
        event.details,
        event.host,
        "See website",
        event.registrationLink,
        tags,
        event.externalId,
      ],
    );
    return "created";
  }

  const previous = existing.rows[0];
  const currentUpdated = new Date(previous.updated_at).getTime();
  if (Date.now() - currentUpdated < 60000) {
    return "unchanged";
  }

  await pool.query(
    `
    UPDATE events SET
      title = $2,
      date = $3,
      time = $4,
      location = $5,
      description = $6,
      details = $7,
      host = $8,
      price = $9,
      registration_link = $10,
      tags = $11,
      updated_at = NOW()
    WHERE external_id = $1 AND source = 'meetup'
    `,
    [
      event.externalId,
      event.title,
      event.date,
      event.time,
      event.location,
      event.description,
      event.details,
      event.host,
      "See website",
      event.registrationLink,
      tags,
    ],
  );

  return "updated";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown Meetup sync error";
}

function getRequestBody(request: MeetupSyncRequest): {
  first: number;
  lat: number;
  lon: number;
  startDateRange: string;
} {
  const first =
    typeof request.first === "number" && Number.isFinite(request.first) && request.first > 0
      ? Math.min(Math.floor(request.first), 50)
      : Math.min(Math.floor(Number(process.env.MEETUP_SYNC_FIRST ?? "12")), 50);

  const latRaw =
    typeof request.lat === "number" && Number.isFinite(request.lat)
      ? request.lat
      : Number(process.env.MEETUP_SYNC_LAT ?? "41.0528");
  const lonRaw =
    typeof request.lon === "number" && Number.isFinite(request.lon)
      ? request.lon
      : Number(process.env.MEETUP_SYNC_LON ?? "-73.5395");

  const lat = Number.isFinite(latRaw) ? latRaw : 41.0528;
  const lon = Number.isFinite(lonRaw) ? lonRaw : -73.5395;

  const startDateRange =
    (request.startDateRange && request.startDateRange.trim()) ||
    process.env.MEETUP_SYNC_START_DATE_RANGE ||
    DEFAULT_START_DATE_RANGE;

  return { first, lat, lon, startDateRange };
}

async function fetchMeetupEvents(request: MeetupSyncRequest): Promise<MeetupEvent[]> {
  const variables = getRequestBody(request);

  const response = await fetch(MEETUP_GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      variables,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: MEETUP_PERSISTED_QUERY_HASH,
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Meetup request failed (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  const objects: JsonRecord[] = [];
  collectObjects(payload, objects);

  const parsed = objects
    .map((record) => parseCandidate(record))
    .filter((event): event is MeetupEvent => Boolean(event));

  return dedupeEvents(parsed);
}

export async function runMeetupSync(
  request: MeetupSyncRequest = {},
): Promise<MeetupSyncResult> {
  try {
    await ensureSourceColumns();
  } catch (error) {
    return {
      ok: false,
      message: "Failed to ensure database schema",
      fetched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      error: getErrorMessage(error),
    };
  }

  let fetched = 0;
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  try {
    const events = await fetchMeetupEvents(request);
    fetched = events.length;

    for (const event of events) {
      try {
        const result = await upsertMeetupEvent(event);
        if (result === "created") {
          created += 1;
        } else if (result === "updated") {
          updated += 1;
        } else {
          unchanged += 1;
        }
      } catch (error) {
        console.error(`Error upserting Meetup event ${event.externalId}:`, error);
      }
    }

    revalidatePath("/events");
    revalidatePath("/student/events");

    return {
      ok: true,
      message: "Meetup sync completed",
      fetched,
      created,
      updated,
      unchanged,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Meetup sync failed",
      fetched,
      created,
      updated,
      unchanged,
      error: getErrorMessage(error),
    };
  }
}
