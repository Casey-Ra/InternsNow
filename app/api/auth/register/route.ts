import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser } from "@/app/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await createUser(username, hashedPassword);

    return NextResponse.json({
      msg: "User registered!",
      user: { id: user.id, username: user.username },
    });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Registration failed", details: err.message },
      { status: 500 }
    );
  }
}