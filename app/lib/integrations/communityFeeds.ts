import Parser from "rss-parser";
import { COMMUNITY_FEED_LIST } from "./communityFeedsList";

export type CommunityFeedConfig = {
  url: string;
  label: string;
};

export type CommunityFeedEvent = {
  externalId: string;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  allDay: boolean;
  location: string;
  description: string;
  details: string;
  host: string;
  registrationLink: string;
  feedLabel: string;
  keywordsMatched: string[];
};

type RssFeedItem = {
  title?: string;
  link?: string;
  guid?: string;
  id?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  categories?: string[];
};

type JsonRecord = Record<string, unknown>;

const DEFAULT_COMMUNITY_KEYWORDS = [
  "networking",
  "meetup",
  "tech talk",
  "industry talk",
  "speaker",
  "panel",
  "fireside",
  "founder",
  "startup",
  "entrepreneur",
  "professional development",
  "career",
  "workshop",
  "webinar",
  "innovation",
  "engineering",
  "product",
  "design",
  "data",
  "ai",
  "cybersecurity",
];

const DEFAULT_EXCLUDED_KEYWORDS = [
  "concert",
  "music",
  "festival",
  "nightlife",
  "party",
  "club",
  "tour",
  "comedy",
  "wrestling",
  "sports",
  "opera",
  "ballet",
];

const rssParser = new Parser<Record<string, never>, RssFeedItem>({
  timeout: 15000,
  headers: {
    "User-Agent": "InternsNow/1.0 (+https://internsnow.app)",
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

function splitConfigValues(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string | null | undefined, limit = 5000): string {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function uniqueLowercase(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)),
  );
}

function safeUrl(value: string): string | null {
  try {
    return new URL(value).toString();
  } catch {
    return null;
  }
}

function toAbsoluteUrl(value: string | null | undefined, baseUrl: string): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function dedupeCommunityEvents(events: CommunityFeedEvent[]): CommunityFeedEvent[] {
  const seen = new Set<string>();

  return events.filter((event) => {
    if (seen.has(event.externalId)) {
      return false;
    }

    seen.add(event.externalId);
    return true;
  });
}

function parseFeedConfigEntry(entry: string): CommunityFeedConfig | null {
  const [rawUrl, rawLabel] = entry.split("|");
  const url = safeUrl(rawUrl?.trim() ?? "");

  if (!url) {
    return null;
  }

  return {
    url,
    label: rawLabel?.trim() || new URL(url).hostname,
  };
}

export function parseCommunityFeedConfigs(raw?: string): CommunityFeedConfig[] {
  const feeds = splitConfigValues(raw)
    .map(parseFeedConfigEntry)
    .filter((feed): feed is CommunityFeedConfig => Boolean(feed));

  const seenUrls = new Set<string>();
  return feeds.filter((feed) => {
    if (seenUrls.has(feed.url)) {
      return false;
    }
    seenUrls.add(feed.url);
    return true;
  });
}

export function getConfiguredCommunityFeedConfigs(): CommunityFeedConfig[] {
  const seenUrls = new Set<string>();

  return COMMUNITY_FEED_LIST
    .map((feed) => ({
      url: safeUrl(feed.url) ?? "",
      label: feed.label?.trim() || feed.url,
    }))
    .filter((feed) => Boolean(feed.url))
    .filter((feed): feed is CommunityFeedConfig => {
      if (seenUrls.has(feed.url)) {
        return false;
      }
      seenUrls.add(feed.url);
      return true;
    });
}

export function getCommunityKeywords(raw?: string): string[] {
  const configured = uniqueLowercase(splitConfigValues(raw));
  return configured.length > 0 ? configured : DEFAULT_COMMUNITY_KEYWORDS;
}

export function getCommunityExcludedKeywords(raw?: string): string[] {
  const configured = uniqueLowercase(splitConfigValues(raw));
  return configured.length > 0 ? configured : DEFAULT_EXCLUDED_KEYWORDS;
}

export function getCommunityLocations(raw?: string): string[] {
  return uniqueLowercase(splitConfigValues(raw));
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordToRegex(keyword: string): RegExp {
  const normalized = keyword.trim().toLowerCase();
  const pattern = normalized
    .split(/\s+/)
    .map((part) => escapeRegex(part))
    .join("\\s+");

  return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, "i");
}

function includesKeyword(haystack: string, keyword: string): boolean {
  return keywordToRegex(keyword).test(haystack);
}

function collectMatchedKeywords(haystack: string, keywords: string[]): string[] {
  return keywords.filter((keyword) => includesKeyword(haystack, keyword));
}

function isFutureEvent(date: Date | null): boolean {
  if (!date) {
    return true;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  return date >= cutoff;
}

function buildHaystack(parts: Array<string | string[] | null | undefined>): string {
  return parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .map((part) => normalizeText(part ?? "", 1000).toLowerCase())
    .filter(Boolean)
    .join(" ");
}

function matchesLocation(haystack: string, locations: string[]): boolean {
  if (locations.length === 0) {
    return true;
  }

  return locations.some((location) => includesKeyword(haystack, location));
}

function shouldIncludeEvent(input: {
  haystack: string;
  locations: string[];
  keywords: string[];
  excludedKeywords: string[];
  startDate: Date | null;
}): { include: boolean; matchedKeywords: string[] } {
  if (!isFutureEvent(input.startDate)) {
    return { include: false, matchedKeywords: [] };
  }

  const matchedKeywords = collectMatchedKeywords(input.haystack, input.keywords);
  if (matchedKeywords.length === 0) {
    return { include: false, matchedKeywords: [] };
  }

  const hasExcludedKeyword = input.excludedKeywords.some((keyword) =>
    includesKeyword(input.haystack, keyword),
  );
  if (hasExcludedKeyword) {
    return { include: false, matchedKeywords: [] };
  }

  if (!matchesLocation(input.haystack, input.locations)) {
    return { include: false, matchedKeywords: [] };
  }

  return { include: true, matchedKeywords };
}

function createFallbackExternalId(feedUrl: string, title: string, date: string): string {
  const slug = `${title}|${date}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `${feedUrl}::${slug}`;
}

function parseRssItem(
  feed: CommunityFeedConfig,
  item: RssFeedItem,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): CommunityFeedEvent | null {
  const title = normalizeText(item.title, 250);
  if (!title) {
    return null;
  }

  const description = normalizeText(
    item.contentSnippet || item.summary || item.content,
    1200,
  );
  const details = normalizeText(item.content || item.summary || item.contentSnippet);
  const startDate = parseDate(item.isoDate || item.pubDate);
  const categories = Array.isArray(item.categories) ? item.categories : [];
  const registrationLink = safeUrl(item.link || "") ?? feed.url;
  const haystack = buildHaystack([
    title,
    description,
    details,
    categories,
    feed.label,
  ]);

  const decision = shouldIncludeEvent({
    haystack,
    locations: options.locations,
    keywords: options.keywords,
    excludedKeywords: options.excludedKeywords,
    startDate,
  });

  if (!decision.include) {
    return null;
  }

  const externalId =
    item.guid || item.id || createFallbackExternalId(feed.url, title, startDate?.toISOString() || "unknown");

  return {
    externalId,
    title,
    startDate,
    endDate: null,
    allDay: false,
    location: "",
    description,
    details,
    host: feed.label,
    registrationLink,
    feedLabel: feed.label,
    keywordsMatched: decision.matchedKeywords,
  };
}

function parseIcsEvent(
  feed: CommunityFeedConfig,
  event: Record<string, unknown>,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): CommunityFeedEvent | null {
  const title = normalizeText(typeof event.summary === "string" ? event.summary : "", 250);
  if (!title) {
    return null;
  }

  const description = normalizeText(
    typeof event.description === "string" ? event.description : "",
    1200,
  );
  const details = normalizeText(typeof event.description === "string" ? event.description : "");
  const location = normalizeText(typeof event.location === "string" ? event.location : "", 300);
  const startDate = parseDate(event.start as string | Date | null | undefined);
  const endDate = parseDate(event.end as string | Date | null | undefined);
  const urlField =
    typeof event.url === "string"
      ? event.url
      : typeof event.url === "object" && event.url && "val" in event.url
        ? String((event.url as { val?: unknown }).val ?? "")
        : "";
  const registrationLink = safeUrl(urlField) ?? feed.url;
  const haystack = buildHaystack([title, description, details, location, feed.label]);

  const decision = shouldIncludeEvent({
    haystack,
    locations: options.locations,
    keywords: options.keywords,
    excludedKeywords: options.excludedKeywords,
    startDate,
  });

  if (!decision.include) {
    return null;
  }

  const uid = typeof event.uid === "string" ? event.uid : createFallbackExternalId(feed.url, title, startDate?.toISOString() || "unknown");
  const datetype = typeof event.datetype === "string" ? event.datetype : "";

  return {
    externalId: `${feed.url}::${uid}`,
    title,
    startDate,
    endDate,
    allDay: datetype === "date",
    location,
    description,
    details,
    host: feed.label,
    registrationLink,
    feedLabel: feed.label,
    keywordsMatched: decision.matchedKeywords,
  };
}

function buildPatchLocation(address: unknown): string {
  if (typeof address === "string") {
    return normalizeText(address, 300);
  }

  if (!isRecord(address)) {
    return "";
  }

  return normalizeText(
    [
      typeof address.name === "string" ? address.name : "",
      typeof address.streetAddress === "string" ? address.streetAddress : "",
      typeof address.city === "string" ? address.city : "",
      typeof address.region === "string" ? address.region : "",
      typeof address.postalCode === "string" ? address.postalCode : "",
    ]
      .filter(Boolean)
      .join(", "),
    300,
  );
}

function parsePatchEvent(
  feed: CommunityFeedConfig,
  event: JsonRecord,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): CommunityFeedEvent | null {
  const title = normalizeText(typeof event.title === "string" ? event.title : "", 250);
  if (!title) {
    return null;
  }

  const description = normalizeText(
    typeof event.summary === "string" ? event.summary : typeof event.body === "string" ? event.body : "",
    1200,
  );
  const details = normalizeText(
    typeof event.body === "string" ? event.body : typeof event.summary === "string" ? event.summary : "",
  );
  const location = buildPatchLocation(event.address);
  const startDate = parseDate(
    typeof event.displayDate === "string"
      ? event.displayDate
      : typeof event.startDate === "string"
        ? event.startDate
        : null,
  );
  const host =
    isRecord(event.patch) && typeof event.patch.name === "string"
      ? normalizeText(event.patch.name, 120)
      : feed.label;
  const registrationLink =
    safeUrl(typeof event.eventSiteUrl === "string" ? event.eventSiteUrl : "") ??
    toAbsoluteUrl(
      typeof event.canonicalUrl === "string"
        ? event.canonicalUrl
        : typeof event.itemAlias === "string"
          ? event.itemAlias
          : null,
      feed.url,
    ) ??
    feed.url;
  const haystack = buildHaystack([
    title,
    description,
    details,
    location,
    host,
    feed.label,
    typeof event.eventType === "string" ? event.eventType : "",
  ]);

  const decision = shouldIncludeEvent({
    haystack,
    locations: options.locations,
    keywords: options.keywords,
    excludedKeywords: options.excludedKeywords,
    startDate,
  });

  if (!decision.include) {
    return null;
  }

  const rawId =
    typeof event.id === "string" || typeof event.id === "number"
      ? String(event.id)
      : typeof event.itemAlias === "string"
        ? event.itemAlias
        : createFallbackExternalId(feed.url, title, startDate?.toISOString() || "unknown");

  return {
    externalId: `${feed.url}::patch::${rawId}`,
    title,
    startDate,
    endDate: null,
    allDay: false,
    location,
    description,
    details,
    host,
    registrationLink,
    feedLabel: feed.label,
    keywordsMatched: decision.matchedKeywords,
  };
}

function collectPatchEventObjects(value: unknown, matches: JsonRecord[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPatchEventObjects(item, matches));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  const looksLikePatchEvent =
    value.type === "event" &&
    typeof value.title === "string" &&
    (typeof value.displayDate === "string" || typeof value.startDate === "string");

  if (looksLikePatchEvent) {
    matches.push(value);
  }

  Object.values(value).forEach((child) => collectPatchEventObjects(child, matches));
}

function extractNextDataJson(html: string): unknown {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(regex)) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      blocks.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return blocks;
}

function collectJsonLdEventObjects(value: unknown, matches: JsonRecord[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdEventObjects(item, matches));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  const rawType = value["@type"];
  const types = Array.isArray(rawType)
    ? rawType.filter((item): item is string => typeof item === "string")
    : typeof rawType === "string"
      ? [rawType]
      : [];

  if (types.includes("Event")) {
    matches.push(value);
  }

  Object.values(value).forEach((child) => collectJsonLdEventObjects(child, matches));
}

function parseJsonLdEvent(
  feed: CommunityFeedConfig,
  event: JsonRecord,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): CommunityFeedEvent | null {
  const title = normalizeText(typeof event.name === "string" ? event.name : "", 250);
  if (!title) {
    return null;
  }

  const description = normalizeText(typeof event.description === "string" ? event.description : "", 1200);
  const location = isRecord(event.location)
    ? normalizeText(
        [
          typeof event.location.name === "string" ? event.location.name : "",
          isRecord(event.location.address) && typeof event.location.address.addressLocality === "string"
            ? event.location.address.addressLocality
            : "",
          isRecord(event.location.address) && typeof event.location.address.addressRegion === "string"
            ? event.location.address.addressRegion
            : "",
        ]
          .filter(Boolean)
          .join(", "),
        300,
      )
    : "";
  const startDate = parseDate(typeof event.startDate === "string" ? event.startDate : null);
  const endDate = parseDate(typeof event.endDate === "string" ? event.endDate : null);
  const registrationLink =
    safeUrl(typeof event.url === "string" ? event.url : "") ??
    safeUrl(typeof event.sameAs === "string" ? event.sameAs : "") ??
    feed.url;
  const haystack = buildHaystack([title, description, location, feed.label]);

  const decision = shouldIncludeEvent({
    haystack,
    locations: options.locations,
    keywords: options.keywords,
    excludedKeywords: options.excludedKeywords,
    startDate,
  });

  if (!decision.include) {
    return null;
  }

  const rawId =
    typeof event["@id"] === "string"
      ? event["@id"]
      : typeof event.url === "string"
        ? event.url
        : createFallbackExternalId(feed.url, title, startDate?.toISOString() || "unknown");

  return {
    externalId: `${feed.url}::jsonld::${rawId}`,
    title,
    startDate,
    endDate,
    allDay: false,
    location,
    description,
    details: description,
    host: feed.label,
    registrationLink,
    feedLabel: feed.label,
    keywordsMatched: decision.matchedKeywords,
  };
}

function extractLiveWhaleEvents(html: string): JsonRecord[] {
  const match = html.match(/var\s+livewhale\s*=\s*(\{[\s\S]+?\});\s*\n/);
  if (!match) {
    return [];
  }

  try {
    const lw = JSON.parse(match[1].replace(/\\\//g, "/")) as unknown;
    if (!isRecord(lw)) {
      return [];
    }

    const calendar = lw.calendar;
    if (!isRecord(calendar)) {
      return [];
    }

    const preload = calendar.preload_data;
    if (!isRecord(preload)) {
      return [];
    }

    const events = preload.events;
    if (!Array.isArray(events)) {
      return [];
    }

    return events.filter(isRecord);
  } catch {
    return [];
  }
}

function parseLiveWhaleEvent(
  feed: CommunityFeedConfig,
  event: JsonRecord,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): CommunityFeedEvent | null {
  const title = normalizeText(typeof event.title === "string" ? event.title : "", 250);
  if (!title) {
    return null;
  }

  if (event.is_canceled === true || event.status === "0") {
    return null;
  }

  const summary = normalizeText(typeof event.summary === "string" ? event.summary : "", 1200);
  const location = normalizeText(typeof event.location === "string" ? event.location : "", 300);
  const categories = Array.isArray(event.categories)
    ? (event.categories as unknown[]).filter((c): c is string => typeof c === "string")
    : [];
  const categoriesAudience = Array.isArray(event.categories_audience)
    ? (event.categories_audience as unknown[]).filter((c): c is string => typeof c === "string")
    : [];
  const tags = Array.isArray(event.tags)
    ? (event.tags as unknown[]).filter((t): t is string => typeof t === "string")
    : [];

  const tsStart = typeof event.ts_start === "number" ? event.ts_start : null;
  const tsEnd = typeof event.ts_end === "number" ? event.ts_end : null;
  const startDate = tsStart !== null ? new Date(tsStart * 1000) : null;
  const endDate = tsEnd !== null ? new Date(tsEnd * 1000) : null;

  const href = typeof event.href === "string" ? event.href : null;
  const registrationLink = toAbsoluteUrl(href, feed.url) ?? feed.url;

  const haystack = buildHaystack([
    title,
    summary,
    location,
    categories,
    categoriesAudience,
    tags,
    feed.label,
  ]);

  const decision = shouldIncludeEvent({
    haystack,
    locations: options.locations,
    keywords: options.keywords,
    excludedKeywords: options.excludedKeywords,
    startDate,
  });

  if (!decision.include) {
    return null;
  }

  const rawId = typeof event.id === "string" || typeof event.id === "number"
    ? String(event.id)
    : createFallbackExternalId(feed.url, title, startDate?.toISOString() || "unknown");

  return {
    externalId: `${feed.url}::lw::${rawId}`,
    title,
    startDate,
    endDate,
    allDay: event.is_all_day === true,
    location,
    description: summary,
    details: summary,
    host: feed.label,
    registrationLink,
    feedLabel: feed.label,
    keywordsMatched: decision.matchedKeywords,
  };
}

function parseHtmlFeedEvents(
  feed: CommunityFeedConfig,
  html: string,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): { events: CommunityFeedEvent[]; discoveredCount: number } {
  // LiveWhale (UConn-style) embedded events
  const liveWhaleObjects = extractLiveWhaleEvents(html);
  const liveWhaleEvents = liveWhaleObjects
    .map((event) => parseLiveWhaleEvent(feed, event, options))
    .filter((event): event is CommunityFeedEvent => Boolean(event));

  // Patch-style __NEXT_DATA__ events
  const nextData = extractNextDataJson(html);
  const patchEventObjects: JsonRecord[] = [];
  collectPatchEventObjects(nextData, patchEventObjects);

  const patchEvents = patchEventObjects
    .map((event) => parsePatchEvent(feed, event, options))
    .filter((event): event is CommunityFeedEvent => Boolean(event));

  const jsonLdEventObjects = extractJsonLdBlocks(html).flatMap((block) => {
    const matches: JsonRecord[] = [];
    collectJsonLdEventObjects(block, matches);
    return matches;
  });

  const jsonLdEvents = jsonLdEventObjects
    .map((event) => parseJsonLdEvent(feed, event, options))
    .filter((event): event is CommunityFeedEvent => Boolean(event));

  const discoveredCount = liveWhaleObjects.length + patchEventObjects.length + jsonLdEventObjects.length;

  return {
    events: dedupeCommunityEvents([...liveWhaleEvents, ...patchEvents, ...jsonLdEvents]),
    discoveredCount,
  };
}

export async function fetchCommunityFeedEvents(
  feed: CommunityFeedConfig,
  options: {
    keywords: string[];
    excludedKeywords: string[];
    locations: string[];
  },
): Promise<CommunityFeedEvent[]> {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": "InternsNow/1.0 (+https://internsnow.app)",
      Accept: "text/calendar, application/rss+xml, application/atom+xml, application/xml, text/xml, text/html",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status})`);
  }

  const text = await response.text();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const looksLikeIcs =
    feed.url.toLowerCase().endsWith(".ics") ||
    contentType.includes("text/calendar") ||
    text.includes("BEGIN:VCALENDAR");
  const looksLikeHtml =
    contentType.includes("text/html") ||
    /<html[\s>]/i.test(text) ||
    text.includes("__NEXT_DATA__");

  if (looksLikeIcs) {
    let parsed: Record<string, unknown>;
    try {
      const icalModule = await import("node-ical");
      parsed = icalModule.parseICS(text) as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `Failed to parse ICS feed: ${error instanceof Error ? error.message : "Unknown ICS parse error"}`,
      );
    }

    const events: CommunityFeedEvent[] = [];

    for (const entry of Object.values(parsed)) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      if (!("type" in entry) || entry.type !== "VEVENT") {
        continue;
      }

      if ("status" in entry && entry.status === "CANCELLED") {
        continue;
      }

      const event = parseIcsEvent(feed, entry as Record<string, unknown>, options);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  if (looksLikeHtml) {
    const htmlResult = parseHtmlFeedEvents(feed, text, options);
    if (htmlResult.discoveredCount > 0) {
      return htmlResult.events;
    }
  }

  try {
    const parsed = await rssParser.parseString(text);
    return (parsed.items ?? [])
      .map((item) => parseRssItem(feed, item, options))
      .filter((event): event is CommunityFeedEvent => Boolean(event));
  } catch (error) {
    if (looksLikeHtml) {
      throw new Error(`HTML calendar page did not expose any supported event data: ${error instanceof Error ? error.message : "Unknown parse error"}`);
    }

    throw error;
  }
}

export function formatEventDate(date: Date | null): string {
  if (!date) {
    return "TBD";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatClockTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEventTime(
  startDate: Date | null,
  endDate: Date | null,
  allDay: boolean,
): string {
  if (!startDate) {
    return "TBD";
  }

  if (allDay) {
    return "All day";
  }

  const start = formatClockTime(startDate);
  if (!endDate) {
    return start;
  }

  return `${start} - ${formatClockTime(endDate)}`;
}