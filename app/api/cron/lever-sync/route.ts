import { NextRequest, NextResponse } from "next/server";
import { runLeverSync } from "@/app/lib/integrations/leverSync";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runLeverSync();

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
    console.error("/api/cron/lever-sync error:", error);
    return NextResponse.json(
      { error: "Failed to run scheduled Lever sync" },
      { status: 500 },
    );
  }
}
