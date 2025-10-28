import { NextRequest, NextResponse } from "next/server";
import { createInternship } from "../../../lib/models/Internship";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, job_description, url } = body || {};

    if (!company_name || !job_description || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const internship = await createInternship(company_name, job_description, url);

    return NextResponse.json({ msg: "Internship created", data: internship }, { status: 201 });
  } catch (err: any) {
    console.error("/api/internships/create error:", err?.message || err);
    return NextResponse.json({ error: "Failed to create internship" }, { status: 500 });
  }
}
