// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";

function sanitizeEmptyToNull(obj: Record<string, any>) {
  const sanitized: Record<string, any> = {};
  for (const key in obj) sanitized[key] = obj[key] === "" ? null : obj[key];
  return sanitized;
}

// GET: read from "profiles" (a VIEW over the ERD tables)
export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const userSub = session.user.sub;

    const result = await pool.query(
      `SELECT *
       FROM internsnow_db.profiles
       WHERE user_id = $1
       LIMIT 1`,
      [userSub],
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const p = result.rows[0];

    return NextResponse.json({
      authenticated: true,
      userId: p.user_id,
      firstName: p.first_name ?? null,
      lastName: p.last_name ?? null,
      email: p.email ?? null,
      school: p.school ?? null,
      startDate: p.start_date ?? null,
      endDate: p.end_date ?? null,
      status: p.status ?? null,
      description: p.description ?? null,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// POST: write into ERD tables (USER, INSTITUTION, EDUCATION)
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSub = session.user.sub;
    const body = sanitizeEmptyToNull(await request.json());

    const firstName = body.firstName ?? body.first_name ?? null;
    const lastName = body.lastName ?? body.last_name ?? null;
    const email = body.email ?? session.user.email ?? null;

    const schoolName = body.school ?? body.institutionName ?? null;
    const startDate = body.startDate ?? body.start_date ?? null;
    const endDate = body.endDate ?? body.end_date ?? null;
    const status = body.status ?? null;
    const description = body.description ?? null;

    await client.query("BEGIN");

    // Ensure USER.auth0_sub exists in your schema
    // If you haven't added it yet:
    // ALTER TABLE internsnow_db."USER" ADD COLUMN auth0_sub TEXT UNIQUE;

    // Upsert user by auth0_sub
    const userUpsert = await client.query(
      `INSERT INTO internsnow_db."USER" (first_name, last_name, email, auth0_sub)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (auth0_sub)
       DO UPDATE SET first_name = EXCLUDED.first_name,
                     last_name  = EXCLUDED.last_name,
                     email      = EXCLUDED.email
       RETURNING user_id`,
      [firstName, lastName, email, userSub],
    );

    const userId = userUpsert.rows[0].user_id as number;

    // Upsert institution by name
    let institutionId: number | null = null;
    if (schoolName) {
      const instFind = await client.query(
        `SELECT institution_id
         FROM internsnow_db."INSTITUTION"
         WHERE name = $1
         LIMIT 1`,
        [schoolName],
      );

      if (instFind.rowCount > 0) {
        institutionId = instFind.rows[0].institution_id;
      } else {
        const instIns = await client.query(
          `INSERT INTO internsnow_db."INSTITUTION"(name)
           VALUES ($1)
           RETURNING institution_id`,
          [schoolName],
        );
        institutionId = instIns.rows[0].institution_id;
      }
    }

    // Update latest education row if exists else insert
    const eduExisting = await client.query(
      `SELECT edu_id
       FROM internsnow_db."EDUCATION"
       WHERE user_id = $1
       ORDER BY start_date DESC NULLS LAST
       LIMIT 1`,
      [userId],
    );

    if (eduExisting.rowCount > 0) {
      const eduId = eduExisting.rows[0].edu_id;
      await client.query(
        `UPDATE internsnow_db."EDUCATION"
         SET start_date = COALESCE($1, start_date),
             end_date = $2,
             status = $3,
             description = $4,
             institution_id = $5
         WHERE edu_id = $6`,
        [startDate, endDate, status, description, institutionId, eduId],
      );
    } else {
      await client.query(
        `INSERT INTO internsnow_db."EDUCATION"
           (start_date, end_date, status, description, user_id, institution_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [startDate, endDate, status, description, userId, institutionId],
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /api/profile error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  } finally {
    client.release();
  }
}
