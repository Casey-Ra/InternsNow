export function cleanDateText(value: string): string {
  return value
    .replace(/\s*\+\s*\d+\s+more.*/i, "")
    .replace(/\s*•\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasExplicitYear(value: string): boolean {
  return /\b\d{4}\b/.test(value);
}

export function parseDateOnly(dateText: string): Date | null {
  const cleaned = cleanDateText(dateText);
  if (!cleaned) {
    return null;
  }

  // Strings like "Wed, Apr 29, 6:00 PM" are parsed by JS as year 2001.
  // If year is missing, force current year before parsing.
  if (hasExplicitYear(cleaned)) {
    const direct = new Date(cleaned);
    if (!Number.isNaN(direct.getTime())) {
      return direct;
    }
  }

  const withYear = `${cleaned} ${new Date().getFullYear()}`;
  const withYearParsed = new Date(withYear);
  if (!Number.isNaN(withYearParsed.getTime())) {
    return withYearParsed;
  }

  return null;
}

export function parseTimeOnDate(baseDate: Date, timeText: string): Date | null {
  const cleaned = cleanDateText(timeText);
  if (!cleaned) {
    return null;
  }

  const endCandidate = cleaned.includes("-")
    ? cleaned.split("-").pop()?.trim() ?? cleaned
    : cleaned;

  const datePart = baseDate.toDateString();
  const combined = new Date(`${datePart} ${endCandidate}`);
  if (!Number.isNaN(combined.getTime())) {
    return combined;
  }

  return null;
}

export function inferEventEnd(dateText: string, timeText: string): Date | null {
  const parsedDate = parseDateOnly(dateText);
  if (!parsedDate) {
    return null;
  }

  const dateHasTime = /\b\d{1,2}:\d{2}\s?(AM|PM)\b/i.test(dateText);
  if (dateHasTime) {
    return parsedDate;
  }

  const parsedTime = parseTimeOnDate(parsedDate, timeText);
  if (parsedTime) {
    return parsedTime;
  }

  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}
