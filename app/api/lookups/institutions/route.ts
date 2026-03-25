import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { relationExists } from "@/app/lib/dbRelations";

const institutionsRelation = '"INSTITUTION"';

export async function GET() {
  try {
    if (!(await relationExists(institutionsRelation))) {
      return NextResponse.json([]);
    }

    const r = await pool.query(
      `SELECT institution_id, name
       FROM ${institutionsRelation}
       ORDER BY name ASC NULLS LAST, institution_id ASC`,
    );
    return NextResponse.json(r.rows);
  } catch (e) {
    console.error("GET /api/lookups/institutions error:", e);
    return NextResponse.json([]);
  }
}
