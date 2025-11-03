import { NextRequest, NextResponse } from "next/server";
import { deleteInternship, deleteInternshipByUrl } from "../../../lib/models/Internship";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      // fall back to parsed json
      body = await request.json().catch(() => ({}));
    }

    const { id, url } = body || {};

    console.log(`/api/internships/delete received rawBody: ${rawBody}`);

    let deletedCount = 0;
    let method = "none";

    if (id) {
      console.log(`/api/internships/delete attempting delete by id: ${id}`);
      const ok = await deleteInternship(id);
      if (ok) {
        // deleteInternship returns boolean; set deletedCount to 1 when true
        deletedCount = 1;
        method = "id";
        console.log(`/api/internships/delete deleted by id ${id}`);
      } else {
        console.log(`/api/internships/delete delete by id returned no rows for id ${id}`);
      }
    }

    if (!deletedCount && url) {
      console.log(`/api/internships/delete attempting fallback delete by url: ${url}`);
      const removed = await deleteInternshipByUrl(url);
      if (removed > 0) {
        deletedCount = removed;
        method = "url";
        console.log(`/api/internships/delete deleted ${deletedCount} row(s) by url ${url}`);
      } else {
        console.log(`/api/internships/delete fallback by url returned 0 rows for url ${url}`);
      }
    }

    if (!deletedCount) {
      return NextResponse.json({ error: "Internship not found or not deleted", deleted: 0 }, { status: 404 });
    }

    // Revalidate important pages so UI shows latest data (include both old and new paths)
    try {
      revalidatePath("/manage-internships");
      revalidatePath("/employer/manage-internships");
      revalidatePath("/student/find-opportunities");
    } catch (e) {
      console.warn("revalidatePath failed:", e);
    }

    return NextResponse.json({ msg: "Internship deleted", deleted: deletedCount, method }, { status: 200 });
  } catch (err: any) {
    console.error("/api/internships/delete error:", err?.message || err);
    return NextResponse.json({ error: "Failed to delete internship" }, { status: 500 });
  }
}
