// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { initDb } from "@/lib/initDB";
import { auth0 } from "@/lib/auth0";
import pool from "@/lib/db";

await initDb();

// ✅ GET - fetch profile info
export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const result = await pool.query(
      `SELECT * FROM profiles WHERE user_id = $1`,
      [user.sub],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 },
      );
    }

    const p = result.rows[0];
    return NextResponse.json({
      fullName: p.full_name,
      email: p.email,
      phone: p.phone,
      location: p.location,
      school: p.school,
      degree: p.degree,
      major: p.major,
      graduationDate: p.graduation_date,
      gpa: p.gpa,
      skills: p.skills,
      interests: p.interests,
      bio: p.bio,
      linkedin: p.linkedin,
      github: p.github,
      portfolio: p.portfolio,
      resumeUrl: p.resume_url,
      profileImage: p.profile_image,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
// Converts all empty strings ("") to null so Postgres can handle deletions cleanly
function sanitizeEmptyToNull(obj: Record<string, any>) {
  const sanitized: Record<string, any> = {};
  for (const key in obj) {
    sanitized[key] = obj[key] === "" ? null : obj[key];
  }
  return sanitized;
}

// POST - update or insert profile
export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const data = sanitizeEmptyToNull(await request.json());

    const existing = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [user.sub],
    );

    // Safely check that the query returned a valid result
    if (existing && existing.rowCount && existing.rowCount > 0) {
      await pool.query(
        `UPDATE profiles
         SET full_name=$1, email=$2, phone=$3, location=$4, school=$5,
             degree=$6, major=$7, graduation_date=$8, gpa=$9, skills=$10,
             interests=$11, bio=$12, linkedin=$13, github=$14, portfolio=$15,
             resume_url=$16, profile_image=$17, updated_at=NOW()
         WHERE user_id=$18`,
        [
          data.full_name,
          data.email,
          data.phone,
          data.location,
          data.school || data.university,
          data.degree,
          data.major,
          data.graduationDate,
          data.gpa,
          skillsArray,
          data.interests,
          data.bio,
          data.linkedin,
          data.github,
          data.portfolio,
          data.resume_url,
          data.profile_image,
          user.sub,
        ],
      );
    } else {
      await pool.query(
        `INSERT INTO profiles (
          user_id, full_name, email, phone, location, school, degree,
          major, graduation_date, gpa, skills, interests, bio, linkedin,
          github, portfolio, resume_url, profile_image
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
        )`,
        [
          user.sub,
          data.full_name,
          data.email,
          data.phone,
          data.location,
          data.school || data.university,
          data.degree,
          data.major,
          data.graduationDate,
          data.gpa,
          skillsArray,
          data.interests,
          data.bio,
          data.linkedin,
          data.github,
          data.portfolio,
          data.resume_url,
          data.profile_image,
        ],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 },
    );
  }
}
