import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const r = await pool.query(
      `SELECT institution_id, name
       FROM "INSTITUTION"
       ORDER BY name ASC NULLS LAST, institution_id ASC`,
    );
    return NextResponse.json(r.rows);
  } catch (e) {
    console.error("GET /api/lookups/institutions error:", e);
    return NextResponse.json(
      { error: "Failed to load institutions" },
      { status: 500 },
    );
  }
}
