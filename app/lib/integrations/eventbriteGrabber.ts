import {
  EVENTBRITE_GRABBER_EXCLUDE_KEYWORDS,
  EVENTBRITE_GRABBER_KEYWORDS,
  EVENTBRITE_GRABBER_LOCATIONS,
} from "./eventbriteGrabberConfig";

export type GrabbedEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  url: string;
  source: string;
};

export type EventbriteGrabberRunResult = {
  events: GrabbedEvent[];
  attemptedQueries: number;
  failedQueries: number;
  totalQueries: number;
  chunkIndex: number;
  chunkCount: number;
};

export type EventbriteGrabberOptions = {
  chunkIndex?: number;
  useNextChunk?: boolean;
  maxQueriesPerRun?: number;
  timeoutMs?: number;
};

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getConfiguredKeywords(): string[] {
  return unique(EVENTBRITE_GRABBER_KEYWORDS);
}

function getConfiguredLocations(): string[] {
  return unique(EVENTBRITE_GRABBER_LOCATIONS);
}

function getConfiguredExcludeKeywords(): string[] {
  return unique(EVENTBRITE_GRABBER_EXCLUDE_KEYWORDS);
}

function toEventbriteSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function getTimeoutMs(override?: number): number {
  if (Number.isFinite(override) && Number(override) >= 1000) {
    return Math.floor(Number(override));
  }

  const raw = Number(process.env.EVENTBRITE_GRABBER_TIMEOUT_MS ?? "12000");
  if (!Number.isFinite(raw) || raw < 1000) {
    return 12000;
  }
  return Math.floor(raw);
}

function getMaxQueriesPerRun(totalQueries: number, override?: number): number {
  if (Number.isFinite(override) && Number(override) > 0) {
    return Math.max(1, Math.min(Math.floor(Number(override)), totalQueries));
  }

  const raw = Number(process.env.EVENTBRITE_GRABBER_MAX_QUERIES_PER_RUN ?? "25");
  if (!Number.isFinite(raw) || raw <= 0) {
    return Math.min(25, totalQueries);
  }
  return Math.max(1, Math.min(Math.floor(raw), totalQueries));
}

function getChunkIndex(chunkCount: number, override?: number): number {
  if (Number.isInteger(override) && Number(override) >= 0) {
    return Number(override) % chunkCount;
  }

  const explicit = Number(process.env.EVENTBRITE_GRABBER_CHUNK_INDEX);
  if (Number.isInteger(explicit) && explicit >= 0) {
    return explicit % chunkCount;
  }

  // Rotate chunks daily when no explicit index is set.
  const dayOfYear = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  return dayOfYear % chunkCount;
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractEventId(url: string): string {
  const match = url.match(/\/e\/[^/?"#]*-(\d+)(?:[?#]|$)/i);
  if (match) {
    return match[1];
  }

  // Last-resort fallback when URL shape changes: keep a deterministic id from the path.
  const path = url.split("?")[0].split("#")[0];
  const tail = path.split("/").filter(Boolean).pop() ?? path;
  return `eb-${tail}`;
}

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function normalizeLocationForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function locationNeedles(requestedLocation: string): string[] {
  const normalized = normalizeLocationForMatch(requestedLocation);
  if (!normalized) {
    return [];
  }

  const parts = normalized.split(" ").filter(Boolean);
  const cityPart = normalizeLocationForMatch(requestedLocation.split(",")[0] ?? requestedLocation);

  const countyNeedles = /fairfield\s+county/i.test(requestedLocation)
    ? [
        "stamford",
        "norwalk",
        "fairfield",
        "greenwich",
        "westport",
        "darien",
        "new canaan",
        "bridgeport",
        "ct",
      ]
    : [];

  return unique([
    cityPart,
    normalized,
    ...countyNeedles,
    ...parts.filter((p) => p.length >= 4),
  ]);
}

function matchesRequestedLocation(eventLocation: string, requestedLocation: string): boolean {
  const haystack = normalizeLocationForMatch(eventLocation);
  const needles = locationNeedles(requestedLocation);
  if (!haystack || needles.length === 0) {
    return false;
  }

  return needles.some((needle) => needle.length >= 2 && haystack.includes(needle));
}

function normalizeForRelevance(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeKeyword(value: string): string[] {
  const stopWords = new Set(["in", "and", "for", "the", "event", "events", "fair"]);
  return normalizeForRelevance(value)
    .split(" ")
    .filter((token) => token.length >= 4 && !stopWords.has(token));
}

function matchesKeywordIntent(searchable: string, keyword: string): boolean {
  const haystack = normalizeForRelevance(searchable);
  const normalizedKeyword = normalizeForRelevance(keyword);

  if (normalizedKeyword && haystack.includes(normalizedKeyword)) {
    return true;
  }

  const tokens = tokenizeKeyword(keyword);
  if (tokens.length === 0) {
    return true;
  }

  const hits = tokens.filter((token) => haystack.includes(token)).length;
  const requiredHits = tokens.length <= 2 ? 1 : 2;
  return hits >= requiredHits;
}

function matchesExcludeKeywords(searchable: string, excludeKeywords: string[]): boolean {
  const haystack = normalizeForRelevance(searchable);
  return excludeKeywords.some((keyword) => {
    const needle = normalizeForRelevance(keyword);
    return needle.length >= 3 && haystack.includes(needle);
  });
}

function buildEventFromCard(
  cardHtml: string,
  location: string,
  keyword: string,
  excludeKeywords: string[],
): GrabbedEvent | null {
  const eventUrlMatch = cardHtml.match(/href="(https:\/\/www\.eventbrite\.com\/e\/[^"?#]+(?:\?[^"#]*)?)"/i);
  if (!eventUrlMatch) {
    return null;
  }

  const eventUrl = eventUrlMatch[1];
  const eventId = extractEventId(eventUrl);

  const titleMatch = cardHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
  const titleIndex = titleMatch?.index ?? 0;
  const localContext = cardHtml.slice(Math.max(0, titleIndex - 120), titleIndex + 1400);
  const pMatches = Array.from(localContext.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));

  const rawTitle = normalizeText(titleMatch?.[1]);
  const paragraphValues = pMatches
    .map((m) => normalizeText(m?.[1]))
    .filter((value) => value.length > 0 && value.length <= 120);

  const looksLikeDateTime = (value: string): boolean =>
    /\b(mon|tue|wed|thu|fri|sat|sun|today|tomorrow)\b|\b\d{1,2}:\d{2}\s?(am|pm)\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(
      value,
    );
  const looksLikeStatus = (value: string): boolean =>
    /almost full|sold out|few tickets left/i.test(value);
  const looksLikeLocation = (value: string): boolean =>
    /·|\blocation\b|\bnew york\b|\bbrooklyn\b|\bmanhattan\b|\bqueens\b|\bbronx\b|\bstaten island\b|\b[a-z]+,\s?[a-z]{2}\b/i.test(
      value,
    );

  const rawDateTime =
    paragraphValues.find((value) => looksLikeDateTime(value) && !looksLikeStatus(value)) ?? "";
  const rawLocation =
    paragraphValues.find((value) => !looksLikeStatus(value) && looksLikeLocation(value) && value !== rawDateTime) ?? "";

  // Do not create low-information events.
  if (!rawTitle || rawTitle.length < 5 || !rawDateTime) {
    return null;
  }

  const title = rawTitle;
  const dateTime = rawDateTime;
  const eventLocation = rawLocation || location;

  const relevanceText = `${title} ${eventLocation}`;

  // Skip virtual/online events to keep results locally actionable.
  if (/\bvirtual\b|\bonline\b|\bzoom\b/i.test(relevanceText)) {
    return null;
  }

  if (!matchesKeywordIntent(relevanceText, keyword)) {
    return null;
  }

  if (matchesExcludeKeywords(relevanceText, excludeKeywords)) {
    return null;
  }

  if (!matchesRequestedLocation(eventLocation, location)) {
    return null;
  }

  const descriptionParts = [
    `Event: ${title}`,
    `When: ${dateTime}`,
    `Where: ${eventLocation}`,
    `Matched topic: ${keyword}`,
  ];

  return {
    id: eventId,
    title,
    date: dateTime,
    time: "TBD",
    location: eventLocation,
    description: descriptionParts.join(" | ").slice(0, 500),
    url: eventUrl,
    source: "eventbrite",
  };
}

async function fetchEventsForLocation(
  location: string,
  keyword: string,
  timeoutMs: number,
): Promise<GrabbedEvent[]> {
  const eventsById = new Map<string, GrabbedEvent>();
  const excludeKeywords = getConfiguredExcludeKeywords();

  try {
    const locationSlug = toEventbriteSlug(location);
    const keywordSlug = toEventbriteSlug(keyword);
    if (!locationSlug || !keywordSlug) {
      return [];
    }

    const url = `https://www.eventbrite.com/d/${locationSlug}/${keywordSlug}/`;

    const res = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    }, timeoutMs);

    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status}`);
      return [];
    }

    const html = await res.text();

    // Parse result blocks from search-event list items; they are more stable than generic event-card wrappers.
    const resultRegex = /<li[\s\S]*?data-testid="search-event"[\s\S]*?<\/li>/gi;
    let cardMatches = html.match(resultRegex) ?? [];

    // Fallback parser if Eventbrite changes the outer list item wrapper.
    if (cardMatches.length === 0) {
      const cardRegex = /<div[^>]*\bevent-card\b[\s\S]*?<\/section><\/div>/gi;
      cardMatches = html.match(cardRegex) ?? [];
    }

    for (const card of cardMatches) {
      const parsed = buildEventFromCard(card, location, keyword, excludeKeywords);
      if (!parsed) {
        continue;
      }

      const existing = eventsById.get(parsed.id);
      if (!existing) {
        eventsById.set(parsed.id, parsed);
        continue;
      }

      // Prefer the entry with richer fields when desktop/mobile cards duplicate the same id.
      const existingScore =
        (existing.date !== "TBD" ? 1 : 0) +
        (existing.location && existing.location !== location ? 1 : 0) +
        (existing.title.length > 12 ? 1 : 0);
      const parsedScore =
        (parsed.date !== "TBD" ? 1 : 0) +
        (parsed.location && parsed.location !== location ? 1 : 0) +
        (parsed.title.length > 12 ? 1 : 0);

      if (parsedScore >= existingScore) {
        eventsById.set(parsed.id, parsed);
      }
    }
  } catch (e) {
    console.error(`Error fetching ${keyword} in ${location}:`, e);
  }

  return Array.from(eventsById.values());
}

export async function grabEventbriteEvents(
  options: EventbriteGrabberOptions = {},
): Promise<EventbriteGrabberRunResult> {
  const allEvents: GrabbedEvent[] = [];
  const seenIds = new Set<string>();
  const keywords = getConfiguredKeywords();
  const locations = getConfiguredLocations();

  const queries = locations.flatMap((location) =>
    keywords.map((keyword) => ({ location, keyword })),
  );

  if (queries.length === 0) {
    return {
      events: [],
      attemptedQueries: 0,
      failedQueries: 0,
      totalQueries: 0,
      chunkIndex: 0,
      chunkCount: 0,
    };
  }

  const timeoutMs = getTimeoutMs(options.timeoutMs);
  const maxQueriesPerRun = getMaxQueriesPerRun(queries.length, options.maxQueriesPerRun);
  const chunkCount = Math.max(1, Math.ceil(queries.length / maxQueriesPerRun));
  const baseChunkIndex = getChunkIndex(chunkCount, options.chunkIndex);
  const chunkIndex = options.useNextChunk
    ? (baseChunkIndex + 1) % chunkCount
    : baseChunkIndex;
  const chunkStart = chunkIndex * maxQueriesPerRun;
  const selectedQueries = queries.slice(chunkStart, chunkStart + maxQueriesPerRun);
  let failedQueries = 0;

  for (const { location, keyword } of selectedQueries) {
    const events = await fetchEventsForLocation(location, keyword, timeoutMs);
    if (events.length === 0) {
      failedQueries += 1;
    }

    for (const event of events) {
      if (!seenIds.has(event.id)) {
        seenIds.add(event.id);
        allEvents.push(event);
      }
    }

    await delay(300);
  }

  return {
    events: allEvents,
    attemptedQueries: selectedQueries.length,
    failedQueries,
    totalQueries: queries.length,
    chunkIndex,
    chunkCount,
  };
}

export function getEventbriteKeywords(): string[] {
  return getConfiguredKeywords();
}

export function getEventbriteLocations(): string[] {
  return getConfiguredLocations();
}
