/* eslint-disable @typescript-eslint/no-require-imports */
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

jest.mock("@/app/lib/models/Event", () => ({
  getEvents: jest.fn(),
  getEventById: jest.fn(),
  toEventView: jest.fn(),
}));

const mockedEventModel = jest.requireMock(
  "@/app/lib/models/Event",
) as jest.Mocked<typeof import("@/app/lib/models/Event")>;
const { events, findEventById, getLiveEvents } = require("./events") as typeof import("./events");

function createEventRecord(id: string): import("@/app/lib/models/Event").EventRecord {
  return {
    id,
    title: "DB Event",
    date: "Mon, Mar 10",
    time: "6:00 PM - 8:00 PM",
    location: "Downtown Hub",
    description: "From DB",
    details: "Details from DB",
    host: "DB Host",
    price: "Free",
    registration_link: `https://example.com/${id}`,
    tags: ["Networking"],
    created_by: null,
    created_by_email: null,
    deleted_at: null,
    deleted_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

describe("student events data mapping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getLiveEvents maps DB event view fields to EventItem", async () => {
    const dbRow = createEventRecord("evt-db-1");
    const eventView = {
      id: "evt-db-1",
      title: "DB Event",
      date: "Mon, Mar 10",
      time: "6:00 PM - 8:00 PM",
      location: "Downtown Hub",
      description: "From DB",
      details: "Details from DB",
      host: "DB Host",
      price: "Free",
      registrationLink: "https://example.com/db-event",
      tags: ["Networking"],
      createdBy: null,
      createdByEmail: null,
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockedEventModel.getEvents.mockResolvedValue([dbRow]);
    mockedEventModel.toEventView.mockReturnValue(eventView);

    const result = await getLiveEvents();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "evt-db-1",
      title: "DB Event",
      date: "Mon, Mar 10",
      time: "6:00 PM - 8:00 PM",
      location: "Downtown Hub",
      description: "From DB",
      details: "Details from DB",
      host: "DB Host",
      price: "Free",
      registrationLink: "https://example.com/db-event",
      tags: ["Networking"],
    });
  });

  test("getLiveEvents falls back to static events on DB failure", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockedEventModel.getEvents.mockRejectedValue(new Error("db unavailable"));

    const result = await getLiveEvents();

    expect(result).toEqual(events);
    consoleSpy.mockRestore();
  });

  test("findEventById returns mapped DB event when available", async () => {
    const dbRow = createEventRecord("evt-db-2");
    const eventView = {
      id: "evt-db-2",
      title: "DB Event 2",
      date: "Tue, Mar 11",
      time: "5:00 PM - 6:00 PM",
      location: "City Hall",
      description: "DB desc",
      details: "DB details",
      host: "DB Host 2",
      price: "$5",
      registrationLink: "https://example.com/db-event-2",
      tags: ["Careers"],
      createdBy: null,
      createdByEmail: null,
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockedEventModel.getEventById.mockResolvedValue(dbRow);
    mockedEventModel.toEventView.mockReturnValue(eventView);

    const result = await findEventById("evt-db-2");

    expect(result?.id).toBe("evt-db-2");
    expect(result?.registrationLink).toBe("https://example.com/db-event-2");
  });

  test("findEventById falls back to static event when DB returns null", async () => {
    mockedEventModel.getEventById.mockResolvedValue(null);

    const result = await findEventById("evt-001");

    expect(result?.id).toBe("evt-001");
    expect(result?.title).toBe(events[0].title);
  });
});
