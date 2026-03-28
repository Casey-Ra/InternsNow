import { NextRequest, NextResponse } from "next/server";
import { createInternship } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(raw);
    } catch (e) {
      body = await request.json().catch(() => ({}));
    }
    const { company_name, job_description, url } = body || {};

    console.log(`/api/internships/create received body: ${raw}`);

    if (!company_name || !job_description || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const internship = await createInternship(company_name, job_description, url);

    // Revalidate pages that list internships so the new item appears (old and new paths)
    try {
      revalidatePath("/manage-internships");
      revalidatePath("/employer/manage-internships");
      revalidatePath("/opportunities");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }

    return NextResponse.json({ msg: "Internship created", data: internship }, { status: 201 });
  } catch (err: any) {
    console.error("/api/internships/create error:", err?.message || err);
    return NextResponse.json({ error: "Failed to create internship" }, { status: 500 });
  }
}
