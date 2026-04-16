import pool from "@/app/lib/db";

type MinimalEventRow = {
  id: string;
  date: string;
  time: string;
};

export type EventPruneResult = {
  scanned: number;
  pruned: number;
  skippedUnparseable: number;
};

function cleanDateText(value: string): string {
  return value
    .replace(/\s*\+\s*\d+\s+more.*/i, "")
    .replace(/\s*•\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasExplicitYear(value: string): boolean {
  return /\b\d{4}\b/.test(value);
}

function parseDateOnly(dateText: string): Date | null {
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

  // Add current year for strings like "Thu, Apr 30".
  const withYear = `${cleaned} ${new Date().getFullYear()}`;
  const withYearParsed = new Date(withYear);
  if (!Number.isNaN(withYearParsed.getTime())) {
    return withYearParsed;
  }

  return null;
}

function parseTimeOnDate(baseDate: Date, timeText: string): Date | null {
  const cleaned = cleanDateText(timeText);
  if (!cleaned) {
    return null;
  }

  // If this is a range, use the end time.
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

function inferEventEnd(dateText: string, timeText: string): Date | null {
  const parsedDate = parseDateOnly(dateText);
  if (!parsedDate) {
    return null;
  }

  // If date text already includes a specific time, keep it.
  const dateHasTime = /\b\d{1,2}:\d{2}\s?(AM|PM)\b/i.test(dateText);
  if (dateHasTime) {
    return parsedDate;
  }

  const parsedTime = parseTimeOnDate(parsedDate, timeText);
  if (parsedTime) {
    return parsedTime;
  }

  // Date-only events expire at end of local day.
  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

export async function prunePastEvents(now = new Date()): Promise<EventPruneResult> {
  const result = await pool.query(
    `
      SELECT id, date, time
      FROM events
      WHERE deleted_at IS NULL
    `,
  );

  const rows = result.rows as MinimalEventRow[];

  const toPrune: string[] = [];
  let skippedUnparseable = 0;

  for (const row of rows) {
    const inferredEnd = inferEventEnd(String(row.date ?? ""), String(row.time ?? ""));
    if (!inferredEnd) {
      skippedUnparseable += 1;
      continue;
    }

    if (inferredEnd.getTime() < now.getTime()) {
      toPrune.push(row.id);
    }
  }

  if (toPrune.length > 0) {
    await pool.query(
      `
        UPDATE events
        SET
          deleted_at = NOW(),
          deleted_by = 'system-prune',
          updated_at = NOW()
        WHERE id = ANY($1::text[])
          AND deleted_at IS NULL
      `,
      [toPrune],
    );
  }

  return {
    scanned: rows.length,
    pruned: toPrune.length,
    skippedUnparseable,
  };
}
