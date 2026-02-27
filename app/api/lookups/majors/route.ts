import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const r = await pool.query(
      `SELECT DISTINCT name
       FROM "USER MAJOR"
       WHERE name IS NOT NULL AND TRIM(name) <> ''
       ORDER BY name ASC`,
    );
    return NextResponse.json(r.rows); // [{ name: "Computer Science" }, ...]
  } catch (e) {
    console.error("GET /api/lookups/majors error:", e);
    return NextResponse.json(
      { error: "Failed to load majors" },
      { status: 500 },
    );
  }
}
