/*
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const GET: (req: NextRequest) => Promise<NextResponse> = async (
  req: NextRequest,
) => {
  const session = await auth0.getSession();

  return NextResponse.json({
    roles: session?.user?.["https://internsnow.com/claims/roles"] ?? [],
  });
};
*/
