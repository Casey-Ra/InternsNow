const LEVER_BASE_URL = "https://api.lever.co/v0/postings";
const MAX_DESCRIPTION_LENGTH = 5000;

const DEFAULT_LEVER_KEYWORDS = [
  "intern",
  "internship",
  "co-op",
  "apprentice",
  "apprenticeship",
  "fellowship",
  "new grad",
  "new graduate",
  "entry level",
  "entry-level",
  "early career",
  "campus",
  "rotational",
  "rotation program",
];

export type LeverBoardConfig = {
  slug: string;
  companyName: string;
};

export type LeverJobCategories = {
  commitment?: string | null;
  department?: string | null;
  location?: string | null;
  team?: string | null;
  level?: string | null;
};

export type LeverJobContentList = {
  text?: string | null;
  content?: string | null;
};

export type LeverJobContent = {
  description?: string | null;
  descriptionHtml?: string | null;
  lists?: LeverJobContentList[];
  closing?: string | null;
};

export type LeverJob = {
  id: string;
  text: string;
  hostedUrl: string;
  categories?: LeverJobCategories;
  content?: LeverJobContent;
  tags?: string[];
};

export type LeverInternshipInput = {
  company_name: string;
  job_description: string;
  url: string;
};

export const DEFAULT_LEVER_BOARDS: LeverBoardConfig[] = [
  // Fintech
  { slug: "plaid", companyName: "Plaid" },
  { slug: "wealthfront", companyName: "Wealthfront" },
  { slug: "bhg-inc", companyName: "BHG Financial" },

  // Defense / Autonomous / Aerospace
  { slug: "palantir", companyName: "Palantir" },
  { slug: "zoox", companyName: "Zoox" },
  { slug: "shieldai", companyName: "Shield AI" },
  { slug: "weride", companyName: "WeRide" },
  { slug: "woven-by-toyota", companyName: "Woven by Toyota" },

  // Quant / Trading
  { slug: "belvederetrading", companyName: "Belvedere Trading" },
  { slug: "quantco-", companyName: "QuantCo" },

  // Health / Consumer
  { slug: "ro", companyName: "Ro" },
  { slug: "whoop", companyName: "WHOOP" },
  { slug: "rover", companyName: "Rover" },
  { slug: "nimblerx", companyName: "NimbleRx" },
  { slug: "matchgroup", companyName: "Match Group" },

  // SaaS / Dev Tools / Security
  { slug: "outreach", companyName: "Outreach" },
  { slug: "glide", companyName: "Glide" },
  { slug: "jumpcloud", companyName: "JumpCloud" },
  { slug: "twingate", companyName: "Twingate" },
  { slug: "nextech", companyName: "Nextech" },

  // Real Estate / Marketplace
  { slug: "neighbor", companyName: "Neighbor" },

  // Education
  { slug: "skillshare", companyName: "Skillshare" },
];

function splitConfigEntries(raw: string): string[] {
  return raw
    .split(/[\n;]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function titleizeSlug(slug: string): string {
  return slug
    .split(/[-_.]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseLeverBoards(raw: string): LeverBoardConfig[] {
  const seenSlugs = new Set<string>();
  const boards: LeverBoardConfig[] = [];

  for (const entry of splitConfigEntries(raw)) {
    const [slugPart, ...companyParts] = entry.split("|");
    const slug = slugPart?.trim().toLowerCase();
    if (!slug || seenSlugs.has(slug)) {
      continue;
    }

    const companyName = companyParts.join("|").trim() || titleizeSlug(slug);
    boards.push({ slug, companyName });
    seenSlugs.add(slug);
  }

  return boards;
}

export function serializeLeverBoards(boards: LeverBoardConfig[]): string {
  return boards.map((board) => `${board.slug}|${board.companyName}`).join("\n");
}

export function getConfiguredLeverBoards(): LeverBoardConfig[] {
  const configured = parseLeverBoards(process.env.LEVER_BOARDS ?? "");
  if (configured.length > 0) {
    return configured;
  }

  return DEFAULT_LEVER_BOARDS.map((board) => ({ ...board }));
}

export function getLeverKeywords(raw?: string): string[] {
  const source = raw ?? process.env.LEVER_KEYWORDS ?? "";
  const parsed = source
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  return parsed.length > 0 ? Array.from(new Set(parsed)) : DEFAULT_LEVER_KEYWORDS;
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

function normalizePlainText(value: string): string {
  return value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

export function formatLeverJobDescription(job: LeverJob): string {
  const location = job.categories?.location?.trim() ?? "";
  const team = [job.categories?.team, job.categories?.department]
    .filter(Boolean)
    .join(" | ");

  const rawDescription = job.content?.descriptionHtml
    ? stripHtml(job.content.descriptionHtml)
    : job.content?.description ?? "";

  const listSections = (job.content?.lists ?? [])
    .map((list) => {
      const heading = list.text?.trim() ?? "";
      const body = list.content ? normalizePlainText(stripHtml(list.content)) : "";
      return [heading, body].filter(Boolean).join("\n");
    })
    .filter(Boolean);

  const description = normalizePlainText(rawDescription);

  const sections = [
    `Role: ${job.text}`,
    location ? `Location: ${location}` : "",
    team ? `Team: ${team}` : "",
    description,
    ...listSections,
  ].filter(Boolean);

  return truncate(sections.join("\n\n"), MAX_DESCRIPTION_LENGTH);
}

export function jobMatchesLeverKeywords(job: LeverJob, keywords: string[]): boolean {
  if (keywords.length === 0) {
    return true;
  }

  const descriptionText = job.content?.description ?? job.content?.descriptionHtml ?? "";
  const haystack = [
    job.text,
    descriptionText,
    job.categories?.commitment ?? "",
    ...(job.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function mapLeverJobToInternshipInput(
  board: LeverBoardConfig,
  job: LeverJob,
): LeverInternshipInput {
  return {
    company_name: `${board.companyName} - ${job.text}`.slice(0, 255),
    job_description: formatLeverJobDescription(job),
    url: job.hostedUrl,
  };
}

export async function fetchLeverJobs(slug: string): Promise<LeverJob[]> {
  const url = `${LEVER_BASE_URL}/${encodeURIComponent(slug)}?mode=json`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Lever request failed for ${slug} (${response.status})`);
  }

  const payload = (await response.json()) as LeverJob[] | { data?: LeverJob[] };
  // Lever returns either a plain array or { data: [...] }
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray((payload as { data?: LeverJob[] }).data)) {
    return (payload as { data: LeverJob[] }).data;
  }

  return [];
}
