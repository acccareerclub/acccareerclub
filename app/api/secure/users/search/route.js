// app/api/secure/users/search/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { getCurrentUser } from "@/app/lib/authUtils"; 

export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    const allowedRoles = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 50);

    if (q.length < 2) {
      return NextResponse.json({ success: true, users: [] });
    }

    // Escape regex special chars
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");

    const users = await User.find(
      {
        $or: [
          { fullName: rx },
          { email: rx },
          { studentId: rx },
          { phone: rx },
        ],
        // Exclude already-alumni accounts if you want only active members
        role: { $ne: "alumni" },
      },
      "fullName email studentId department phone role"
    )
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}