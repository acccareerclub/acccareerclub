// app/api/secure/events/pre-registration/route.js
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

    // Get event with pre-registered users
    const event = await Event.findById(eventId)
      .select("eventTitle preRegistrationRequired preRegistrationDeadline preRegistrationUsers")
      .lean();

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    // Get all active users (excluding modarator and alumni)
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
    console.error("❌ Get pre-registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

// ============= POST: Save pre-registrations =============
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
    const { eventId, preRegistrationUsers } = body;

    if (!eventId || !Array.isArray(preRegistrationUsers)) {
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

    // Overwrite the pre-registration list
    event.preRegistrationUsers = preRegistrationUsers.map((u) => ({
      userId: u.userId || undefined, // optional for external
      name: u.name || "",
      email: u.email || "",
      institution: u.institution || "", // ✅ include institution
      identificationNo: u.identificationNo || "",
    }));

    await event.save();

    return NextResponse.json({
      success: true,
      message: `Pre-registration saved: ${preRegistrationUsers.length} user(s)`,
      preRegistrationUsers: event.preRegistrationUsers,
    });
  } catch (error) {
    console.error("❌ Save pre-registration error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save pre-registration" },
      { status: 500 },
    );
  }
}