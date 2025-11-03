import { NextRequest, NextResponse } from "next/server";
import { updateInternship } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(raw);
    } catch (e) {
      body = await request.json().catch(() => ({}));
    }
    const { id, company_name, job_description, url } = body || {};

    console.log(`/api/internships/update received body: ${raw}`);

    if (!id || !company_name || !job_description || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await updateInternship(id, company_name, job_description, url);

    if (!updated) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 });
    }

    // Revalidate pages that list internships so changes are reflected (old and new paths)
    try {
      revalidatePath("/manage-internships");
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
