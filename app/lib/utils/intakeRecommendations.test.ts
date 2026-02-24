import { describe, expect, it } from "@jest/globals";
import type { Internship } from "@/app/lib/models/Internship";
import type { EventItem } from "@/app/student/events/events";
import {
  buildIntakeRecommendations,
  parseIntakeInterests,
} from "@/app/lib/utils/intakeRecommendations";

describe("parseIntakeInterests", () => {
  it("keeps known values and removes duplicates", () => {
    expect(
      parseIntakeInterests(["internship", "job", "job", "EVENT", "ignored"]),
    ).toEqual(["internship", "job", "event"]);
  });
});

describe("buildIntakeRecommendations", () => {
  const internships: Internship[] = [
    {
      id: "internship-1",
      company_name: "BlueWave Technologies",
      job_description:
        "Software engineering intern to assist with front-end React development and API integration in Chicago.",
      url: "https://example.com/bluewave",
      created_at: new Date("2026-01-20"),
    },
    {
      id: "internship-2",
      company_name: "Metro Office",
      job_description:
        "Entry-level operations coordinator role supporting logistics and office administration in Austin.",
      url: "https://example.com/metro-office",
      created_at: new Date("2026-01-18"),
    },
  ];

  const eventList: EventItem[] = [
    {
      id: "event-1",
      title: "Chicago Career Mixer",
      date: "Thu, Feb 20",
      time: "6:00 PM - 8:00 PM",
      location: "Chicago, IL",
      description: "Networking with startup teams and hiring managers.",
      details: "Bring your resume and portfolio links.",
      host: "City Tech Alliance",
      price: "Free",
      registrationLink: "https://example.com/chicago-mixer",
      tags: ["Tech", "Careers"],
    },
  ];

  it("scores internships and events from intake answers", () => {
    const results = buildIntakeRecommendations({
      internships,
      eventList,
      input: {
        location: "Chicago",
        major: "Computer Science",
        interests: ["internship", "event"],
      },
    });

    expect(results.opportunities).toHaveLength(2);
    expect(results.events).toHaveLength(1);
    expect(results.opportunities[0]?.id).toBe("internship-1");
    expect(results.events[0]?.id).toBe("event-1");
  });

  it("returns only events when opportunity interests are not selected", () => {
    const results = buildIntakeRecommendations({
      internships,
      eventList,
      input: {
        location: "",
        major: "",
        interests: ["event"],
      },
    });

    expect(results.opportunities).toHaveLength(0);
    expect(results.events).toHaveLength(1);
  });
});
