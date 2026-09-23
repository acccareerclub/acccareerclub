// app/api/secure/events/[eventId]/feedback/[feedbackId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import Event from "../../../../../../models/Event";
import { getCurrentUser } from "../../../../../../lib/authUtils";

export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
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
        { status: 403 },
      );
    }

    const { eventId, feedbackId } = await params;
    if (!eventId || !feedbackId) {
      return NextResponse.json(
        { success: false, message: "Missing IDs" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const updated = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { feedback: { _id: feedbackId } } },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    console.error("Delete feedback error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete feedback" },
      { status: 500 },
    );
  }
}