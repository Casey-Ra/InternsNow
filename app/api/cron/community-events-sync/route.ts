import { NextRequest, NextResponse } from "next/server";
import { runCommunityFeedSync } from "@/app/lib/integrations/communityFeedSync";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCommunityFeedSync();

    return NextResponse.json(
      {
        msg: result.message,
        feeds: result.feeds,
        totals: result.totals,
      },
      { status: result.status },
    );
  } catch (error) {
    console.error("/api/cron/community-events-sync error:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled community event sync" },
      { status: 500 },
    );
  }
}