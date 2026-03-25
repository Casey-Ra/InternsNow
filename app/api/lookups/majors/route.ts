import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { relationExists } from "@/app/lib/dbRelations";

const userMajorsRelation = '"USER MAJOR"';

export async function GET() {
  try {
    if (!(await relationExists(userMajorsRelation))) {
      return NextResponse.json([]);
    }

    const r = await pool.query(
      `SELECT DISTINCT name
       FROM ${userMajorsRelation}
       WHERE name IS NOT NULL AND TRIM(name) <> ''
       ORDER BY name ASC`,
    );
    return NextResponse.json(r.rows); // [{ name: "Computer Science" }, ...]
  } catch (e) {
    console.error("GET /api/lookups/majors error:", e);
    return NextResponse.json([]);
  }
}
