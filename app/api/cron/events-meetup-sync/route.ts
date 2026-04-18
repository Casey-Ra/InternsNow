import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runMeetupSync } from "@/app/lib/integrations/meetupSync";

function revalidateEventPages() {
  try {
    revalidatePath("/events");
    revalidatePath("/student/events");
    revalidatePath("/events/manage");
  } catch (error) {
    console.warn("Event revalidation failed:", error);
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runMeetupSync();
    revalidateEventPages();

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
    console.error("/api/cron/events-meetup-sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Meetup events" },
      { status: 500 },
    );
  }
}
