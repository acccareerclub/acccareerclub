// app/api/secure/events/delete-event/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import { getCurrentUser } from "../../../../lib/authUtils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    await connectToDatabase();
    const event = await Event.findById(eventId);
    if (!event)
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );

    try {
      await cloudinary.api.delete_resources_by_prefix(`events/${eventId}/`, {
        resource_type: "raw",
      });
      await cloudinary.api.delete_resources_by_prefix(`events/${eventId}/`, {
        resource_type: "image",
      });
      await cloudinary.api.delete_folder(`events/${eventId}`).catch(() => {});
    } catch (cloudErr) {
      console.warn("⚠️ Cloudinary cleanup warning:", cloudErr.message);
    }

    await Event.findByIdAndDelete(eventId);

    return NextResponse.json({
      success: true,
      message: "Event and all associated files deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete event" },
      { status: 500 },
    );
  }
}