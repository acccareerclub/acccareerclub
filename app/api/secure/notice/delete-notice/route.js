// app/api/secure/notice/delete-notice/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";
import { getCurrentUser } from "../../../../lib/authUtils";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to delete images from Cloudinary
const deleteImagesFromCloudinary = async (imagePublicIds) => {
  if (!imagePublicIds || imagePublicIds.length === 0) return;

  const deletionPromises = imagePublicIds.map((publicId) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  });

  await Promise.all(deletionPromises);
};

export async function DELETE(request) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user has permission
    const allowedRoles = ["prefect", "itsecretary", "modarator"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to delete notices" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const noticeId = searchParams.get("noticeId");

    if (!noticeId) {
      return NextResponse.json(
        { success: false, message: "Notice ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the notice
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return NextResponse.json(
        { success: false, message: "Notice not found" },
        { status: 404 }
      );
    }

    // Check if user created this notice (or is admin)
    if (notice.createdBy.toString() !== decoded.userId && decoded.role !== "modarator") {
      return NextResponse.json(
        { success: false, message: "You can only delete your own notices" },
        { status: 403 }
      );
    }

    // Delete images from Cloudinary
    if (notice.images && notice.images.length > 0) {
      const publicIds = notice.images.map(img => img.publicId);
      await deleteImagesFromCloudinary(publicIds);
    }

    // Delete the notice from database
    await Notice.findByIdAndDelete(noticeId);

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });

  } catch (error) {
    console.error("❌ Delete notice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete notice",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}