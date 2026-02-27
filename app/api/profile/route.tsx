// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";

function splitName(fullName?: string | null) {
  const s = (fullName ?? "").trim();
  if (!s) return { first: null, last: null };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: null };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

async function getOrCreateUserId(auth0Sub: string, email?: string | null) {
  // One atomic operation: if auth0_sub exists, return it; if not, create it.
  const r = await pool.query(
    `
    INSERT INTO "USER" (auth0_sub, first_name, last_name, email, created_at, update_at)
    VALUES ($1, 'Unknown', 'User', COALESCE($2, 'unknown@example.com'), NOW(), NOW())
    ON CONFLICT (auth0_sub) DO UPDATE SET
      email = COALESCE(EXCLUDED.email, "USER".email),
      update_at = NOW()
    RETURNING user_id, first_name, last_name, email
    `,
    [auth0Sub, email],
  );

  return r.rows[0];
}

// GET - fetch profile info (from normalized tables)
export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const auth0Sub = session.user.sub;
    const email = (session.user as any).email ?? null;

    const u = await getOrCreateUserId(auth0Sub, email);

    // EDUCATION + lookups + majors
    const eduRes = await pool.query(
      `
      SELECT
        e.edu_id,
        e.start_date,
        e.end_date,
        e.status,
        e.description,

        i.institution_id,
        i.name AS institution_name,

        dt.degree_type_id,
        dt.type AS degree_type,
        dt.abbreviation AS degree_abbrev,
        dt.level AS degree_level,

        COALESCE(m.majors, '[]'::json) AS majors
      FROM "EDUCATION" e
      LEFT JOIN "INSTITUTION" i ON i.institution_id = e.institution_id
      LEFT JOIN "DEGREE TYPE" dt ON dt.degree_type_id = e.degree_type_id

      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'userMajorId', um.user_major_id,
            'name', um.name,
            'isPrimary', um.is_primary
          ) ORDER BY um.is_primary DESC NULLS LAST, um.user_major_id ASC
        ) AS majors
        FROM "USER MAJOR" um
        WHERE um.education_id = e.edu_id
      ) m ON TRUE

      WHERE e.user_id = $1
      ORDER BY e.start_date DESC NULLS LAST, e.edu_id DESC
      `,
      [u.user_id],
    );

    // WORK EXPERIENCE + state/country names
    const workRes = await pool.query(
      `
      SELECT
        w.work_id,
        w.company,
        w.position,
        w.description,
        w.start_date,
        w.end_date,
        w.current,
        w.city,
        w.state_id,
        s.state_code,
        s.state_name,
        w.country_id,
        c.country_code,
        c.country_name
      FROM "WORK EXPERIENCE" w
      LEFT JOIN "US_STATES" s ON s.id = w.state_id
      LEFT JOIN "COUNTRIES" c ON c.id = w.country_id
      WHERE w.user_id = $1
      ORDER BY w.work_id DESC
      `,
      [u.user_id],
    );

    return NextResponse.json({
      authenticated: true,
      userId: u.user_id,
      fullName: [u.first_name, u.last_name].filter(Boolean).join(" "),
      email: u.email,

      education: eduRes.rows.map((e) => ({
        eduId: e.edu_id,
        startDate: e.start_date,
        endDate: e.end_date,
        status: e.status,
        description: e.description,
        institution: e.institution_id
          ? { institutionId: e.institution_id, name: e.institution_name }
          : null,
        degreeType: e.degree_type_id
          ? {
              degreeTypeId: e.degree_type_id,
              type: e.degree_type,
              abbreviation: e.degree_abbrev,
              level: e.degree_level,
            }
          : null,
        majors: e.majors, // already JSON array
      })),

      workExperience: workRes.rows.map((w) => ({
        workId: w.work_id,
        company: w.company,
        position: w.position,
        description: w.description,
        startDate: w.start_date,
        endDate: w.end_date,
        current: w.current,
        city: w.city,
        state: w.state_id
          ? { id: w.state_id, code: w.state_code, name: w.state_name }
          : null,
        country: w.country_id
          ? { id: w.country_id, code: w.country_code, name: w.country_name }
          : null,
      })),
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// POST - update/insert user + education + work
export async function POST(request: Request) {
  const client = await pool.connect();
  try {
    const session = await auth0.getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const auth0Sub = session.user.sub;
    const emailFromAuth0 = (session.user as any).email ?? null;

    const body = await request.json();

    const fullName = (body.fullName ?? null) as string | null;
    const { first, last } = splitName(fullName);

    const email = (body.email ?? emailFromAuth0 ?? null) as string | null;

    const education = Array.isArray(body.education) ? body.education : [];
    const workExperience = Array.isArray(body.workExperience)
      ? body.workExperience
      : [];

    await client.query("BEGIN");

    // Upsert USER by auth0_sub
    const userUpsert = await client.query(
      `
      INSERT INTO "USER" (auth0_sub, first_name, last_name, email, created_at, update_at)
      VALUES ($1, COALESCE($2,'Unknown'), COALESCE($3,'User'), COALESCE($4,'unknown@example.com'), NOW(), NOW())
      ON CONFLICT (auth0_sub) DO UPDATE SET
        first_name = COALESCE(EXCLUDED.first_name, "USER".first_name),
        last_name = COALESCE(EXCLUDED.last_name, "USER".last_name),
        email = COALESCE(EXCLUDED.email, "USER".email),
        update_at = NOW()
      RETURNING user_id
      `,
      [auth0Sub, first, last, email],
    );

    const userId = userUpsert.rows[0].user_id as number;

    // Replace EDUCATION (simple + reliable)
    // First delete majors for existing education rows, then delete education rows.
    const existingEdu = await client.query(
      `SELECT edu_id FROM "EDUCATION" WHERE user_id = $1`,
      [userId],
    );
    const eduIds = existingEdu.rows.map((r) => r.edu_id);

    if (eduIds.length > 0) {
      await client.query(
        `DELETE FROM "USER MAJOR" WHERE education_id = ANY($1::int[])`,
        [eduIds],
      );
    }
    await client.query(`DELETE FROM "EDUCATION" WHERE user_id = $1`, [userId]);

    for (const e of education) {
      const eduIns = await client.query(
        `
        INSERT INTO "EDUCATION" (
          start_date, end_date, status, description,
          degree_type_id, user_id, institution_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING edu_id
        `,
        [
          e.startDate ?? null,
          e.endDate ?? null,
          e.status ?? null,
          e.description ?? null,
          e.degreeTypeId ?? null,
          userId,
          e.institutionId ?? null,
        ],
      );

      const eduId = eduIns.rows[0].edu_id as number;
      const majors = Array.isArray(e.majors) ? e.majors : [];

      for (const m of majors) {
        await client.query(
          `
          INSERT INTO "USER MAJOR" (name, is_primary, education_id)
          VALUES ($1,$2,$3)
          `,
          [m.name ?? null, m.isPrimary ?? null, eduId],
        );
      }
    }

    // Replace WORK EXPERIENCE
    await client.query(`DELETE FROM "WORK EXPERIENCE" WHERE user_id = $1`, [
      userId,
    ]);

    for (const w of workExperience) {
      await client.query(
        `
        INSERT INTO "WORK EXPERIENCE" (
          company, position, description,
          start_date, end_date, current,
          city, state_id, country_id, user_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `,
        [
          w.company ?? null,
          w.position ?? null,
          w.description ?? null,
          w.startDate ?? null,
          w.endDate ?? null,
          w.current ?? null,
          w.city ?? null,
          w.stateId ?? null,
          w.countryId ?? null,
          userId,
        ],
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
