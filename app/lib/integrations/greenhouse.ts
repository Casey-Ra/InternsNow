const GREENHOUSE_BASE_URL = "https://boards-api.greenhouse.io/v1/boards";
const DEFAULT_GREENHOUSE_KEYWORDS = [
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
const MAX_DESCRIPTION_LENGTH = 5000;

export type GreenhouseBoardConfig = {
  token: string;
  companyName: string;
};

export type GreenhouseDepartment = {
  id?: number;
  name: string;
};

export type GreenhouseOffice = {
  id?: number;
  name: string;
  location?: string | null;
};

export type GreenhouseJob = {
  id: number;
  title: string;
  updated_at?: string;
  absolute_url: string;
  location?: { name?: string | null } | null;
  content?: string | null;
  departments?: GreenhouseDepartment[];
  offices?: GreenhouseOffice[];
  metadata?: unknown;
};

export type InternshipImportInput = {
  company_name: string;
  job_description: string;
  url: string;
};

export const DEFAULT_GREENHOUSE_BOARDS: GreenhouseBoardConfig[] = [
  // Big Tech / Consumer
  { token: "airbnb", companyName: "Airbnb" },
  { token: "discord", companyName: "Discord" },
  { token: "dropbox", companyName: "Dropbox" },
  { token: "figma", companyName: "Figma" },
  { token: "instacart", companyName: "Instacart" },
  { token: "lyft", companyName: "Lyft" },
  { token: "pinterest", companyName: "Pinterest" },
  { token: "reddit", companyName: "Reddit" },
  { token: "roku", companyName: "Roku" },
  { token: "squarespace", companyName: "Squarespace" },
  { token: "twitch", companyName: "Twitch" },
  { token: "peloton", companyName: "Peloton" },
  { token: "duolingo", companyName: "Duolingo" },
  { token: "grammarly", companyName: "Grammarly" },

  // AI / ML
  { token: "anthropic", companyName: "Anthropic" },
  { token: "deepmind", companyName: "DeepMind" },
  { token: "xai", companyName: "xAI" },
  { token: "scaleai", companyName: "Scale AI" },
  { token: "togetherai", companyName: "Together AI" },
  { token: "stabilityai", companyName: "Stability AI" },
  { token: "runwayml", companyName: "Runway" },
  { token: "databricks", companyName: "Databricks" },
  { token: "descript", companyName: "Descript" },
  { token: "gleanwork", companyName: "Glean" },

  // Fintech / Payments
  { token: "stripe", companyName: "Stripe" },
  { token: "coinbase", companyName: "Coinbase" },
  { token: "robinhood", companyName: "Robinhood" },
  { token: "brex", companyName: "Brex" },
  { token: "affirm", companyName: "Affirm" },
  { token: "chime", companyName: "Chime" },
  { token: "sofi", companyName: "SoFi" },
  { token: "marqeta", companyName: "Marqeta" },
  { token: "carta", companyName: "Carta" },
  { token: "nubank", companyName: "Nubank" },
  { token: "mercury", companyName: "Mercury" },
  { token: "toast", companyName: "Toast" },

  // Quant / Trading
  { token: "jumptrading", companyName: "Jump Trading" },
  { token: "janestreet", companyName: "Jane Street" },
  { token: "imc", companyName: "IMC Trading" },
  { token: "akunacapital", companyName: "Akuna Capital" },
  { token: "point72", companyName: "Point72" },
  { token: "dvtrading", companyName: "DV Trading" },
  { token: "arcesiumllc", companyName: "Arcesium" },
  { token: "capstoneinvestmentadvisors", companyName: "Capstone Investment Advisors" },
  { token: "aquaticcapitalmanagement", companyName: "Aquatic Capital Management" },
  { token: "gcmgrosvenor", companyName: "GCM Grosvenor" },

  // Enterprise SaaS / Dev Tools
  { token: "datadog", companyName: "Datadog" },
  { token: "hubspotjobs", companyName: "HubSpot" },
  { token: "okta", companyName: "Okta" },
  { token: "mongodb", companyName: "MongoDB" },
  { token: "elastic", companyName: "Elastic" },
  { token: "twilio", companyName: "Twilio" },
  { token: "gitlab", companyName: "GitLab" },
  { token: "asana", companyName: "Asana" },
  { token: "fivetran", companyName: "Fivetran" },
  { token: "dbtlabsinc", companyName: "dbt Labs" },
  { token: "airtable", companyName: "Airtable" },
  { token: "amplitude", companyName: "Amplitude" },
  { token: "neo4j", companyName: "Neo4j" },
  { token: "zscaler", companyName: "Zscaler" },
  { token: "cockroachlabs", companyName: "Cockroach Labs" },
  { token: "calendly", companyName: "Calendly" },
  { token: "vercel", companyName: "Vercel" },
  { token: "planningcenter", companyName: "Planning Center" },

  // Defense / Aerospace / Hardware / Robotics
  { token: "spacex", companyName: "SpaceX" },
  { token: "andurilindustries", companyName: "Anduril Industries" },
  { token: "waymo", companyName: "Waymo" },
  { token: "nuro", companyName: "Nuro" },
  { token: "lucidmotors", companyName: "Lucid Motors" },
  { token: "verkada", companyName: "Verkada" },
  { token: "purestorage", companyName: "Pure Storage" },
  { token: "psiquantum", companyName: "PsiQuantum" },
  { token: "astranis", companyName: "Astranis" },
  { token: "planetlabs", companyName: "Planet Labs" },
  { token: "apptronik", companyName: "Apptronik" },
  { token: "freeformfuturecorp", companyName: "Freeform" },
  { token: "relativity", companyName: "Relativity" },
  { token: "armada", companyName: "Armada" },
  { token: "rivian", companyName: "Rivian" },

  // Other
  { token: "c3iot", companyName: "C3 AI" },
  { token: "flexport", companyName: "Flexport" },
  { token: "klaviyo", companyName: "Klaviyo" },
  { token: "indeedflex", companyName: "Indeed Flex" },
  { token: "gusto", companyName: "Gusto" },
  { token: "lattice", companyName: "Lattice" },
  { token: "opendoor", companyName: "Opendoor" },
  { token: "checkr", companyName: "Checkr" },
  { token: "ziprecruiter", companyName: "ZipRecruiter" },
  { token: "thetradedesk", companyName: "The Trade Desk" },
  { token: "doubleverify", companyName: "DoubleVerify" },
  { token: "hootsuite", companyName: "Hootsuite" },
  { token: "lgelectronics", companyName: "LG Electronics" },
  { token: "carvana", companyName: "Carvana" },
  { token: "icapitalnetwork", companyName: "iCapital" },
];

function splitConfigEntries(raw: string): string[] {
  return raw
    .split(/[\n;]+/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function titleizeToken(token: string): string {
  return token
    .split(/[-_.]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseGreenhouseBoards(raw: string): GreenhouseBoardConfig[] {
  const seenTokens = new Set<string>();
  const boards: GreenhouseBoardConfig[] = [];

  for (const entry of splitConfigEntries(raw)) {
    const [tokenPart, ...companyParts] = entry.split("|");
    const token = tokenPart?.trim().toLowerCase();
    if (!token || seenTokens.has(token)) {
      continue;
    }

    const companyName = companyParts.join("|").trim() || titleizeToken(token);
    boards.push({ token, companyName });
    seenTokens.add(token);
  }

  return boards;
}

export function serializeGreenhouseBoards(
  boards: GreenhouseBoardConfig[],
): string {
  return boards
    .map((board) => `${board.token}|${board.companyName}`)
    .join("\n");
}

export function getConfiguredGreenhouseBoards(): GreenhouseBoardConfig[] {
  const configuredBoards = parseGreenhouseBoards(process.env.GREENHOUSE_BOARDS ?? "");
  if (configuredBoards.length > 0) {
    return configuredBoards;
  }

  return DEFAULT_GREENHOUSE_BOARDS.map((board) => ({ ...board }));
}

export function getGreenhouseKeywords(raw?: string): string[] {
  const source = raw ?? process.env.GREENHOUSE_KEYWORDS ?? "";
  const parsed = source
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return parsed.length > 0 ? Array.from(new Set(parsed)) : DEFAULT_GREENHOUSE_KEYWORDS;
}

function decodeHtmlEntities(value: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
  };

  let decoded = value;
  for (let pass = 0; pass < 2; pass += 1) {
    decoded = decoded.replace(
      /&(nbsp|amp|lt|gt|quot|#39|#x27|#x2F);/g,
      (match) => entities[match] ?? match,
    );
  }

  return decoded;
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

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    unique.push(normalized);
  }

  return unique;
}

function getOfficeLocations(job: GreenhouseJob): string[] {
  return uniqueStrings(
    (job.offices ?? []).flatMap((office) => [
      office.location ?? null,
      office.name ?? null,
    ]),
  );
}

export function formatGreenhouseJobDescription(job: GreenhouseJob): string {
  const location = uniqueStrings([
    job.location?.name ?? null,
    ...getOfficeLocations(job),
  ]);
  const departments = uniqueStrings(
    (job.departments ?? []).map((department) => department.name),
  );
  const content = normalizePlainText(
    stripHtml(decodeHtmlEntities(job.content ?? "")),
  );

  const sections = [
    `Role: ${job.title}`,
    location.length > 0 ? `Location: ${location.join(" | ")}` : "",
    departments.length > 0 ? `Team: ${departments.join(" | ")}` : "",
    content,
  ].filter(Boolean);

  return truncate(sections.join("\n\n"), MAX_DESCRIPTION_LENGTH);
}

export function jobMatchesGreenhouseKeywords(
  job: GreenhouseJob,
  keywords: string[],
): boolean {
  if (keywords.length === 0) {
    return true;
  }

  const haystack = `${job.title} ${job.content ?? ""}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function mapGreenhouseJobToInternshipInput(
  board: GreenhouseBoardConfig,
  job: GreenhouseJob,
): InternshipImportInput {
  return {
    company_name: `${board.companyName} - ${job.title}`.slice(0, 255),
    job_description: formatGreenhouseJobDescription(job),
    url: job.absolute_url,
  };
}

export async function fetchGreenhouseJobs(
  boardToken: string,
): Promise<GreenhouseJob[]> {
  const url = `${GREENHOUSE_BASE_URL}/${encodeURIComponent(
    boardToken,
  )}/jobs?content=true`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Greenhouse request failed for ${boardToken} (${response.status})`,
    );
  }

  const payload = (await response.json()) as { jobs?: GreenhouseJob[] };
  return Array.isArray(payload.jobs) ? payload.jobs : [];
}
