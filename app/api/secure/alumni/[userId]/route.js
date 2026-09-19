// app/api/secure/alumni/[userId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function GET(request, { params }) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const { userId } = await params;

    await connectToDatabase();

    const user = await User.findById(userId)
      .select("-password -__v")
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Get alumni detail error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch alumni detail" },
      { status: 500 },
    );
  }
}