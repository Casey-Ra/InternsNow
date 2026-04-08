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

const KEYWORDS = [
  "career fair",
  "tech networking", 
  "job fair",
  "internship",
  "career workshop",
];

const US_LOCATIONS = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "Indianapolis",
  "Seattle",
  "Denver",
  "Boston",
  "Nashville",
  "Portland",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractEventId(url: string): string {
  const match = url.match(/e\/([^/?]+)/);
  return match ? match[1].split("-")[0] : url.slice(-20);
}

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}

async function fetchEventsForLocation(
  location: string,
  keyword: string,
): Promise<GrabbedEvent[]> {
  const events: GrabbedEvent[] = [];

  try {
    const url = `https://www.eventbrite.com/d/${location}/${keyword}/`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status}`);
      return events;
    }

    const html = await res.text();

    const eventIdRegex = /event-id="(\d+)"/g;
    const seenIds = new Set<string>();
    let match;

    while ((match = eventIdRegex.exec(html)) !== null) {
      const eventId = match[1];
      if (seenIds.has(eventId)) continue;
      seenIds.add(eventId);

      const eventUrl = `https://www.eventbrite.com/e/-${eventId}`;
      
      events.push({
        id: eventId,
        title: `${keyword} in ${location}`,
        date: "TBD",
        time: "TBD",
        location: location,
        description: `Event search: ${keyword}`,
        url: eventUrl,
        source: "eventbrite",
      });
    }
  } catch (e) {
    console.error(`Error fetching ${keyword} in ${location}:`, e);
  }

  return events;
}

export async function grabEventbriteEvents(): Promise<GrabbedEvent[]> {
  const allEvents: GrabbedEvent[] = [];
  const seenIds = new Set<string>();

  for (const location of US_LOCATIONS) {
    for (const keyword of KEYWORDS) {
      console.log(`Grabbing: ${keyword} in ${location}`);

      const events = await fetchEventsForLocation(location, keyword);
      console.log(`  Found ${events.length} events`);

      for (const event of events) {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id);
          allEvents.push(event);
        }
      }

      await delay(500);
    }
  }

  console.log(`\nTotal unique events: ${allEvents.length}`);
  return allEvents;
}

export function getEventbriteKeywords(): string[] {
  return KEYWORDS;
}

export function getEventbriteLocations(): string[] {
  return US_LOCATIONS;
}
