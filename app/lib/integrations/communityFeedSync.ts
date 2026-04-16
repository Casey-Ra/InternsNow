import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import pool from "../db";
import {
  fetchCommunityFeedEvents,
  formatEventDate,
  formatEventTime,
  getCommunityExcludedKeywords,
  getCommunityKeywords,
  getCommunityLocations,
  getConfiguredCommunityFeedConfigs,
  parseCommunityFeedConfigs,
  type CommunityFeedEvent,
} from "./communityFeeds";

export type CommunityFeedSyncRequest = {
  feedsText?: string;
  keywordsText?: string;
  excludeKeywordsText?: string;
  locationsText?: string;
};

export type CommunityFeedSourceResult = {
  label: string;
  url: string;
  fetched: number;
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
  error?: string;
};

export type CommunityFeedSyncTotals = {
  fetched: number;
  matched: number;
  created: number;
  updated: number;
  unchanged: number;
};

export type CommunityFeedSyncResult = {
  ok: boolean;
  message: string;
  feeds: CommunityFeedSourceResult[];
  keywords: string[];
  locations: string[];
  totals: CommunityFeedSyncTotals;
  status: number;
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown community feed sync error";
}

async function upsertCommunityFeedEvent(
  event: CommunityFeedEvent,
): Promise<"created" | "updated" | "unchanged"> {
  const existing = await pool.query(
    `SELECT id, updated_at FROM events WHERE external_id = $1 AND source = 'community-feed'`,
    [event.externalId],
  );

  const tags = Array.from(
    new Set(["community", "networking", ...event.keywordsMatched].slice(0, 15)),
  );

  const date = formatEventDate(event.startDate);
  const time = formatEventTime(event.startDate, event.endDate, event.allDay);
  const description = event.description || event.title;
  const details = event.details || description;
  const location = event.location || event.feedLabel;

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
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'community-feed', $12, 'community-feed-sync', 'community@internsnow.app'
      )
      `,
      [
        newId,
        event.title,
        date,
        time,
        location,
        description,
        details,
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
    WHERE external_id = $1 AND source = 'community-feed'
    `,
    [
      event.externalId,
      event.title,
      date,
      time,
      location,
      description,
      details,
      event.host,
      "See website",
      event.registrationLink,
      tags,
    ],
  );

  return "updated";
}

export async function runCommunityFeedSync(
  request: CommunityFeedSyncRequest = {},
): Promise<CommunityFeedSyncResult> {
  try {
    await ensureSourceColumns();
  } catch (error) {
    return {
      ok: false,
      message: "Failed to ensure database schema",
      feeds: [],
      keywords: [],
      locations: [],
      totals: { fetched: 0, matched: 0, created: 0, updated: 0, unchanged: 0 },
      status: 500,
    };
  }

  const feeds =
    typeof request.feedsText === "string" && request.feedsText.trim()
      ? parseCommunityFeedConfigs(request.feedsText)
      : getConfiguredCommunityFeedConfigs();

  if (feeds.length === 0) {
    return {
      ok: false,
      message:
        "No community event feeds configured. Add COMMUNITY_EVENT_FEEDS with RSS, ICS, or supported HTML calendar URLs.",
      feeds: [],
      keywords: [],
      locations: [],
      totals: { fetched: 0, matched: 0, created: 0, updated: 0, unchanged: 0 },
      status: 400,
    };
  }

  const keywords = getCommunityKeywords(
    request.keywordsText ?? process.env.COMMUNITY_EVENT_KEYWORDS,
  );
  const excludedKeywords = getCommunityExcludedKeywords(
    request.excludeKeywordsText ?? process.env.COMMUNITY_EVENT_EXCLUDE_KEYWORDS,
  );
  const locations = getCommunityLocations(request.locationsText ?? process.env.COMMUNITY_EVENT_LOCATIONS);

  const feedResults: CommunityFeedSourceResult[] = [];

  for (const feed of feeds) {
    const feedResult: CommunityFeedSourceResult = {
      label: feed.label,
      url: feed.url,
      fetched: 0,
      matched: 0,
      created: 0,
      updated: 0,
      unchanged: 0,
    };

    try {
      const events = await fetchCommunityFeedEvents(feed, {
        keywords,
        excludedKeywords,
        locations,
      });

      feedResult.fetched = events.length;
      feedResult.matched = events.length;

      for (const event of events) {
        const result = await upsertCommunityFeedEvent(event);

        if (result === "created") {
          feedResult.created += 1;
        } else if (result === "updated") {
          feedResult.updated += 1;
        } else {
          feedResult.unchanged += 1;
        }
      }
    } catch (error) {
      feedResults.push({
        ...feedResult,
        error: getErrorMessage(error),
      });
      continue;
    }

    feedResults.push(feedResult);
  }

  const totals = feedResults.reduce<CommunityFeedSyncTotals>(
    (summary, feed) => ({
      fetched: summary.fetched + feed.fetched,
      matched: summary.matched + feed.matched,
      created: summary.created + feed.created,
      updated: summary.updated + feed.updated,
      unchanged: summary.unchanged + feed.unchanged,
    }),
    { fetched: 0, matched: 0, created: 0, updated: 0, unchanged: 0 },
  );

  const hasSuccess = feedResults.some((feed) => !feed.error);
  if (hasSuccess) {
    revalidatePath("/events");
    revalidatePath("/student/events");
  }

  return {
    ok: hasSuccess,
    message: hasSuccess
      ? "Community event feed sync completed"
      : "Community event feed sync failed",
    feeds: feedResults,
    keywords,
    locations,
    totals,
    status: hasSuccess ? 200 : 502,
  };
}