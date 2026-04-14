import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  type LeverSyncRequest,
  runLeverSync,
} from "@/app/lib/integrations/leverSync";

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: LeverSyncRequest = {};
    try {
      body = (await request.json()) as {
        boardsText?: string;
        keywordsText?: string;
      };
    } catch {
      body = {};
    }

    const result = await runLeverSync(body);

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
    console.error("/api/internships/lever/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Lever internships" },
      { status: 500 },
    );
  }
}
