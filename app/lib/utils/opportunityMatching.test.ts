import { describe, expect, it } from "@jest/globals";
import {
  analyzeOpportunityText,
  expandOpportunityKeywords,
  isRemoteOpportunityText,
} from "@/app/lib/utils/opportunityMatching";

describe("opportunityMatching", () => {
  it("treats remote as an explicit location preference", () => {
    const remoteMatch = analyzeOpportunityText(
      "Software Engineer Intern - Remote, United States",
      {
        locations: ["Remote"],
        keywords: [],
      },
    );
    const onsiteMatch = analyzeOpportunityText(
      "Software Engineer Intern - Austin, TX",
      {
        locations: ["Remote"],
        keywords: [],
      },
    );

    expect(remoteMatch.locationMatched).toBe(true);
    expect(remoteMatch.strictMatch).toBe(true);
    expect(onsiteMatch.locationMatched).toBe(false);
    expect(onsiteMatch.strictMatch).toBe(false);
  });

  it("expands major and interest keywords into role-relevant signals", () => {
    expect(
      expandOpportunityKeywords(["Computer Science", "Software Engineering"]),
    ).toEqual(
      expect.arrayContaining([
        "computer science",
        "software engineering",
        "software",
        "engineer",
        "react",
      ]),
    );
  });

  it("requires both location and keyword signal when both are provided", () => {
    const match = analyzeOpportunityText(
      "Software Engineer Intern working on React APIs in Chicago",
      {
        locations: ["Chicago"],
        keywords: ["Computer Science"],
      },
    );
    const wrongLocation = analyzeOpportunityText(
      "Software Engineer Intern working on React APIs in Austin",
      {
        locations: ["Chicago"],
        keywords: ["Computer Science"],
      },
    );
    const wrongKeyword = analyzeOpportunityText(
      "Operations coordinator internship in Chicago",
      {
        locations: ["Chicago"],
        keywords: ["Computer Science"],
      },
    );

    expect(match.strictMatch).toBe(true);
    expect(wrongLocation.strictMatch).toBe(false);
    expect(wrongKeyword.strictMatch).toBe(false);
    expect(wrongLocation.looseMatch).toBe(true);
  });

  it("includes remote roles by default for non-remote location preferences", () => {
    const remoteMatch = analyzeOpportunityText(
      "Software Engineer Intern working on distributed systems from anywhere",
      {
        locations: ["Chicago"],
        keywords: ["Computer Science"],
      },
    );

    expect(remoteMatch.remoteMatched).toBe(true);
    expect(remoteMatch.locationMatched).toBe(true);
    expect(remoteMatch.strictMatch).toBe(true);
  });

  it("detects remote job text beyond the single word remote", () => {
    expect(isRemoteOpportunityText("Distributed engineering internship")).toBe(true);
    expect(isRemoteOpportunityText("On-site role in Chicago")).toBe(false);
  });
});
