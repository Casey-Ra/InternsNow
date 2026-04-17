/** @jest-environment node */
/* eslint-disable @typescript-eslint/no-require-imports */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockGetSession = jest.fn<
  (...args: unknown[]) => Promise<unknown>
>();
const mockPoolQuery = jest.fn<
  (...args: unknown[]) => Promise<{ rows: unknown[] }>
>();
const mockGetEventActor = jest.fn<
  (...args: unknown[]) => Promise<unknown>
>();

jest.mock("@/lib/auth0", () => ({
  auth0: {
    getSession: (...args: unknown[]) => mockGetSession(...args),
  },
}));

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    query: (...args: unknown[]) => mockPoolQuery(...args),
    connect: jest.fn(),
  },
}));

jest.mock("@/app/lib/auth/eventAccess", () => ({
  getEventActor: (...args: unknown[]) => mockGetEventActor(...args),
  canManageEvent: jest.fn(),
}));

function loadRoutes() {
  let routes!: {
    getProfile: typeof import("@/app/api/profile/route").GET;
    getProtected: typeof import("@/app/api/protected/route").GET;
    getHustle: typeof import("@/app/api/student/hustle/route").GET;
    postHustle: typeof import("@/app/api/student/hustle/route").POST;
    createInternship: typeof import("@/app/api/internships/create/route").POST;
    updateInternship: typeof import("@/app/api/internships/update/route").POST;
    deleteInternship: typeof import("@/app/api/internships/delete/route").POST;
    createEvent: typeof import("@/app/api/events/create/route").POST;
    updateEvent: typeof import("@/app/api/events/update/route").POST;
    deleteEvent: typeof import("@/app/api/events/delete/route").POST;
  };

  jest.isolateModules(() => {
    routes = {
      getProfile: require("@/app/api/profile/route").GET,
      getProtected: require("@/app/api/protected/route").GET,
      getHustle: require("@/app/api/student/hustle/route").GET,
      postHustle: require("@/app/api/student/hustle/route").POST,
      createInternship: require("@/app/api/internships/create/route").POST,
      updateInternship: require("@/app/api/internships/update/route").POST,
      deleteInternship: require("@/app/api/internships/delete/route").POST,
      createEvent: require("@/app/api/events/create/route").POST,
      updateEvent: require("@/app/api/events/update/route").POST,
      deleteEvent: require("@/app/api/events/delete/route").POST,
    };
  });

  return routes;
}

describe("fast API auth protection tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.POSTGRES_URL =
      process.env.POSTGRES_URL ??
      "postgresql://test:test@127.0.0.1:5432/testdb";
    mockGetSession.mockResolvedValue(null);
    mockGetEventActor.mockResolvedValue(null);
    mockPoolQuery.mockResolvedValue({ rows: [] });
  });

  it("rejects unauthenticated profile reads", async () => {
    const { getProfile } = loadRoutes();
    const response = await getProfile();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ authenticated: false });
  });

  it("rejects unauthenticated protected API reads", async () => {
    const { getProtected, getHustle } = loadRoutes();
    const response = await getProtected(
      new Request(
        "http://localhost/api/protected",
      ) as unknown as import("next/server").NextRequest,
    );
    const hustleResponse = await getHustle(
      new Request(
        "http://localhost/api/student/hustle",
      ) as unknown as import("next/server").NextRequest,
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Not authenticated" });
    expect(hustleResponse.status).toBe(401);
    expect(await hustleResponse.json()).toEqual({ error: "Unauthorized" });
  });

  it("rejects unauthenticated internship mutations", async () => {
    const { createInternship, updateInternship, deleteInternship } =
      loadRoutes();
    const createResponse = await createInternship(
      new Request("http://localhost/api/internships/create", {
        method: "POST",
        body: JSON.stringify({
          company_name: "Test Corp",
          job_description: "A test internship",
          url: "https://example.com/jobs/1",
        }),
      }) as unknown as import("next/server").NextRequest,
    );
    const updateResponse = await updateInternship(
      new Request("http://localhost/api/internships/update", {
        method: "POST",
        body: JSON.stringify({
          id: 1,
          company_name: "Updated Corp",
          job_description: "Updated description",
          url: "https://example.com/jobs/2",
        }),
      }) as unknown as import("next/server").NextRequest,
    );
    const deleteResponse = await deleteInternship(
      new Request("http://localhost/api/internships/delete", {
        method: "POST",
        body: JSON.stringify({ id: 1 }),
      }) as unknown as import("next/server").NextRequest,
    );

    expect(createResponse.status).toBe(401);
    expect(await createResponse.json()).toEqual({ error: "Unauthorized" });
    expect(updateResponse.status).toBe(401);
    expect(await updateResponse.json()).toEqual({ error: "Unauthorized" });
    expect(deleteResponse.status).toBe(401);
    expect(await deleteResponse.json()).toEqual({ error: "Unauthorized" });
  });

  it("rejects unauthenticated event mutations", async () => {
    const { createEvent, updateEvent, deleteEvent, postHustle } = loadRoutes();
    const createResponse = await createEvent(
      new Request("http://localhost/api/events/create", {
        method: "POST",
        body: JSON.stringify({
          title: "Test Event",
          date: "Fri, Jun 15",
          time: "6:00 PM",
          location: "Austin, TX",
          description: "Networking event",
          details: "Meet founders",
          host: "InternsNow",
          price: "Free",
          registrationLink: "https://example.com/events/1",
          tags: ["networking"],
        }),
      }) as unknown as import("next/server").NextRequest,
    );
    const updateResponse = await updateEvent(
      new Request("http://localhost/api/events/update", {
        method: "POST",
        body: JSON.stringify({ id: "evt_1" }),
      }) as unknown as import("next/server").NextRequest,
    );
    const deleteResponse = await deleteEvent(
      new Request("http://localhost/api/events/delete", {
        method: "POST",
        body: JSON.stringify({ id: "evt_1" }),
      }) as unknown as import("next/server").NextRequest,
    );
    const hustleResponse = await postHustle(
      new Request("http://localhost/api/student/hustle", {
        method: "POST",
        body: JSON.stringify({
          activityType: "event_rsvp",
          referenceType: "event",
          referenceId: "evt_1",
          sourceLabel: "Test Event",
        }),
      }) as unknown as import("next/server").NextRequest,
    );

    expect(createResponse.status).toBe(401);
    expect(await createResponse.json()).toEqual({ error: "Unauthorized" });
    expect(updateResponse.status).toBe(401);
    expect(await updateResponse.json()).toEqual({ error: "Unauthorized" });
    expect(deleteResponse.status).toBe(401);
    expect(await deleteResponse.json()).toEqual({ error: "Unauthorized" });
    expect(hustleResponse.status).toBe(401);
    expect(await hustleResponse.json()).toEqual({ error: "Unauthorized" });
  });
});
