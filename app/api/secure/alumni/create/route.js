// app/api/secure/alumni/create/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import { sendAlumniWelcomeEmail } from "../../../../lib/mailsystem";

// ==================== GET: Search users (excluding alumni) ====================
export async function GET(request) {
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

    const allowedRoles = [
      "prefect",
      "assistant_prefect",
      "itsecretary",
      "modarator",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const limit = parseInt(searchParams.get("limit")) || 30;

    // Base: exclude alumni, only verified & active
    const query = {
      role: { $ne: "alumni" },
      isVerified: true,
    };

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select(
        "fullName email phone studentId department role personalInfo.profilePicture isVerified isActive",
      )
      .sort({ fullName: 1 })
      .limit(limit)
      .lean();

    // Get unique departments for the filter
    const departments = await User.distinct("department", {
      role: { $ne: "alumni" },
      isVerified: true,
    });

    return NextResponse.json({
      success: true,
      users,
      departments,
    });
  } catch (error) {
    console.error("Search users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search users" },
      { status: 500 },
    );
  }
}

// ==================== POST: Convert user to alumni ====================
export async function POST(request) {
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

    const allowedRoles = [
      "prefect",
      "assistant_prefect",
      "itsecretary",
      "modarator",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { userId, alumniInfo } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (user.role === "alumni") {
      return NextResponse.json(
        { success: false, message: "User is already an alumni" },
        { status: 400 },
      );
    }

    // ✅ Convert to alumni & deactivate account
    user.role = "alumni";
    user.executiveBranch = null;
    user.isActive = false; // 🔒 Deactivate account
    user.sessionToken = null; // Force logout if logged in

    // Save alumni info
    if (!user.alumniInfo) user.alumniInfo = {};
    user.alumniInfo = {
      batch: alumniInfo?.batch?.trim() || "",
      passedYear: alumniInfo?.passedYear?.trim() || "",
      currentJobCompany: alumniInfo?.isUnemployed
        ? ""
        : alumniInfo?.currentJobCompany?.trim() || "",
      currentDesignation: alumniInfo?.isUnemployed
        ? ""
        : alumniInfo?.currentDesignation?.trim() || "",
      isUnemployed: alumniInfo?.isUnemployed || false,
      contactPhone: alumniInfo?.contactPhone?.trim() || user.phone || "",
    };

    await user.save();

    // ==================== SEND ALUMNI WELCOME EMAIL ====================
    let emailSent = false;
    try {
      const emailResult = await sendAlumniWelcomeEmail({
        fullName: user.fullName,
        email: user.email,
        batch: user.alumniInfo.batch,
        passedYear: user.alumniInfo.passedYear,
        currentJobCompany: user.alumniInfo.currentJobCompany,
        currentDesignation: user.alumniInfo.currentDesignation,
        isUnemployed: user.alumniInfo.isUnemployed,
      });

      emailSent = emailResult.success;

      if (emailResult.success) {
        console.log(`✅ Alumni welcome email sent to ${user.email}`);
      } else {
        console.error(
          `❌ Failed to send alumni welcome email to ${user.email}:`,
          emailResult.error,
        );
      }
    } catch (emailError) {
      // Don't fail the request if email fails — just log it
      console.error("❌ Alumni welcome email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: `${user.fullName} has been successfully made an alumni. Their account has been deactivated.`,
      user,
      emailSent,
    });
  } catch (error) {
    console.error("Create alumni error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create alumni" },
      { status: 500 },
    );
  }
}