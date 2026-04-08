import { chromium, Browser } from "playwright";

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

function randomDelay(): Promise<void> {
  const min = 1000;
  const max = 3000;
  return delay(Math.floor(Math.random() * (max - min + 1)) + min);
}

function generateEventId(url: string): string {
  const hash = url.split("/").pop() || url;
  return `eb-${hash.slice(0, 20)}`;
}

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().slice(0, 5000);
}

function extractEventId(url: string): string {
  const match = url.match(/e\/([^/]+)/);
  return match ? match[1] : generateEventId(url);
}

async function scrapeLocationKeyword(
  browser: Browser,
  location: string,
  keyword: string,
): Promise<GrabbedEvent[]> {
  const page = await browser.newPage();
  const events: GrabbedEvent[] = [];

  try {
    const searchQuery = `${keyword} ${location}`;
    const url = `https://www.eventbrite.com/d/${location}/${keyword}/`;

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await randomDelay();

    const eventCards = await page.locator('[data-testid="event-card"]').all();

    if (eventCards.length === 0) {
      const alternativeCards = await page
        .locator(".event-card, .DxpEnge, [class*='event-item']")
        .all();

      for (const card of alternativeCards) {
        try {
          const titleEl = await card.locator("h2, h3, a[class*='title']").first();
          const title = await titleEl.textContent();

          if (!title || title.trim() === "") continue;

          const urlEl = await card.locator("a").first();
          const eventUrl = await urlEl.getAttribute("href");

          if (!eventUrl) continue;

          const fullUrl = eventUrl.startsWith("http")
            ? eventUrl
            : `https://www.eventbrite.com${eventUrl}`;

          const dateEl = await card
            .locator('[class*="date"], [class*="time"], .DxpEnge')
            .first();
          const dateText = await dateEl.textContent();

          const locEl = await card
            .locator('[class*="location"], [class*="venue"]')
            .first();
          const locationText = await locEl.textContent();

          const descriptionEl = await card
            .locator("p, [class*='description']")
            .first();
          const description = await descriptionEl.textContent();

          events.push({
            id: extractEventId(fullUrl),
            title: normalizeText(title),
            date: normalizeText(dateText) || "TBD",
            time: "TBD",
            location: normalizeText(locationText) || location,
            description: normalizeText(description) || "",
            url: fullUrl,
            source: "eventbrite",
          });
        } catch {
          continue;
        }
      }
    } else {
      for (const card of eventCards) {
        try {
          const titleEl = await card.locator("h2, h3").first();
          const title = await titleEl.textContent();

          if (!title || title.trim() === "") continue;

          const urlEl = await card.locator("a").first();
          const eventUrl = await urlEl.getAttribute("href");

          if (!eventUrl) continue;

          const fullUrl = eventUrl.startsWith("http")
            ? eventUrl
            : `https://www.eventbrite.com${eventUrl}`;

          const dateEl = await card.locator("[class*='date']").first();
          const dateText = await dateEl.textContent();

          const locEl = await card.locator("[class*='venue']").first();
          const locationText = await locEl.textContent();

          events.push({
            id: extractEventId(fullUrl),
            title: normalizeText(title),
            date: normalizeText(dateText) || "TBD",
            time: "TBD",
            location: normalizeText(locationText) || location,
            description: "",
            url: fullUrl,
            source: "eventbrite",
          });
        } catch {
          continue;
        }
      }
    }
  } catch (error) {
    console.error(
      `Error scraping Eventbrite for ${keyword} in ${location}:`,
      error,
    );
  } finally {
    await page.close();
  }

  return events;
}

export async function grabEventbriteEvents(): Promise<GrabbedEvent[]> {
  let browser: Browser | null = null;
  const allEvents: GrabbedEvent[] = [];
  const seenIds = new Set<string>();

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    for (const location of US_LOCATIONS) {
      for (const keyword of KEYWORDS) {
        console.log(
          `Grabbing: ${keyword} in ${location}`,
        );

        const events = await scrapeLocationKeyword(browser, location, keyword);

        for (const event of events) {
          if (!seenIds.has(event.id)) {
            seenIds.add(event.id);
            allEvents.push(event);
          }
        }

        await randomDelay();
      }
    }

    await context.close();
  } catch (error) {
    console.error("Error in grabEventbriteEvents:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log(`Total events grabbed: ${allEvents.length}`);

  return allEvents;
}

export function getEventbriteKeywords(): string[] {
  return KEYWORDS;
}

export function getEventbriteLocations(): string[] {
  return US_LOCATIONS;
}
