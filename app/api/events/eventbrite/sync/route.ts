import { NextResponse } from "next/server";
import {
  runEventbriteGrabberSync,
  type EventbriteSyncRequest,
} from "@/app/lib/integrations/eventbriteGrabberSync";

export async function POST(request: Request) {
  try {
    let body: EventbriteSyncRequest = {};
    try {
      body = (await request.json()) as EventbriteSyncRequest;
    } catch {
      body = {};
    }

    const result = await runEventbriteGrabberSync(body);

    return NextResponse.json(
      {
        msg: result.message,
        source: result.source,
        fetched: result.fetched,
        created: result.created,
        updated: result.updated,
        unchanged: result.unchanged,
        attemptedQueries: result.attemptedQueries,
        failedQueries: result.failedQueries,
        totalQueries: result.totalQueries,
        chunkIndex: result.chunkIndex,
        chunkCount: result.chunkCount,
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
