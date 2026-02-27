import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getEventById,
  toEventView,
  updateEvent,
} from "@/app/lib/models/Event";
import { canManageEvent, getEventActor } from "@/app/lib/auth/eventAccess";
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
  const id =
    body && typeof body === "object" && typeof body.id === "string"
      ? body.id.trim()
      : "";

  if (!id) {
    return NextResponse.json({ error: "Missing event id" }, { status: 400 });
  }

  const validation = validateEventPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const existing = await getEventById(id, { includeDeleted: true });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (existing.deleted_at) {
      return NextResponse.json(
        { error: "Archived events cannot be edited" },
        { status: 400 },
      );
    }
    if (!canManageEvent(existing.created_by, actor)) {
      return NextResponse.json(
        { error: "Only event owners or admins can edit this event" },
        { status: 403 },
      );
    }

    const updated = await updateEvent(id, validation.data);
    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    revalidateEventPages(updated.id);

    return NextResponse.json(
      { msg: "Event updated", data: toEventView(updated) },
      { status: 200 },
    );
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError.code === "23505") {
      return NextResponse.json(
        { error: "An event with that registration link already exists" },
        { status: 409 },
      );
    }

    console.error("/api/events/update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}
