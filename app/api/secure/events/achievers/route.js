// app/api/secure/events/achievers/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

// ============= GET: Fetch event + attendees + externals =============
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
        "eventTitle eventType eventAttendees externalAttendees achievers",
      )
      .populate({
        path: "eventAttendees",
        select: "fullName email studentId department personalInfo.profilePicture",
      })
      .lean();

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("❌ Get achievers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

// ============= POST: Save achievers =============
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
    const { eventId, achievers } = body;

    if (!eventId || !Array.isArray(achievers)) {
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

    // Overwrite achievers with sanitized data
    event.achievers = achievers.map((a) => ({
      userId: a.userId || null,
      position: (a.position || "").trim(),
      name: (a.name || "").trim(),
      email: (a.email || "").trim(),
      institution: (a.institution || "").trim(),
      identificationNo: (a.identificationNo || "").trim(),
    }));

    await event.save();

    return NextResponse.json({
      success: true,
      message: `Achievers saved: ${event.achievers.length}`,
      achievers: event.achievers,
    });
  } catch (error) {
    console.error("❌ Save achievers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save achievers" },
      { status: 500 },
    );
  }
}