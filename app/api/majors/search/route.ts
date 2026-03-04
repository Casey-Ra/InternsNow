import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    const r = await pool.query(
      `
      SELECT major_id AS id, name
      FROM "MAJOR"
      WHERE name ILIKE $1
      ORDER BY name
      LIMIT 20
      `,
      [`%${q}%`],
    );

    return NextResponse.json(r.rows);
  } catch (e) {
    console.error("GET /api/majors/search error:", e);
    return NextResponse.json([]);
  }
}
