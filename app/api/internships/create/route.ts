import { NextRequest, NextResponse } from "next/server";
import { createInternship } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, job_description, url } = body || {};

    if (!company_name || !job_description || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const internship = await createInternship(company_name, job_description, url);

    // Revalidate pages that list internships so the new item appears
    try {
      revalidatePath("/employer/manage-internships");
      revalidatePath("/student/find-opportunities");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }

    return NextResponse.json({ msg: "Internship created", data: internship }, { status: 201 });
  } catch (err: any) {
    console.error("/api/internships/create error:", err?.message || err);
    return NextResponse.json({ error: "Failed to create internship" }, { status: 500 });
  }
}
