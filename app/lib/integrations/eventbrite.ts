const EVENTBRITE_BASE_URL = "https://www.eventbriteapi.com/v3";

export type EventbriteEvent = {
  id: string;
  name: { text: string; html: string };
  description: { text: string | null; html: string | null };
  start: { timezone: string; local: string; utc: string };
  end: { timezone: string; local: string; utc: string };
  url: string;
  capacity: number | null;
  is_free: boolean;
  venue_id: string | null;
  venue?: {
    name: string;
    address: {
      city: string | null;
      region: string | null;
      country: string | null;
    };
  };
  logo?: { original: { url: string } } | null;
};

export type EventbriteVenue = {
  id: string;
  name: string;
  address: {
    address_1: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    latitude: string | null;
    longitude: string | null;
  };
};

export type EventInput = {
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
};

function formatDate(utcDate: string): string {
  try {
    const date = new Date(utcDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  } catch {
    return "TBD";
  }
}

function formatTime(utcDate: string): string {
  try {
    const date = new Date(utcDate);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options);
  } catch {
    return "TBD";
  }
}

function formatTimeRange(startUtc: string, endUtc: string): string {
  const start = formatTime(startUtc);
  const end = formatTime(endUtc);
  if (start === "TBD" || end === "TBD") {
    return "TBD";
  }
  return `${start} - ${end}`;
}

function buildLocation(venue: EventbriteVenue | undefined): string {
  if (!venue) {
    return "TBD";
  }

  const parts = [
    venue.address.address_1,
    venue.address.city,
    venue.address.region,
  ].filter(Boolean);

  return parts.join(", ") || "TBD";
}

function buildPrice(event: EventbriteEvent): string {
  if (event.is_free) {
    return "Free";
  }

  if (event.capacity === null) {
    return "See website";
  }

  return `Capacity: ${event.capacity}`;
}

function normalizeText(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

export function mapEventbriteEventToInput(
  event: EventbriteEvent,
  venue: EventbriteVenue | undefined,
): EventInput {
  return {
    title: normalizeText(event.name.text) || "Untitled Event",
    date: formatDate(event.start.utc),
    time: formatTimeRange(event.start.utc, event.end.utc),
    location: buildLocation(venue),
    description: normalizeText(event.description?.text) || "",
    details: normalizeText(event.description?.html) || "",
    host: venue?.name || "Eventbrite",
    price: buildPrice(event),
    registrationLink: event.url,
    tags: ["eventbrite"],
  };
}

export async function fetchEventbriteEvents(
  organizationId: string,
  options?: { page?: number; pageSize?: number },
): Promise<{ events: EventbriteEvent[]; venues: Map<string, EventbriteVenue> }> {
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) {
    throw new Error("EVENTBRITE_TOKEN is not configured");
  }

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 100;

  const params = new URLSearchParams({
    "expand[]": "venue",
    page: String(page),
    page_size: String(pageSize),
    status: "live,started",
  });

  const url = `${EVENTBRITE_BASE_URL}/organizations/${organizationId}/events/?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Eventbrite API error (${response.status}): ${errorText}`,
    );
  }

  const payload = (await response.json()) as {
    events?: EventbriteEvent[];
    pagination?: { has_more_items: boolean; page_number: number };
  };

  const events = Array.isArray(payload.events) ? payload.events : [];

  const venues = new Map<string, EventbriteVenue>();
  for (const event of events) {
    if (event.venue && event.venue_id) {
      venues.set(event.venue_id, event.venue as EventbriteVenue);
    }
  }

  return { events, venues };
}

export function getEventbriteOrganizationId(): string | null {
  return process.env.EVENTBRITE_ORG_ID ?? null;
}
