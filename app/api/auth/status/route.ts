import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const isEdu = request.cookies.get("is_edu")?.value;
  const loggedIn = typeof isEdu !== "undefined";

  return NextResponse.json(
    { loggedIn, isEdu: isEdu === "true" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
