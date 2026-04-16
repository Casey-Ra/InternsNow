import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prunePastEvents } from "@/app/lib/integrations/eventPrune";

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
    const result = await prunePastEvents();
    revalidateEventPages();

    return NextResponse.json(
      {
        msg: "Past event prune completed",
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("/api/cron/events-prune error:", error);
    return NextResponse.json(
      { error: "Failed to prune past events" },
      { status: 500 },
    );
  }
}
