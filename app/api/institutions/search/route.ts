import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { relationExists } from "@/app/lib/dbRelations";

const institutionsRelation = '"INSTITUTION"';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 2) {
      return NextResponse.json([]);
    }

    if (!(await relationExists(institutionsRelation))) {
      return NextResponse.json([]);
    }

    const result = await pool.query(
      `
      SELECT institution_id AS id, name
      FROM ${institutionsRelation}
      WHERE name ILIKE $1
      ORDER BY name
      LIMIT 20
      `,
      [`%${q}%`],
    );

    return NextResponse.json(result.rows);
  } catch (e) {
    console.error("GET /api/institutions/search error:", e);
    return NextResponse.json([]);
  }
}
