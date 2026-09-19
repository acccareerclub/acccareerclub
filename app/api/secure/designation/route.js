// app/api/secure/designation/route.js

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import DynamicRole from "../../../models/DynamicRole";
import { getCurrentUser } from "../../../lib/authUtils";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Fetch designated members — include profile picture
    const designatedUsers = await User.find({ role: { $ne: "member" } })
      .select(
        "fullName email studentId role executiveBranch isActive personalInfo.profilePicture",
      )
      .lean();

    // Fetch ONLY active regular members for the dropdown
    const regularMembers = await User.find({ role: "member", isActive: true })
      .select(
        "fullName email studentId role isActive personalInfo.profilePicture",
      )
      .lean();

    const dynamicRoles = await DynamicRole.find().lean();

    return NextResponse.json({
      success: true,
      designatedUsers,
      regularMembers,
      dynamicRoles,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");
    const decoded = getCurrentUser(token);

    if (
      !decoded ||
      !["prefect", "assistant_prefect", "itsecretary"].includes(decoded.role)
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();
    const { userId, role, executiveBranch } = await request.json();

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    user.role = role;
    user.executiveBranch = role === "executive_member" ? executiveBranch : null;

    await user.save();
    return NextResponse.json({ success: true, message: "Designation updated" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update designation" },
      { status: 500 },
    );
  }
}
