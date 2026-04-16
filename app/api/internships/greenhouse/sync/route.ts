import { NextRequest, NextResponse } from "next/server";
import {
  type GreenhouseSyncRequest,
  runGreenhouseSync,
} from "@/app/lib/integrations/greenhouseSync";

export async function POST(request: NextRequest) {
  try {
    let body: GreenhouseSyncRequest = {};
    try {
      body = (await request.json()) as {
        boardsText?: string;
        keywordsText?: string;
      };
    } catch {
      body = {};
    }

    const result = await runGreenhouseSync(body);

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
    console.error("/api/internships/greenhouse/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Greenhouse internships" },
      { status: 500 },
    );
  }
}
