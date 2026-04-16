import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import pool from "@/app/lib/db";
import { runCommunityFeedSync } from "@/app/lib/integrations/communityFeedSync";

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
      "DELETE FROM events WHERE source = 'community-feed' RETURNING id",
    );
    const deletedCount = deleted.rowCount ?? 0;

    const syncResult = await runCommunityFeedSync();

    revalidateEventPages();

    return NextResponse.json(
      {
        msg: syncResult.message,
        deleted: deletedCount,
        deletedScope: "community-feed",
        feeds: syncResult.feeds,
        keywords: syncResult.keywords,
        locations: syncResult.locations,
        fetched: syncResult.totals.fetched,
        matched: syncResult.totals.matched,
        created: syncResult.totals.created,
        updated: syncResult.totals.updated,
        unchanged: syncResult.totals.unchanged,
      },
      { status: syncResult.status },
    );
  } catch (error) {
    console.error("/api/events/community/reset-sync error:", error);
    return NextResponse.json(
      { error: "Failed to delete and resync events" },
      { status: 500 },
    );
  }
}
