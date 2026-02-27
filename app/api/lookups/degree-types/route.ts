import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const r = await pool.query(
      `SELECT degree_type_id, type, abbreviation, level
       FROM "DEGREE TYPE"
       ORDER BY level ASC NULLS LAST, type ASC NULLS LAST, degree_type_id ASC`,
    );
    return NextResponse.json(r.rows);
  } catch (e) {
    console.error("GET /api/lookups/degree-types error:", e);
    return NextResponse.json(
      { error: "Failed to load degree types" },
      { status: 500 },
    );
  }
}
