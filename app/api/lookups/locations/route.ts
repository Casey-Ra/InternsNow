import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (q.length < 2) return NextResponse.json([]);

    const { rows } = await pool.query(
      `
      SELECT
        COALESCE(location_id::text, label) AS id,
        label
      FROM public.locations
      WHERE lower(label) LIKE lower($1)
      ORDER BY
        COALESCE(popularity, 0) DESC,
        label ASC
      LIMIT 10
      `,
      [`%${q}%`],
    );

    return NextResponse.json(rows);
  } catch (e) {
    console.error("locations lookup error", e);
    return NextResponse.json([], { status: 200 });
  }
}
