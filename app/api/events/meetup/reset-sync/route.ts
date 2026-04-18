import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import pool from "@/app/lib/db";
import { runMeetupSync } from "@/app/lib/integrations/meetupSync";

function revalidateEventPages() {
  try {
    revalidatePath("/events");
    revalidatePath("/student/events");
    revalidatePath("/events/manage");
  } catch (error) {
    console.warn("Event revalidation failed:", error);
  }
}

export async function POST() {
  try {
    const deleted = await pool.query(
      "DELETE FROM events WHERE source = 'meetup' RETURNING id",
    );
    const deletedCount = deleted.rowCount ?? 0;

    const syncResult = await runMeetupSync();

    revalidateEventPages();

    return NextResponse.json(
      {
        msg: syncResult.message,
        deleted: deletedCount,
        deletedScope: "meetup",
        fetched: syncResult.fetched,
        created: syncResult.created,
        updated: syncResult.updated,
        unchanged: syncResult.unchanged,
        error: syncResult.error,
      },
      { status: syncResult.ok ? 200 : 500 },
    );
  } catch (error) {
    console.error("/api/events/meetup/reset-sync error:", error);
    return NextResponse.json(
      { error: "Failed to delete and resync Meetup events" },
      { status: 500 },
    );
  }
}
