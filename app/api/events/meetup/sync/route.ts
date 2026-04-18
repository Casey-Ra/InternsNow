import { NextResponse } from "next/server";
import {
  runMeetupSync,
  type MeetupSyncRequest,
} from "@/app/lib/integrations/meetupSync";

export async function POST(request: Request) {
  try {
    let body: MeetupSyncRequest = {};

    try {
      body = (await request.json()) as MeetupSyncRequest;
    } catch {
      body = {};
    }

    const result = await runMeetupSync(body);

    return NextResponse.json(
      {
        msg: result.message,
        fetched: result.fetched,
        created: result.created,
        updated: result.updated,
        unchanged: result.unchanged,
        error: result.error,
      },
      { status: result.ok ? 200 : 500 },
    );
  } catch (error) {
    console.error("/api/events/meetup/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Meetup events" },
      { status: 500 },
    );
  }
}
