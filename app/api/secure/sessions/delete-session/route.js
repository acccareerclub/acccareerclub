// app/api/secure/sessions/delete-session/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";
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
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });

    const decoded = getCurrentUser(token);
    const allowedRoles = ["prefect", "itsecretary", "modarator", "assistant_prefect"];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    await connectToDatabase();
    const session = await Session.findById(sessionId);
    if (!session) return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });

    // ✅ DELETE THE ENTIRE FOLDER: sessions/{sessionId}/
    // This wipes the banner, all pre-resources and post-resources at once.
    try {
      await cloudinary.api.delete_resources_by_prefix(`sessions/${sessionId}/`, {
        resource_type: "raw",
      });
      await cloudinary.api.delete_resources_by_prefix(`sessions/${sessionId}/`, {
        resource_type: "image",
      });
      // Then delete the now-empty folder itself
      await cloudinary.api.delete_folder(`sessions/${sessionId}`).catch(() => {});
    } catch (cloudErr) {
      console.warn("⚠️ Cloudinary cleanup warning:", cloudErr.message);
      // Don't block the DB deletion if Cloudinary fails
    }

    await Session.findByIdAndDelete(sessionId);

    return NextResponse.json({
      success: true,
      message: "Session and all associated files deleted successfully",
    });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete session" }, { status: 500 });
  }
}