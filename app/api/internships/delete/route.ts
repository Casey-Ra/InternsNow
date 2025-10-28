import { NextRequest, NextResponse } from "next/server";
import { deleteInternship, deleteInternshipByUrl } from "../../../lib/models/Internship";

export async function POST(request: NextRequest) {
  try {
  const body = await request.json();
  const { id, url } = body || {};

    if (!id) {
      return NextResponse.json({ error: "Missing internship id" }, { status: 400 });
    }

    console.log(`/api/internships/delete received id: ${id}, url: ${url}`);
    let ok = await deleteInternship(id);
    console.log(`/api/internships/delete result for id ${id}:`, ok);

    if (!ok && url) {
      // Try deleting by url as a fallback when id doesn't match
      const removed = await deleteInternshipByUrl(url);
      console.log(`/api/internships/delete fallback by url ${url}: removed ${removed}`);
      ok = removed > 0;
    }

    if (!ok) {
      return NextResponse.json({ error: "Internship not found or not deleted" }, { status: 404 });
    }

    return NextResponse.json({ msg: "Internship deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("/api/internships/delete error:", err?.message || err);
    return NextResponse.json({ error: "Failed to delete internship" }, { status: 500 });
  }
}
