import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { relationExists } from "@/app/lib/dbRelations";

const degreeTypesRelation = '"DEGREE TYPE"';

export async function GET() {
  try {
    if (!(await relationExists(degreeTypesRelation))) {
      return NextResponse.json([]);
    }

    const r = await pool.query(
      `SELECT degree_type_id, type, abbreviation, level
       FROM ${degreeTypesRelation}
       ORDER BY level ASC NULLS LAST, type ASC NULLS LAST, degree_type_id ASC`,
    );
    return NextResponse.json(r.rows);
  } catch (e) {
    console.error("GET /api/lookups/degree-types error:", e);
    return NextResponse.json([]);
  }
}
