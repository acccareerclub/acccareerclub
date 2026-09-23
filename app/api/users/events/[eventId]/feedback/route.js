// app/api/users/events/[eventId]/feedback/route.js
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

    if (event.eventStatus !== "completed") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Feedback opens only after the event is marked as completed.",
        },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { rating, comment, verifiedEmail } = body || {};

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5." },
        { status: 400 },
      );
    }

    // ==========================================
    // Identify submitter
    // ==========================================
    const token = request.cookies.get("auth_token")?.value;
    let viewer = null;
    if (token) {
      try {
        const decoded = getCurrentUser(token);
        if (decoded?.userId) {
          viewer = await User.findById(
            decoded.userId,
            "fullName email",
          ).lean();
        }
      } catch {
        viewer = null;
      }
    }

    // ==========================================
    // MEMBER PATH — atomic push, one per user
    // ==========================================
    if (viewer) {
      const updated = await Event.findOneAndUpdate(
        {
          _id: eventId,
          "feedback.userId": { $ne: viewer._id },
        },
        {
          $push: {
            feedback: {
              userId: viewer._id,
              externalEmail: "",
              externalName: "",
              rating: numericRating,
              comment: (comment || "").trim(),
              submittedAt: new Date(),
            },
          },
        },
        { new: true },
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "You have already submitted feedback." },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        kind: "member",
        message: "Feedback submitted. Thank you!",
      });
    }

    // ==========================================
    // EXTERNAL PATH — must be an actual ATTENDEE
    // ==========================================
    const emailLower = (verifiedEmail || "").toLowerCase().trim();
    if (!emailLower || !/^\S+@\S+\.\S+$/.test(emailLower)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your email first. Only attendees with the email you attended with can leave feedback.",
        },
        { status: 400 },
      );
    }

    // Match the attendee record with normalized comparison.
    const attendeeRecord = (event.externalAttendees || []).find(
      (a) => (a.email || "").trim().toLowerCase() === emailLower,
    );

    if (!attendeeRecord) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This email is not on the attendee list for this event. Only attendees who were present can leave feedback.",
        },
        { status: 403 },
      );
    }

    const snapshotName = (attendeeRecord.name || "").trim();

    // Atomic push — prevents duplicate submissions from races.
    const updated = await Event.findOneAndUpdate(
      {
        _id: eventId,
        "feedback.externalEmail": { $ne: emailLower },
      },
      {
        $push: {
          feedback: {
            userId: null,
            externalEmail: emailLower,
            externalName: snapshotName,
            rating: numericRating,
            comment: (comment || "").trim(),
            submittedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted feedback for this event.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      kind: "external",
      message: "Feedback submitted. Thank you!",
    });
  } catch (error) {
    console.error("Submit event feedback error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}