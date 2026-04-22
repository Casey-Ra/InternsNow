import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { runEventbriteGrabberSync } from "@/app/lib/integrations/eventbriteGrabberSync";

export async function POST(_request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runEventbriteGrabberSync();

    return NextResponse.json(
      {
        msg: result.message,
        source: result.source,
        fetched: result.fetched,
        created: result.created,
        updated: result.updated,
        unchanged: result.unchanged,
        error: result.error,
      },
      { status: result.ok ? 200 : 500 },
    );
  } catch (error) {
    console.error("/api/events/eventbrite/sync error:", error);
    return NextResponse.json(
      { error: "Failed to grab Eventbrite events" },
      { status: 500 },
    );
  }
}
