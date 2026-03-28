/** @jest-environment node */

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockPoolQuery = jest.fn<
  (...args: unknown[]) => Promise<{ rows: unknown[] }>
>();
const mockRelationExists = jest.fn<
  (...args: unknown[]) => Promise<boolean>
>();

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    query: (...args: unknown[]) => mockPoolQuery(...args),
  },
}));

jest.mock("@/app/lib/dbRelations", () => ({
  relationExists: (...args: unknown[]) => mockRelationExists(...args),
}));

const { GET: getLocations } = require("@/app/api/lookups/locations/route") as typeof import("@/app/api/lookups/locations/route");
const { GET: getMajorsLookup } = require("@/app/api/lookups/majors/route") as typeof import("@/app/api/lookups/majors/route");
const { GET: getDegreeTypes } = require("@/app/api/lookups/degree-types/route") as typeof import("@/app/api/lookups/degree-types/route");
const { GET: getInstitutionsLookup } = require("@/app/api/lookups/institutions/route") as typeof import("@/app/api/lookups/institutions/route");
const { GET: searchMajors } = require("@/app/api/majors/search/route") as typeof import("@/app/api/majors/search/route");
const { GET: searchInstitutions } = require("@/app/api/institutions/search/route") as typeof import("@/app/api/institutions/search/route");

describe("fast API lookup route tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns an empty array for short location queries without hitting the database", async () => {
    const response = await getLocations(
      new Request("http://localhost/api/lookups/locations?q=n"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(mockPoolQuery).not.toHaveBeenCalled();
  });

  it("returns location matches for valid location queries", async () => {
    const rows = [{ id: "1", label: "New York, NY" }];
    mockPoolQuery.mockResolvedValue({ rows });

    const response = await getLocations(
      new Request("http://localhost/api/lookups/locations?q=new"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(rows);
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
  });

  it("returns majors when the user major relation exists", async () => {
    const rows = [{ name: "Computer Science" }];
    mockRelationExists.mockResolvedValue(true);
    mockPoolQuery.mockResolvedValue({ rows });

    const response = await getMajorsLookup();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(rows);
    expect(mockRelationExists).toHaveBeenCalled();
    expect(mockPoolQuery).toHaveBeenCalledTimes(1);
  });

  it("returns degree types when the relation exists", async () => {
    const rows = [
      {
        degree_type_id: 1,
        type: "Bachelor",
        abbreviation: "BS",
        level: "Undergraduate",
      },
    ];
    mockRelationExists.mockResolvedValue(true);
    mockPoolQuery.mockResolvedValue({ rows });

    const response = await getDegreeTypes();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(rows);
  });

  it("returns institutions when the relation exists", async () => {
    const rows = [{ institution_id: 1, name: "University of Connecticut" }];
    mockRelationExists.mockResolvedValue(true);
    mockPoolQuery.mockResolvedValue({ rows });

    const response = await getInstitutionsLookup();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(rows);
  });

  it("returns an empty array for short major search queries", async () => {
    const response = await searchMajors(
      new Request("http://localhost/api/majors/search?q=c"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
    expect(mockPoolQuery).not.toHaveBeenCalled();
  });

  it("returns matching majors for valid major search queries", async () => {
    const rows = [{ id: 7, name: "Computer Science" }];
    mockRelationExists.mockResolvedValue(true);
    mockPoolQuery.mockResolvedValue({ rows });

    const response = await searchMajors(
      new Request("http://localhost/api/majors/search?q=computer"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(rows);
  });

  it("returns matching institutions for valid institution search queries", async () => {
    const rows = [{ id: 12, name: "State University" }];
    mockRelationExists.mockResolvedValue(true);
    mockPoolQuery.mockResolvedValue({ rows });

    const response = await searchInstitutions(
      new Request("http://localhost/api/institutions/search?q=university"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(rows);
  });
});
