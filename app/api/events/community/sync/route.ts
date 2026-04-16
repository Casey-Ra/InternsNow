import { NextResponse } from "next/server";
import { runCommunityFeedSync } from "@/app/lib/integrations/communityFeedSync";

export async function POST() {
  try {
    const result = await runCommunityFeedSync();

    return NextResponse.json(
      {
        msg: result.message,
        feeds: result.feeds,
        keywords: result.keywords,
        locations: result.locations,
        fetched: result.totals.fetched,
        matched: result.totals.matched,
        created: result.totals.created,
        updated: result.totals.updated,
        unchanged: result.totals.unchanged,
      },
      { status: result.status },
    );
  } catch (error) {
    console.error("/api/events/community/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync community event feeds" },
      { status: 500 },
    );
  }
}