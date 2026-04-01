import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { runEventbriteSync } from "@/app/lib/integrations/eventbriteSync";

export async function POST(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let location: string | undefined;
    try {
      const body = (await request.json()) as { location?: string };
      location = body.location;
    } catch {
      location = undefined;
    }

    const result = await runEventbriteSync(location);

    return NextResponse.json(
      {
        msg: result.message,
        location: result.location,
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
      { error: "Failed to sync Eventbrite events" },
      { status: 500 },
    );
  }
}
