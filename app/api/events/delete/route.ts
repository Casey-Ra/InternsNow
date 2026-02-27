import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getEventById,
  softDeleteEvent,
  toEventView,
} from "@/app/lib/models/Event";
import { canManageEvent, getEventActor } from "@/app/lib/auth/eventAccess";

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

  try {
    const existing = await getEventById(id, { includeDeleted: true });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (existing.deleted_at) {
      return NextResponse.json(
        { error: "Event is already archived" },
        { status: 400 },
      );
    }
    if (!canManageEvent(existing.created_by, actor)) {
      return NextResponse.json(
        { error: "Only event owners or admins can remove this event" },
        { status: 403 },
      );
    }

    const deleted = await softDeleteEvent(id, actor.sub);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    revalidateEventPages(deleted.id);

    return NextResponse.json(
      { msg: "Event archived", data: toEventView(deleted) },
      { status: 200 },
    );
  } catch (error) {
    console.error("/api/events/delete error:", error);
    return NextResponse.json(
      { error: "Failed to archive event" },
      { status: 500 },
    );
  }
}
