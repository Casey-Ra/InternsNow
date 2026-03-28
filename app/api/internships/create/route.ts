import { NextRequest, NextResponse } from "next/server";
import { createInternship } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";

type InternshipPayload = {
  company_name?: string;
  job_description?: string;
  url?: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.text();
    let body: InternshipPayload = {};
    try {
      body = JSON.parse(raw) as InternshipPayload;
    } catch {
      body = (await request.json().catch(() => ({}))) as InternshipPayload;
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
    } catch (error) {
      console.warn("revalidatePath failed:", error);
    }

    return NextResponse.json({ msg: "Internship created", data: internship }, { status: 201 });
  } catch (error: unknown) {
    console.error("/api/internships/create error:", getErrorMessage(error));
    return NextResponse.json({ error: "Failed to create internship" }, { status: 500 });
  }
}
