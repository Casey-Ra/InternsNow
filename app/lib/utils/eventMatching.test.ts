import { describe, expect, it } from "@jest/globals";
import type { EventItem } from "@/app/student/events/events";
import {
  analyzeEventText,
  rankEventsByRelevance,
} from "@/app/lib/utils/eventMatching";

const eventList: EventItem[] = [
  {
    id: "event-tech",
    title: "Software Engineering Mixer",
    date: "Thu, Feb 20",
    time: "6:00 PM - 8:00 PM",
    location: "Chicago, IL",
    description: "Meet engineers building React apps and backend APIs.",
    details: "Frontend, backend, and platform teams will be present.",
    host: "City Tech Alliance",
    price: "Free",
    registrationLink: "https://example.com/tech",
    tags: ["Tech", "Engineering"],
  },
  {
    id: "event-finance",
    title: "Finance Career Social",
    date: "Fri, Feb 21",
    time: "5:00 PM - 7:00 PM",
    location: "Chicago, IL",
    description: "Meet analysts and learn about consulting pipelines.",
    details: "Resume reviews for finance and consulting students.",
    host: "Finance Network",
    price: "Free",
    registrationLink: "https://example.com/finance",
    tags: ["Finance", "Consulting"],
  },
];

describe("eventMatching", () => {
  it("matches events against major keywords", () => {
    const match = analyzeEventText(
      `${eventList[0].title} ${eventList[0].description} ${eventList[0].details}`,
      {
        keywords: ["Computer Science"],
      },
    );

    expect(match.keywordMatched).toBe(true);
    expect(match.strictMatch).toBe(true);
  });

  it("boosts events that align with the preferred major", () => {
    const ranked = rankEventsByRelevance(eventList, {
      keywords: ["Computer Science"],
    });

    expect(ranked[0]?.id).toBe("event-tech");
  });

  it("boosts events in the preferred location", () => {
    const ranked = rankEventsByRelevance(
      [
        { ...eventList[0], id: "event-tech-austin", location: "Austin, TX" },
        eventList[0],
      ],
      {
        locations: ["Chicago"],
        keywords: ["Computer Science"],
      },
    );

    expect(ranked[0]?.id).toBe("event-tech");
  });
});
