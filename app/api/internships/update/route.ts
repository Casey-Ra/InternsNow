import { NextRequest, NextResponse } from "next/server";
import { updateInternship } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";
import { auth0 } from "@/lib/auth0";

type InternshipPayload = {
  id?: string;
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
      revalidatePath("/opportunities");
    } catch (error) {
      console.warn("revalidatePath failed:", error);
    }

    return NextResponse.json({ msg: "Internship updated", data: updated }, { status: 200 });
  } catch (error: unknown) {
    console.error("/api/internships/update error:", getErrorMessage(error));
    // Handle unique constraint on URL
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json({ error: "An internship with that URL already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update internship" }, { status: 500 });
  }
}
