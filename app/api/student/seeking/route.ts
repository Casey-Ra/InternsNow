import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) return NextResponse.json({ seeking: null });

    const res = await pool.query(
      `SELECT seeking FROM "USER" WHERE auth0_sub = $1 LIMIT 1`,
      [session.user.sub],
    );
    const v = res.rows[0]?.seeking;
    const seeking =
      v === "job" || v === "internship" || v === "both" ? v : null;
    return NextResponse.json({ seeking });
  } catch {
    return NextResponse.json({ seeking: null });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const seeking =
      body.seeking === "job" ||
      body.seeking === "internship" ||
      body.seeking === "both"
        ? (body.seeking as string)
        : null;

    await pool.query(
      `UPDATE "USER" SET seeking = $1, update_at = NOW() WHERE auth0_sub = $2`,
      [seeking, session.user.sub],
    );

    return NextResponse.json({ seeking });
  } catch (error) {
    console.error("POST /api/student/seeking error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
