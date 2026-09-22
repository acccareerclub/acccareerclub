// app/api/secure/sessions/create-session/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sanitizeName = (name) =>
  name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);

const uploadPDFsToCloudinary = async (files, sessionId, folderType) => {
  const uploadedFiles = [];
  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 🛠️ Extract extension and sanitize base name separately
      const extension = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase() || "";
      const baseName = sanitizeName(file.name);
      const finalName = `${baseName}${extension}`;

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `sessions/${sessionId}/${folderType}`,
            resource_type: "raw",
            // ✅ Include the extension in public_id
            public_id: `${folderType}_${Date.now()}_${finalName}`,
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(buffer);
      });

      uploadedFiles.push({
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        fileName: file.name,
      });
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}`);
    }
  }
  return uploadedFiles;
};

const uploadBannerToCloudinary = async (file, sessionId) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sanitizedName = sanitizeName(file.name);

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sessions/${sessionId}/banner`,
        resource_type: "image",
        public_id: `banner_${Date.now()}_${sanitizedName}`,
        transformation: [
          { width: 1200, height: 600, crop: "fill", gravity: "auto" },
          { quality: "auto:best" },
        ],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    uploadStream.end(buffer);
  });

  return {
    publicId: uploadResult.public_id,
    url: uploadResult.secure_url,
  };
};

export async function POST(request) {
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

    const formData = await request.formData();
    const sessionTitle = formData.get("sessionTitle");
    const sessionDescription = formData.get("sessionDescription");
    const sessionType = formData.get("sessionType") || "seminar";
    const meetingType = formData.get("meetingType") || "offline";
    const location = formData.get("location") || "";
    const meetingLink = formData.get("meetingLink") || "";
    const sessionDate = formData.get("sessionDate");
    const sessionDay = formData.get("sessionDay") || "";
    const sessionStatus = formData.get("sessionStatus") || "upcoming";
    const isFeatured = formData.get("isFeatured") === "true";
    const bannerFile = formData.get("sessionThumbnail");
    const isActive = formData.get("isActive") === "true";
    const preResources = formData
      .getAll("preResources")
      .filter((f) => f.size > 0);

    if (!sessionTitle || !sessionDate) {
      return NextResponse.json(
        { success: false, message: "Title and Date are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    const session = new Session({
      sessionTitle,
      sessionDescription,
      sessionType,
      meetingType,
      location,
      meetingLink,
      sessionDate: new Date(sessionDate),
      sessionDay,
      sessionStatus,
      isFeatured,
      createdBy: decoded.userId,
      createdByName: user.fullName,
      createdByRole: decoded.role,
    });

    await session.save();

    try {
      // Upload banner first (if provided)
      if (bannerFile && bannerFile.size > 0) {
        const banner = await uploadBannerToCloudinary(bannerFile, session._id);
        session.sessionThumbnail = banner;
      }

      // Upload pre-resources
      if (preResources.length > 0) {
        const uploaded = await uploadPDFsToCloudinary(
          preResources,
          session._id,
          "pre",
        );
        session.preResources = uploaded;
      }

      await session.save();
    } catch (uploadError) {
      await Session.findByIdAndDelete(session._id);
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session created successfully",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create session" },
      { status: 500 },
    );
  }
}
