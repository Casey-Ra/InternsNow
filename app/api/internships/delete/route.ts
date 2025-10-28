import { NextRequest, NextResponse } from "next/server";
import { deleteInternship } from "../../../lib/models/Internship";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Missing internship id" }, { status: 400 });
    }

    const ok = await deleteInternship(id);

    if (!ok) {
      return NextResponse.json({ error: "Internship not found or not deleted" }, { status: 404 });
    }

    return NextResponse.json({ msg: "Internship deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("/api/internships/delete error:", err?.message || err);
    return NextResponse.json({ error: "Failed to delete internship" }, { status: 500 });
  }
}
