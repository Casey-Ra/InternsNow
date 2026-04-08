import { randomUUID } from "crypto";
import pool from "../db";
import {
  fetchEventbriteEvents,
  getEventbriteOrganizationId,
  mapEventbriteEventToInput,
} from "./eventbrite";

export type EventbriteSyncResult = {
  ok: boolean;
  message: string;
  organizationId: string;
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
  error?: string;
};

export type EventbriteSyncTotals = {
  fetched: number;
  created: number;
  updated: number;
  unchanged: number;
};

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
  input: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    details: string;
    host: string;
    price: string;
    registrationLink: string;
    tags: string[];
  },
): Promise<"created" | "updated" | "unchanged"> {
  const tags = input.tags;

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
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'eventbrite', $12, 'eventbrite-sync', 'eventbrite@internsnow.app'
      )
      `,
      [
        newId,
        input.title,
        input.date,
        input.time,
        input.location,
        input.description,
        input.details,
        input.host,
        input.price,
        input.registrationLink,
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
      host = $8,
      price = $9,
      registration_link = $10,
      tags = $11,
      updated_at = NOW()
    WHERE external_id = $1 AND source = 'eventbrite'
    `,
    [
      eventId,
      input.title,
      input.date,
      input.time,
      input.location,
      input.description,
      input.details,
      input.host,
      input.price,
      input.registrationLink,
      tags,
    ],
  );

  return "updated";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown Eventbrite sync error";
}

export async function runEventbriteSync(
  organizationId?: string,
): Promise<EventbriteSyncResult> {
  try {
    await ensureSourceColumns();
  } catch (error) {
    return {
      ok: false,
      message: "Failed to ensure database schema",
      organizationId: organizationId ?? "unknown",
      fetched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      error: getErrorMessage(error),
    };
  }

  const orgId = organizationId ?? getEventbriteOrganizationId();

  if (!orgId) {
    return {
      ok: false,
      message: "No Eventbrite organization ID configured",
      organizationId: organizationId ?? "unknown",
      fetched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
      error: "EVENTBRITE_ORG_ID not set",
    };
  }

  let fetched = 0;
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  try {
    const { events, venues } = await fetchEventbriteEvents(orgId, {
      pageSize: 100,
    });

    fetched = events.length;

    for (const event of events) {
      const venue = event.venue_id ? venues.get(event.venue_id) : undefined;
      const input = mapEventbriteEventToInput(event, venue);

      const result = await upsertEventbriteEvent(event.id, input);

      if (result === "created") {
        created++;
      } else if (result === "updated") {
        updated++;
      } else {
        unchanged++;
      }
    }
  } catch (error) {
    return {
      ok: false,
      message: "Eventbrite sync failed",
      organizationId: orgId,
      fetched,
      created,
      updated,
      unchanged,
      error: getErrorMessage(error),
    };
  }

  return {
    ok: true,
    message: "Eventbrite sync completed",
    organizationId: orgId,
    fetched,
    created,
    updated,
    unchanged,
  };
}

export async function runAllEventbriteSyncs(): Promise<{
  results: EventbriteSyncResult[];
  totals: EventbriteSyncTotals;
}> {
  const orgId = getEventbriteOrganizationId();
  const results: EventbriteSyncResult[] = [];

  if (!orgId) {
    return {
      results: [{
        ok: false,
        message: "No Eventbrite organization ID configured",
        organizationId: "unknown",
        fetched: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
        error: "EVENTBRITE_ORG_ID not set",
      }],
      totals: { fetched: 0, created: 0, updated: 0, unchanged: 0 },
    };
  }

  const result = await runEventbriteSync(orgId);
  results.push(result);

  const totals = results.reduce<EventbriteSyncTotals>(
    (acc, result) => ({
      fetched: acc.fetched + result.fetched,
      created: acc.created + result.created,
      updated: acc.updated + result.updated,
      unchanged: acc.unchanged + result.unchanged,
    }),
    { fetched: 0, created: 0, updated: 0, unchanged: 0 },
  );

  return { results, totals };
}
