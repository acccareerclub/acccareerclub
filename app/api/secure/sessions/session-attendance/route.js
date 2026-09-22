// app/api/secure/sessions/session-attendance/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

// ============= GET: Fetch eligible users to mark attendance =============
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

    // Fetch all active users EXCLUDING modarator and alumni roles
    const users = await User.find({
      isActive: true,
      role: { $nin: ["modarator", "alumni"] }, // Exclude these roles
    })
      .select("fullName email studentId department role personalInfo.classOrYear personalInfo.profilePicture")
      .sort({ fullName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Get eligible users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// ============= POST: Save session attendance =============
export async function POST(request) {
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

    const body = await request.json();
    const { sessionId, attendeeIds, markAsAttended } = body;

    if (!sessionId || !Array.isArray(attendeeIds)) {
      return NextResponse.json(
        { success: false, message: "Session ID and attendee list required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Update attendees list (overwrite for simplicity)
    session.sessionAttendees = attendeeIds;

    // Optionally update the session status to "completed" if marking attendance
    if (markAsAttended && session.sessionStatus === "upcoming") {
      session.sessionStatus = "completed";
    }

    await session.save();

    return NextResponse.json({
      success: true,
      message: `Attendance saved: ${attendeeIds.length} attendee${attendeeIds.length !== 1 ? "s" : ""}`,
      session: {
        _id: session._id,
        sessionAttendees: session.sessionAttendees,
        sessionStatus: session.sessionStatus,
      },
    });
  } catch (error) {
    console.error("❌ Save attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save attendance" },
      { status: 500 }
    );
  }
}