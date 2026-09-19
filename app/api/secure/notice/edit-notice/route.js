// app/api/secure/notice/edit-notice/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";
import { getCurrentUser } from "../../../../lib/authUtils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const uploadImagesToCloudinary = async (files, noticeId) => {
  const uploadedImages = [];
  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `notices/${noticeId}`,
            public_id: `notice_${noticeId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            transformation: [{ width: 1200, crop: "limit" }, { quality: "auto:best" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      uploadedImages.push({
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
  return uploadedImages;
};

export async function PUT(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const allowedRoles = ["prefect", "itsecretary", "modarator", "assistant_prefect"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to edit notices" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const noticeId = formData.get("noticeId");
    const title = formData.get("title");
    const content = formData.get("content");
    const category = formData.get("category") || "general";
    const priority = formData.get("priority") || "medium";
    const imagesToDelete = JSON.parse(formData.get("imagesToDelete") || "[]");
    const newImages = formData.getAll("newImages").filter(file => file.size > 0);

    if (!noticeId || !title || !content) {
      return NextResponse.json(
        { success: false, message: "Notice ID, title, and content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return NextResponse.json({ success: false, message: "Notice not found" }, { status: 404 });
    }

    if (notice.createdBy.toString() !== decoded.userId && decoded.role !== "modarator") {
      return NextResponse.json(
        { success: false, message: "You can only edit your own notices" },
        { status: 403 }
      );
    }

    // Delete removed images from Cloudinary
    if (imagesToDelete.length > 0) {
      await deleteImagesFromCloudinary(imagesToDelete);
      notice.images = notice.images.filter(img => !imagesToDelete.includes(img.publicId));
    }

    // Upload new images
    if (newImages.length > 0) {
      const uploadedImages = await uploadImagesToCloudinary(newImages, noticeId);
      notice.images = [...notice.images, ...uploadedImages];
    }

    // Update fields
    notice.title = title;
    notice.content = content;
    notice.category = category;
    notice.priority = priority;
    notice.updatedAt = new Date();

    await notice.save();

    return NextResponse.json({
      success: true,
      message: "Notice updated successfully",
      notice,
    });

  } catch (error) {
    console.error("❌ Edit notice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notice",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}