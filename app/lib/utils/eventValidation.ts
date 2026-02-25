import type { EventInput } from "@/app/lib/models/Event";

const MAX_TEXT_LENGTH = 5000;
const MAX_SHORT_LENGTH = 255;
const MAX_URL_LENGTH = 500;

type ValidationResult =
  | { ok: true; data: EventInput }
  | { ok: false; error: string };

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(rawTags: unknown): string[] {
  const values = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === "string"
      ? rawTags.split(",")
      : [];

  const normalized = values
    .map((value) => toTrimmedString(value))
    .filter(Boolean)
    .slice(0, 15);

  return Array.from(new Set(normalized));
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function lengthError(fieldName: string, maxLength: number): string {
  return `${fieldName} must be ${maxLength} characters or fewer`;
}

export function validateEventPayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const body = payload as Record<string, unknown>;

  const title = toTrimmedString(body.title);
  const date = toTrimmedString(body.date);
  const time = toTrimmedString(body.time);
  const location = toTrimmedString(body.location);
  const description = toTrimmedString(body.description);
  const details = toTrimmedString(body.details);
  const host = toTrimmedString(body.host);
  const price = toTrimmedString(body.price);
  const registrationLink = toTrimmedString(
    body.registrationLink ?? body.registration_link,
  );
  const tags = parseTags(body.tags);

  if (
    !title ||
    !date ||
    !time ||
    !location ||
    !description ||
    !details ||
    !host ||
    !price ||
    !registrationLink
  ) {
    return { ok: false, error: "Missing required event fields" };
  }

  if (title.length > MAX_SHORT_LENGTH) {
    return { ok: false, error: lengthError("Title", MAX_SHORT_LENGTH) };
  }
  if (date.length > MAX_SHORT_LENGTH) {
    return { ok: false, error: lengthError("Date", MAX_SHORT_LENGTH) };
  }
  if (time.length > MAX_SHORT_LENGTH) {
    return { ok: false, error: lengthError("Time", MAX_SHORT_LENGTH) };
  }
  if (location.length > MAX_SHORT_LENGTH) {
    return { ok: false, error: lengthError("Location", MAX_SHORT_LENGTH) };
  }
  if (host.length > MAX_SHORT_LENGTH) {
    return { ok: false, error: lengthError("Host", MAX_SHORT_LENGTH) };
  }
  if (price.length > MAX_SHORT_LENGTH) {
    return { ok: false, error: lengthError("Price", MAX_SHORT_LENGTH) };
  }
  if (description.length > MAX_TEXT_LENGTH) {
    return {
      ok: false,
      error: lengthError("Description", MAX_TEXT_LENGTH),
    };
  }
  if (details.length > MAX_TEXT_LENGTH) {
    return { ok: false, error: lengthError("Details", MAX_TEXT_LENGTH) };
  }
  if (registrationLink.length > MAX_URL_LENGTH) {
    return {
      ok: false,
      error: lengthError("Registration link", MAX_URL_LENGTH),
    };
  }

  if (!isHttpUrl(registrationLink)) {
    return {
      ok: false,
      error: "Registration link must start with http:// or https://",
    };
  }

  return {
    ok: true,
    data: {
      title,
      date,
      time,
      location,
      description,
      details,
      host,
      price,
      registrationLink,
      tags,
    },
  };
}
