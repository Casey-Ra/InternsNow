import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  DEFAULT_GREENHOUSE_BOARDS,
  fetchGreenhouseJobs,
  formatGreenhouseJobDescription,
  getConfiguredGreenhouseBoards,
  jobMatchesGreenhouseKeywords,
  mapGreenhouseJobToInternshipInput,
  parseGreenhouseBoards,
} from "./greenhouse";

const originalFetch = global.fetch;
const originalGreenhouseBoards = process.env.GREENHOUSE_BOARDS;

afterEach(() => {
  global.fetch = originalFetch;
  process.env.GREENHOUSE_BOARDS = originalGreenhouseBoards;
  jest.restoreAllMocks();
});

describe("Greenhouse integration helpers", () => {
  it("parses configured boards and derives missing company names", () => {
    expect(
      parseGreenhouseBoards("openai|OpenAI;stripe;openai|Duplicate"),
    ).toEqual([
      { token: "openai", companyName: "OpenAI" },
      { token: "stripe", companyName: "Stripe" },
    ]);
  });

  it("uses the starter boards when GREENHOUSE_BOARDS is unset", () => {
    delete process.env.GREENHOUSE_BOARDS;

    expect(getConfiguredGreenhouseBoards()).toEqual(DEFAULT_GREENHOUSE_BOARDS);
  });

  it("matches internship-style roles using configured keywords", () => {
    const internshipJob = {
      id: 1,
      title: "Software Engineer Intern",
      absolute_url: "https://boards.greenhouse.io/example/jobs/1",
      content: "Join us for a summer internship program.",
    };
    const fullTimeJob = {
      id: 2,
      title: "Senior Platform Engineer",
      absolute_url: "https://boards.greenhouse.io/example/jobs/2",
      content: "Own production systems.",
    };

    expect(
      jobMatchesGreenhouseKeywords(internshipJob, ["intern", "co-op"]),
    ).toBe(true);
    expect(
      jobMatchesGreenhouseKeywords(fullTimeJob, ["intern", "co-op"]),
    ).toBe(false);
  });

  it("formats Greenhouse job content into plain text", () => {
    const description = formatGreenhouseJobDescription({
      id: 3,
      title: "Product Design Intern",
      absolute_url: "https://boards.greenhouse.io/example/jobs/3",
      location: { name: "Remote" },
      offices: [{ name: "Remote", location: "United States" }],
      departments: [{ name: "Design" }],
      content:
        "Design products &amp;lt;p&amp;gt;Work with mentors&amp;lt;/p&amp;gt;",
    });

    expect(description).toContain("Role: Product Design Intern");
    expect(description).toContain("Location: Remote | United States");
    expect(description).toContain("Team: Design");
    expect(description).toContain("Design products");
    expect(description).toContain("Work with mentors");
    expect(description).not.toContain("&amp;lt;");
    expect(description).not.toContain("<p>");
  });

  it("maps jobs into the existing internship schema", () => {
    expect(
      mapGreenhouseJobToInternshipInput(
        { token: "openai", companyName: "OpenAI" },
        {
          id: 4,
          title: "AI Research Intern",
          absolute_url: "https://boards.greenhouse.io/openai/jobs/4",
          content: "Research cutting-edge models.",
        },
      ),
    ).toEqual({
      company_name: "OpenAI - AI Research Intern",
      job_description: "Role: AI Research Intern\n\nResearch cutting-edge models.",
      url: "https://boards.greenhouse.io/openai/jobs/4",
    });
  });

  it("fetches Greenhouse jobs from the public board endpoint", async () => {
    const fetchMock = jest.fn(async () =>
      ({
        ok: true,
        json: async () => ({
          jobs: [
            {
              id: 5,
              title: "Data Intern",
              absolute_url: "https://boards.greenhouse.io/example/jobs/5",
            },
          ],
        }),
      }) as Response,
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const jobs = await fetchGreenhouseJobs("example");

    expect(fetchMock.mock.calls[0]).toEqual([
      "https://boards-api.greenhouse.io/v1/boards/example/jobs?content=true",
      { cache: "no-store" },
    ]);
    expect(jobs).toHaveLength(1);
    expect(jobs[0]?.title).toBe("Data Intern");
  });
});
