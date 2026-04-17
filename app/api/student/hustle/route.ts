import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
  buildHustleReferenceKey,
  getHustleReferenceStatus,
  getWeeklyHustleSummary,
  recordActiveSiteInterval,
  recordDailyLogin,
  recordStudentHustleActivity,
  type HustleReferenceType,
} from "@/app/lib/models/StudentHustleActivity";
import type { HustleActivityType } from "@/app/lib/utils/hustleScore";

type SessionUser = {
  sub: string;
};

const VALID_ACTIVITY_TYPES = new Set<HustleActivityType>([
  "active_site_interval",
  "job_application",
  "event_rsvp",
  "event_attended",
  "event_missed",
]);

const VALID_REFERENCE_TYPES = new Set<HustleReferenceType>([
  "event",
  "opportunity",
  "session",
]);

function isValidActivityType(value: unknown): value is HustleActivityType {
  return typeof value === "string" && VALID_ACTIVITY_TYPES.has(value as HustleActivityType);
}

function isValidReferenceType(value: unknown): value is HustleReferenceType {
  return (
    typeof value === "string" &&
    VALID_REFERENCE_TYPES.has(value as HustleReferenceType)
  );
}

function trimText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    await recordDailyLogin(user.sub);
    const summary = await getWeeklyHustleSummary(user.sub);

    const { searchParams } = new URL(request.url);
    const referenceType = searchParams.get("referenceType");
    const sourceLabel = searchParams.get("sourceLabel");

    if (
      !isValidReferenceType(referenceType) ||
      !sourceLabel ||
      !sourceLabel.trim()
    ) {
      return NextResponse.json(summary);
    }

    const referenceKey = buildHustleReferenceKey({
      referenceType,
      referenceId: searchParams.get("referenceId"),
      sourceLabel,
      sourceDate: searchParams.get("sourceDate"),
      sourceTime: searchParams.get("sourceTime"),
    });

    const referenceStatus = await getHustleReferenceStatus(user.sub, referenceKey);

    return NextResponse.json({
      ...summary,
      referenceStatus,
    });
  } catch (error) {
    console.error("GET /api/student/hustle error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hustle score" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    const activityType = body.activityType;
    const referenceType = body.referenceType;
    const sourceLabel = trimText(body.sourceLabel);

    if (!isValidActivityType(activityType) || !isValidReferenceType(referenceType)) {
      return NextResponse.json(
        { error: "Invalid activity type" },
        { status: 400 },
      );
    }

    if (!sourceLabel) {
      return NextResponse.json(
        { error: "Missing source label" },
        { status: 400 },
      );
    }

    const user = session.user as SessionUser;
    if (activityType === "active_site_interval") {
      const result = await recordActiveSiteInterval(user.sub);

      return NextResponse.json({
        created: result.created,
        activity: result.activity,
      });
    }

    const result = await recordStudentHustleActivity({
      auth0Sub: user.sub,
      activityType,
      referenceType,
      referenceId: trimText(body.referenceId) || null,
      sourceLabel,
      sourceUrl: trimText(body.sourceUrl) || null,
      sourceDate: trimText(body.sourceDate) || null,
      sourceTime: trimText(body.sourceTime) || null,
      sourceLocation: trimText(body.sourceLocation) || null,
    });

    return NextResponse.json({
      created: result.created,
      activity: result.activity,
    });
  } catch (error) {
    console.error("POST /api/student/hustle error:", error);
    return NextResponse.json(
      { error: "Failed to record hustle activity" },
      { status: 500 },
    );
  }
}
