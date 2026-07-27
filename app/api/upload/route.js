// app/api/upload/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getCurrentUser } from "../../lib/authUtils";
import { connectToDatabase } from "../../lib/mongodb";
import User from "../../models/User";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Verify authentication
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file");
    const userId = formData.get("userId");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `profile_pictures/${userId}`,
          public_id: `profile_${userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: "limit" },
            { quality: "auto:best" },
          ],
          format: "jpg",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // Update user with new profile picture URL
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Initialize personalInfo if it doesn't exist
    if (!user.personalInfo) {
      user.personalInfo = {};
    }

    // Store the profile picture URL
    user.personalInfo.profilePicture = uploadResult.secure_url;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile picture uploaded successfully",
      imageUrl: uploadResult.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Delete profile picture
export async function DELETE(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Remove profile picture from user
    if (user.personalInfo) {
      user.personalInfo.profilePicture = null;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    console.error("Delete profile picture error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete profile picture",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}