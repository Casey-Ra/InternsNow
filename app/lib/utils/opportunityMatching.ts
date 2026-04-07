const REMOTE_TERMS = [
  "remote",
  "work from home",
  "wfh",
  "distributed",
  "anywhere",
  "telecommute",
] as const;

const SHORT_KEYWORD_TOKENS = new Set(["ai", "ml", "ux", "ui", "qa"]);

const topicHints: Array<{ aliases: string[]; keywords: string[] }> = [
  {
    aliases: [
      "computer science",
      "software engineering",
      "software development",
      "information technology",
      "developer",
      "engineering",
    ],
    keywords: [
      "software",
      "engineer",
      "developer",
      "frontend",
      "backend",
      "full stack",
      "api",
      "react",
      "typescript",
      "javascript",
      "node",
      "python",
      "cloud",
      "platform",
      "systems",
    ],
  },
  {
    aliases: ["data science", "analytics", "statistics", "mathematics"],
    keywords: [
      "data",
      "analytics",
      "machine learning",
      "ml",
      "ai",
      "python",
      "sql",
      "modeling",
      "reporting",
      "business intelligence",
    ],
  },
  {
    aliases: ["product management", "product manager", "product"],
    keywords: [
      "product",
      "roadmap",
      "strategy",
      "stakeholder",
      "user research",
      "requirements",
      "go to market",
    ],
  },
  {
    aliases: ["marketing", "communications", "media", "growth"],
    keywords: [
      "marketing",
      "campaign",
      "content",
      "brand",
      "growth",
      "social media",
      "communications",
    ],
  },
  {
    aliases: ["design", "ux", "ui", "product design"],
    keywords: [
      "design",
      "ux",
      "ui",
      "figma",
      "prototype",
      "user experience",
      "visual",
    ],
  },
  {
    aliases: ["finance", "accounting", "economics"],
    keywords: [
      "finance",
      "financial",
      "accounting",
      "analyst",
      "budget",
      "forecast",
      "investment",
    ],
  },
  {
    aliases: ["consulting", "business", "management", "operations"],
    keywords: [
      "consulting",
      "operations",
      "strategy",
      "business",
      "process",
      "logistics",
      "client",
    ],
  },
  {
    aliases: ["sales"],
    keywords: [
      "sales",
      "account executive",
      "account manager",
      "pipeline",
      "prospecting",
      "revenue",
    ],
  },
];

export type OpportunityTextMatch = {
  hasLocationPreference: boolean;
  hasKeywordPreference: boolean;
  remotePreference: boolean;
  remoteMatched: boolean;
  preferredLocationMatched: boolean;
  locationMatched: boolean;
  keywordMatched: boolean;
  keywordMatchCount: number;
  strictMatch: boolean;
  looseMatch: boolean;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9+#]+/g)
    .filter(Boolean);
}

function keepKeywordToken(token: string): boolean {
  return token.length >= 3 || SHORT_KEYWORD_TOKENS.has(token);
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.map((value) => normalize(value ?? "")).filter(Boolean)),
  );
}

function containsTerm(haystack: string, term: string): boolean {
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(" ")) {
    return haystack.includes(normalizedTerm);
  }

  if (normalizedTerm.length <= 3) {
    return new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, "i").test(haystack);
  }

  return haystack.includes(normalizedTerm);
}

function getLocationTerms(locations: string[]): string[] {
  const terms: string[] = [];

  for (const location of locations) {
    const normalizedLocation = normalize(location);
    if (!normalizedLocation || isRemotePreference(location)) {
      continue;
    }

    terms.push(normalizedLocation);
    for (const token of tokenize(location)) {
      if (token.length >= 2) {
        terms.push(token);
      }
    }
  }

  return unique(terms);
}

export function isRemotePreference(value: string): boolean {
  const normalizedValue = normalize(value);
  return REMOTE_TERMS.some((term) => normalizedValue.includes(term));
}

export function isRemoteOpportunityText(text: string): boolean {
  const normalizedText = normalize(text);
  return REMOTE_TERMS.some((term) => containsTerm(normalizedText, term));
}

export function expandOpportunityKeywords(keywords: string[]): string[] {
  const normalizedValues = unique(keywords);
  const expandedTerms = topicHints
    .filter(({ aliases }) =>
      normalizedValues.some((value) =>
        aliases.some((alias) => value.includes(alias)),
      ),
    )
    .flatMap(({ keywords: hintKeywords }) => hintKeywords);

  const tokenTerms = normalizedValues.flatMap((value) =>
    tokenize(value).filter(keepKeywordToken),
  );

  return unique([...normalizedValues, ...expandedTerms, ...tokenTerms]);
}

export function analyzeOpportunityText(
  text: string,
  preferences: {
    locations?: string[];
    keywords?: string[];
  },
): OpportunityTextMatch {
  const normalizedText = normalize(text);
  const locations = preferences.locations ?? [];
  const keywords = preferences.keywords ?? [];
  const hasLocationPreference = locations.some((value) => normalize(value));
  const hasKeywordPreference = keywords.some((value) => normalize(value));
  const remotePreference = locations.some(isRemotePreference);
  const remoteMatched = isRemoteOpportunityText(normalizedText);
  const locationTerms = getLocationTerms(locations);

  const preferredLocationMatched = remotePreference
    ? false
    : locationTerms.some((term) => containsTerm(normalizedText, term));

  const locationMatched = remotePreference
    ? remoteMatched
    : !hasLocationPreference
      ? false
      : preferredLocationMatched || remoteMatched;

  const matchedKeywordTerms = expandOpportunityKeywords(keywords).filter((term) =>
    containsTerm(normalizedText, term),
  );
  const keywordMatchCount = Math.min(matchedKeywordTerms.length, 4);
  const keywordMatched = keywordMatchCount > 0;
  const matchedDimensions = Number(locationMatched) + Number(keywordMatched);

  return {
    hasLocationPreference,
    hasKeywordPreference,
    remotePreference,
    remoteMatched,
    preferredLocationMatched,
    locationMatched,
    keywordMatched,
    keywordMatchCount,
    strictMatch:
      (!hasLocationPreference || locationMatched) &&
      (!hasKeywordPreference || keywordMatched),
    looseMatch: matchedDimensions > 0,
  };
}
