import { NextRequest, NextResponse } from "next/server";
import { runAllEventbriteGrabberSyncs } from "@/app/lib/integrations/eventbriteGrabberSync";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results, totals } = await runAllEventbriteGrabberSyncs();

    const hasError = results.some((r) => !r.ok);

    return NextResponse.json(
      {
        msg: hasError
          ? "Eventbrite grabber sync completed with errors"
          : "Eventbrite grabber sync completed",
        results,
        totals,
      },
      { status: hasError ? 207 : 200 },
    );
  } catch (error) {
    console.error("/api/cron/eventbrite-sync error:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled Eventbrite grabber sync" },
      { status: 500 },
    );
  }
}
