import pool from "@/app/lib/db";
import { inferEventEnd } from "@/app/lib/utils/eventTiming";

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
