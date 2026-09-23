// app/api/secure/certificates/event-attendees/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Get internal attendees with full user data
    const internalAttendees = [];
    if (event.eventAttendees && event.eventAttendees.length > 0) {
      const users = await User.find(
        { _id: { $in: event.eventAttendees } },
        "fullName email studentId department phone role"
      ).lean();

      for (const user of users) {
        internalAttendees.push({
          type: "internal",
          userId: user._id,
          name: user.fullName,
          email: user.email,
          studentId: user.studentId,
          department: user.department,
          phone: user.phone,
          role: user.role,
        });
      }
    }

    // Get external attendees
    const externalAttendees = (event.externalAttendees || []).map((ext) => ({
      type: "external",
      userId: null,
      name: ext.name,
      email: ext.email,
      studentId: ext.identificationNo,
      institution: ext.institution,
      identificationNo: ext.identificationNo,
    }));

    // Get achievers
    const achievers = (event.achievers || []).map((ach) => ({
      type: ach.userId ? "internal" : "external",
      userId: ach.userId,
      name: ach.name,
      email: ach.email,
      studentId: ach.identificationNo,
      institution: ach.institution,
      position: ach.position,
    }));

    // Get pre-registration users
    const preRegistrationUsers = [];
    if (event.preRegistrationUsers && event.preRegistrationUsers.length > 0) {
      for (const preReg of event.preRegistrationUsers) {
        let userData = null;
        if (preReg.userId) {
          userData = await User.findById(
            preReg.userId,
            "fullName email studentId department phone role"
          ).lean();
        }

        preRegistrationUsers.push({
          type: preReg.userId ? "internal" : "external",
          userId: preReg.userId || null,
          name: preReg.name,
          email: preReg.email,
          studentId: preReg.identificationNo,
          institution: preReg.institution,
          identificationNo: preReg.identificationNo,
          // Include full user data if available
          fullName: userData?.fullName || preReg.name,
          department: userData?.department || "",
          phone: userData?.phone || "",
          role: userData?.role || "external",
        });
      }
    }

    return NextResponse.json({
      success: true,
      event: {
        _id: event._id,
        eventTitle: event.eventTitle,
        eventType: event.eventType,
        eventDate: event.eventDate,
        location: event.location,
      },
      attendees: {
        internal: internalAttendees,
        external: externalAttendees,
        achievers,
        preRegistrationUsers,
        total:
          internalAttendees.length +
          externalAttendees.length +
          preRegistrationUsers.length,
      },
    });
  } catch (error) {
    console.error("Get event attendees error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get event attendees" },
      { status: 500 }
    );
  }
}