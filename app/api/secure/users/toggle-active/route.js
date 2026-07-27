// app/api/secure/users/toggle-active/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import { sendAccountStatusEmail } from "../../../../lib/mailsystem";

export async function POST(request) {
  try {
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

    // Check if user has admin role
    const allowedRoles = ["prefect", "itsecretary", "modarator"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { userId, isActive, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update user status
    user.isActive = isActive;
    
    // If deactivating, clear session token
    if (!isActive) {
      user.sessionToken = null;
    }
    
    await user.save();

    // Send email notification
    const emailResult = await sendAccountStatusEmail({
      fullName: user.fullName,
      email: user.email,
      isActive: isActive,
      reason: reason,
    });

    if (emailResult.success) {
      console.log(`✅ Account status email sent to ${user.email}`);
    } else {
      console.error(`❌ Failed to send account status email to ${user.email}:`, emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: isActive ? "Account activated successfully" : "Account deactivated successfully",
      user: {
        id: user._id,
        isActive: user.isActive
      },
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Toggle active status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update account status",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}