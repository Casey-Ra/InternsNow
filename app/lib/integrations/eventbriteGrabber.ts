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
  const match = url.match(/\/e\/[^"-]+-(\d+)/);
  return match ? match[1] : url.slice(-15);
}

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").trim().slice(0, 200);
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
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch ${url}: ${res.status}`);
      return events;
    }

    const html = await res.text();

    // First: get all unique event URLs
    const urlRegex = /href="(https:\/\/www\.eventbrite\.com\/e\/[^"]+)"/g;
    const seenUrls = new Set<string>();
    const eventUrls: string[] = [];
    let match;

    while ((match = urlRegex.exec(html)) !== null) {
      const fullUrl = match[1];
      if (!seenUrls.has(fullUrl)) {
        seenUrls.add(fullUrl);
        eventUrls.push(fullUrl);
      }
    }

    // For each URL, try to find a title nearby in the HTML
    for (const eventUrl of eventUrls) {
      const eventId = extractEventId(eventUrl);
      
      // Try to find the title by looking for the URL and getting nearby text
      const urlIndex = html.indexOf(eventUrl);
      if (urlIndex === -1) continue;
      
      // Get context around the URL (before and after)
      const contextStart = Math.max(0, urlIndex - 300);
      const contextEnd = Math.min(html.length, urlIndex + 300);
      const context = html.substring(contextStart, contextEnd);
      
      // Try to find title in the context - look for text between > and <
      let title = "";
      const titleMatch = context.match(/>([^<]{5,60})</);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      
      // Fallback: use keyword + location if no title found
      if (!title || title.length < 5) {
        title = `${keyword} - ${location}`;
      }

      events.push({
        id: eventId,
        title: normalizeText(title),
        date: "TBD",
        time: "TBD",
        location: location,
        description: `Search: ${keyword} in ${location}`,
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
