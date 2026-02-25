import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createEvent, toEventView } from "@/app/lib/models/Event";
import { getEventActor } from "@/app/lib/auth/eventAccess";
import { validateEventPayload } from "@/app/lib/utils/eventValidation";

function revalidateEventPages(eventId?: string) {
  try {
    revalidatePath("/events");
    revalidatePath("/student/events");
    if (eventId) {
      revalidatePath(`/student/events/${eventId}`);
    }
  } catch (error) {
    console.warn("Event revalidation failed:", error);
  }
}

export async function POST(request: NextRequest) {
  const actor = await getEventActor();

  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validation = validateEventPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const created = await createEvent(validation.data, {
      sub: actor.sub,
      email: actor.email,
    });

    revalidateEventPages(created.id);

    return NextResponse.json(
      {
        msg: "Event created",
        data: toEventView(created),
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError.code === "23505") {
      return NextResponse.json(
        { error: "An event with that registration link already exists" },
        { status: 409 },
      );
    }

    console.error("/api/events/create error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
