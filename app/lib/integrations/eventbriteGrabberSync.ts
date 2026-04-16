import { randomUUID } from "crypto";
import pool from "../db";
import {
  grabEventbriteEvents,
  type EventbriteGrabberOptions,
  type GrabbedEvent,
} from "./eventbriteGrabber";

export type EventbriteSyncResult = {
  ok: boolean;
  message: string;
  source: string;
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
  attemptedQueries?: number;
  failedQueries?: number;
  totalQueries?: number;
  chunkIndex?: number;
  chunkCount?: number;
  error?: string;
};

export type EventbriteSyncTotals = {
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
};

export type EventbriteSyncRequest = Pick<
  EventbriteGrabberOptions,
  "chunkIndex" | "maxQueriesPerRun" | "timeoutMs" | "useNextChunk"
>;

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

async function upsertEventbriteEvent(
  eventId: string,
  event: GrabbedEvent,
): Promise<"created" | "updated" | "unchanged"> {
  const tags = ["eventbrite", "grabbed"];

  const existing = await pool.query(
    `SELECT id, updated_at FROM events WHERE external_id = $1 AND source = 'eventbrite'`,
    [eventId],
  );

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
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'eventbrite', $12, 'eventbrite-grabber', 'eventbrite@internsnow.app'
      )
      `,
      [
        newId,
        event.title,
        event.date,
        event.time,
        event.location,
        event.description,
        "",
        "Eventbrite",
        "See website",
        event.url,
        tags,
        eventId,
      ],
    );
    return "created";
  }

  const existingEvent = existing.rows[0];
  const currentUpdated = new Date(existingEvent.updated_at).getTime();
  const newUpdated = Date.now();

  if (newUpdated - currentUpdated < 60000) {
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
      updated_at = NOW()
    WHERE external_id = $1 AND source = 'eventbrite'
    `,
    [
      eventId,
      event.title,
      event.date,
      event.time,
      event.location,
      event.description,
      "",
    ],
  );

  return "updated";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown Eventbrite grabber error";
}

export async function runEventbriteGrabberSync(
  request: EventbriteSyncRequest = {},
): Promise<EventbriteSyncResult> {
  try {
    await ensureSourceColumns();
  } catch (error) {
    return {
      ok: false,
      message: "Failed to ensure database schema",
      source: "grabber",
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
  let attemptedQueries = 0;
  let failedQueries = 0;
  let totalQueries = 0;
  let chunkIndex = 0;
  let chunkCount = 0;

  try {
    const grabResult = await grabEventbriteEvents(request);
    const events = grabResult.events;
    attemptedQueries = grabResult.attemptedQueries;
    failedQueries = grabResult.failedQueries;
    totalQueries = grabResult.totalQueries;
    chunkIndex = grabResult.chunkIndex;
    chunkCount = grabResult.chunkCount;

    fetched = events.length;

    for (const event of events) {
      try {
        const result = await upsertEventbriteEvent(event.id, event);

        if (result === "created") {
          created++;
        } else if (result === "updated") {
          updated++;
        } else {
          unchanged++;
        }
      } catch (err) {
        console.error(`Error upserting event ${event.id}:`, err);
      }
    }
  } catch (error) {
    return {
      ok: false,
      message: "Eventbrite grabber sync failed",
      source: "grabber",
      fetched,
      created,
      updated,
      unchanged,
      attemptedQueries,
      failedQueries,
      totalQueries,
      chunkIndex,
      chunkCount,
      error: getErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Eventbrite grabber sync completed (partial chunk)",
    source: "grabber",
    fetched,
    created,
    updated,
    unchanged,
    attemptedQueries,
    failedQueries,
    totalQueries,
    chunkIndex,
    chunkCount,
  };
}

export async function runAllEventbriteGrabberSyncs(): Promise<{
  results: EventbriteSyncResult[];
  totals: EventbriteSyncTotals;
}> {
  const result = await runEventbriteGrabberSync();

  const totals: EventbriteSyncTotals = {
    fetched: result.fetched,
    created: result.created,
    updated: result.updated,
    unchanged: result.unchanged,
  };

  return { results: [result], totals };
}
