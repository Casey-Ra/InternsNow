import { NextRequest, NextResponse } from "next/server";
import { updateInternship } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, company_name, job_description, url } = body || {};

    if (!id || !company_name || !job_description || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await updateInternship(id, company_name, job_description, url);

    if (!updated) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    // Revalidate pages that list internships so changes are reflected
    try {
      revalidatePath("/employer/manage-internships");
      revalidatePath("/student/find-opportunities");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }

    return NextResponse.json({ msg: "Internship updated", data: updated }, { status: 200 });
  } catch (err: any) {
    console.error("/api/internships/update error:", err?.message || err);
    // Handle unique constraint on URL
    if (err?.code === "23505") {
      return NextResponse.json({ error: "An internship with that URL already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update internship" }, { status: 500 });
  }
}
