// app/api/users/sessions/[sessionId]/feedback/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import Session from "../../../../../models/Session";
import { getCurrentUser } from "../../../../../lib/authUtils";

export async function POST(request, { params }) {
  try {
    const token = request.cookies.get("auth_token")?.value;
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

    await connectToDatabase();

    const { sessionId } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 },
      );
    }

    // Must be an attendee
    const isAttendee = session.sessionAttendees?.some(
      (id) => id.toString() === decoded.userId,
    );
    if (!isAttendee) {
      return NextResponse.json(
        { success: false, message: "Only attendees can leave feedback" },
        { status: 403 },
      );
    }

    // Prevent duplicate feedback
    const alreadySubmitted = session.feedback?.some(
      (f) => f.userId?.toString() === decoded.userId,
    );
    if (alreadySubmitted) {
      return NextResponse.json(
        { success: false, message: "You have already submitted feedback" },
        { status: 400 },
      );
    }

    session.feedback.push({
      userId: decoded.userId,
      rating,
      comment: comment?.trim() || "",
    });

    await session.save();

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("❌ Feedback error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}
