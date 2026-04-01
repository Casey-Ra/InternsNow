import { NextRequest, NextResponse } from "next/server";
import { runAllEventbriteSyncs } from "@/app/lib/integrations/eventbriteSync";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { results, totals } = await runAllEventbriteSyncs();

    const hasError = results.some((r) => !r.ok);

    return NextResponse.json(
      {
        msg: hasError ? "Eventbrite sync completed with errors" : "Eventbrite sync completed",
        results,
        totals,
      },
      { status: hasError ? 207 : 200 },
    );
  } catch (error) {
    console.error("/api/cron/eventbrite-sync error:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled Eventbrite sync" },
      { status: 500 },
    );
  }
}
