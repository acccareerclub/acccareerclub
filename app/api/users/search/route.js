// app/api/secure/users/search/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { getCurrentUser } from "../../../lib/authUtils";

export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
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
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    if (!q) {
      return NextResponse.json({ success: true, users: [] });
    }

    await connectToDatabase();

    const query = {
      $or: [
        { studentId: q.toUpperCase() },
        { membershipId: q },
        { email: q.toLowerCase() },
        { fullName: { $regex: q, $options: "i" } },
      ],
    };
    if (/^[a-f\d]{24}$/i.test(q)) query.$or.push({ _id: q });

    const users = await User.find(query)
      .select(
        "fullName email phone studentId membershipId department role personalInfo.profilePicture",
      )
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}