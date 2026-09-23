// app/api/secure/events/attendance/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

// ============= GET: Fetch event + eligible users =============
export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

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

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID required" },
        { status: 400 },
      );
    }

    const event = await Event.findById(eventId)
      .select(
        "eventTitle preRegistrationRequired preRegistrationUsers eventAttendees externalAttendees",
      )
      .populate({
        path: "eventAttendees",
        select: "fullName studentId department personalInfo.profilePicture",
      })
      .lean();

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    const users = await User.find({
      isActive: true,
      role: { $nin: ["modarator", "alumni"] },
    })
      .select(
        "fullName email studentId department role personalInfo.profilePicture",
      )
      .sort({ fullName: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      event,
      users,
    });
  } catch (error) {
    console.error("❌ Get attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

// ============= POST: Save attendees (internal + external) =============
export async function POST(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );

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

    const body = await request.json();
    const { eventId, attendeeIds, externalAttendees } = body;

    if (!eventId || !Array.isArray(attendeeIds)) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event)
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );

    // Save internal (member) attendees
    event.eventAttendees = attendeeIds;

    // Save external attendees (with sanitization)
    event.externalAttendees = (externalAttendees || []).map((e) => ({
      name: (e.name || "").trim(),
      email: (e.email || "").trim(),
      institution: (e.institution || "").trim(),
      identificationNo: (e.identificationNo || "").trim(),
      addedAt: e.addedAt ? new Date(e.addedAt) : new Date(),
    }));

    await event.save();

    const totalCount =
      event.eventAttendees.length + event.externalAttendees.length;

    return NextResponse.json({
      success: true,
      message: `Attendance saved: ${event.eventAttendees.length} member(s) + ${event.externalAttendees.length} external = ${totalCount} total`,
      eventAttendees: event.eventAttendees,
      externalAttendees: event.externalAttendees,
    });
  } catch (error) {
    console.error("❌ Save attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save attendance" },
      { status: 500 },
    );
  }
}