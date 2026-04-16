import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import pool from "@/app/lib/db";
import { runEventbriteGrabberSync } from "@/app/lib/integrations/eventbriteGrabberSync";

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
      "DELETE FROM events WHERE source = 'eventbrite' RETURNING id",
    );
    const deletedCount = deleted.rowCount ?? 0;

    const syncResult = await runEventbriteGrabberSync();

    revalidateEventPages();

    return NextResponse.json(
      {
        msg: syncResult.message,
        deleted: deletedCount,
        deletedScope: "eventbrite",
        fetched: syncResult.fetched,
        created: syncResult.created,
        updated: syncResult.updated,
        unchanged: syncResult.unchanged,
        attemptedQueries: syncResult.attemptedQueries,
        failedQueries: syncResult.failedQueries,
        totalQueries: syncResult.totalQueries,
        chunkIndex: syncResult.chunkIndex,
        chunkCount: syncResult.chunkCount,
        error: syncResult.error,
      },
      { status: syncResult.ok ? 200 : 500 },
    );
  } catch (error) {
    console.error("/api/events/eventbrite/reset-sync error:", error);
    return NextResponse.json(
      { error: "Failed to delete and resync Eventbrite events" },
      { status: 500 },
    );
  }
}
