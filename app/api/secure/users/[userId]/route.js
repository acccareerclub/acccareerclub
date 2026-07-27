// app/api/secure/users/[userId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function PUT(request, { params }) {
  try {
    const { userId } = await params;

    // Verify authentication
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const allowedRoles = ["prefect", "itsecretary", "modarator"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { fullName, phone, role, department } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (department) user.department = department;

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}