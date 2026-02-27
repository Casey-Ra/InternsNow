import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const result = await pool.query(
    `
    SELECT institution_id AS id, name
    FROM "INSTITUTION"
    WHERE name ILIKE $1
    ORDER BY name
    LIMIT 20
    `,
    [`%${q}%`],
  );

  return NextResponse.json({ items: result.rows });
}
