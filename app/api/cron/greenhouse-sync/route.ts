import { NextRequest, NextResponse } from "next/server";
import { runGreenhouseSync } from "@/app/lib/integrations/greenhouseSync";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGreenhouseSync();

    return NextResponse.json(
      {
        msg: result.message,
        keywords: result.keywords,
        boards: result.boards,
        totals: result.totals,
      },
      { status: result.status },
    );
  } catch (error) {
    console.error("/api/cron/greenhouse-sync error:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled Greenhouse sync" },
      { status: 500 },
    );
  }
}
