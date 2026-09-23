// app/api/users/events/[eventId]/pre-register/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import Event from "../../../../../models/Event";
import User from "../../../../../models/User";
import { getCurrentUser } from "../../../../../lib/authUtils";

export async function POST(request, { params }) {
  try {
    const { eventId } = await params;
    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    if (!event.preRegistrationRequired) {
      return NextResponse.json(
        {
          success: false,
          message: "Pre-registration is not required for this event.",
        },
        { status: 400 },
      );
    }

    // Deadline check
    if (
      event.preRegistrationDeadline &&
      new Date() > new Date(event.preRegistrationDeadline)
    ) {
      return NextResponse.json(
        { success: false, message: "Pre-registration has closed." },
        { status: 400 },
      );
    }

    // ---------- Identify viewer (optional) ----------
    const token = request.cookies.get("auth_token")?.value;
    let viewer = null;
    if (token) {
      try {
        const decoded = getCurrentUser(token);
        if (decoded?.userId) {
          viewer = await User.findById(
            decoded.userId,
            "fullName email studentId department",
          ).lean();
        }
      } catch {
        viewer = null;
      }
    }

    // ==========================================
    // MEMBER PATH
    // ==========================================
    if (viewer) {
      const already = (event.preRegistrationUsers || []).some(
        (p) => p.userId && String(p.userId) === String(viewer._id),
      );
      if (already) {
        return NextResponse.json({
          success: true,
          alreadyRegistered: true,
          message: "You are already registered for this event.",
        });
      }

      event.preRegistrationUsers.push({
        userId: viewer._id,
        name: viewer.fullName,
        email: viewer.email,
        institution: "Adamjee Cantonment College",
        identificationNo: viewer.studentId || "",
      });

      await event.save();

      return NextResponse.json({
        success: true,
        kind: "member",
        message: "You're registered! See you at the event.",
      });
    }

    // ==========================================
    // EXTERNAL PATH (anonymous)
    // ==========================================
    if (!event.externalPreRegistrationAllowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            "External pre-registration is not allowed for this event. Please log in if you are a club member.",
        },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, institution, identificationNo } = body || {};

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Your name is required." },
        { status: 400 },
      );
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email is required." },
        { status: 400 },
      );
    }

    // Prevent duplicates by email
    const emailLower = email.toLowerCase().trim();
    const dup = (event.preRegistrationUsers || []).some(
      (p) => (p.email || "").toLowerCase() === emailLower,
    );
    if (dup) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This email is already registered for the event.",
        },
        { status: 409 },
      );
    }

    event.preRegistrationUsers.push({
      userId: null,
      name: name.trim(),
      email: emailLower,
      institution: (institution || "").trim(),
      identificationNo: (identificationNo || "").trim(),
    });

    await event.save();

    // ==========================================
    // VERIFICATION (basic — we return a token; the client
    // can use it to confirm via the /verify endpoint later)
    // ==========================================
    const verifyToken = Buffer.from(
      `${event._id}:${emailLower}:${Date.now()}`,
    ).toString("base64url");

    return NextResponse.json({
      success: true,
      kind: "external",
      message:
        "Pre-registration received. Please check your email to verify.",
      verifyToken,
      verifyUrl: `/events/${event._id}/verify?token=${verifyToken}`,
    });
  } catch (error) {
    console.error("Pre-register event error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to register" },
      { status: 500 },
    );
  }
}