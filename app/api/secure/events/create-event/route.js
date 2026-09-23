// app/api/secure/events/create-event/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
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

const uploadPDFsToCloudinary = async (files, eventId, folderType) => {
  const uploadedFiles = [];
  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const extension = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase() || "";
      const baseName = sanitizeName(file.name);
      const finalName = `${baseName}${extension}`;

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `events/${eventId}/${folderType}`,
            resource_type: "raw",
            public_id: `${folderType}_${Date.now()}_${finalName}`,
          },
          (error, result) => (error ? reject(error) : resolve(result)),
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

const uploadThumbnailToCloudinary = async (file, eventId) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sanitizedName = sanitizeName(file.name);

  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `events/${eventId}/thumbnail`,
        resource_type: "image",
        public_id: `thumb_${Date.now()}_${sanitizedName}`,
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
    const eventTitle = formData.get("eventTitle");
    const eventDescription = formData.get("eventDescription") || "";
    const eventType = formData.get("eventType") || "competition";
    const location = formData.get("location") || "";
    const eventDate = formData.get("eventDate");
    const eventDay = formData.get("eventDay") || "";
    const eventStatus = formData.get("eventStatus") || "upcoming";
    const preRegistrationRequired =
      formData.get("preRegistrationRequired") === "true";
    const preRegistrationDeadline = formData.get("preRegistrationDeadline");
    // ⬅ NEW
    const externalPreRegistrationAllowed =
      formData.get("externalPreRegistrationAllowed") === "true";
    const eventSpeakerAvailability =
      formData.get("eventSpeakerAvailability") === "true";
    const speakerName = formData.get("speakerName") || "";
    const speakerDescription = formData.get("speakerDescription") || "";
    const isFeatured = formData.get("isFeatured") === "true";
    const isActive = formData.get("isActive") === "true";

    const thumbnailFile = formData.get("eventThumbnail");
    const preResources = formData
      .getAll("preResources")
      .filter((f) => f.size > 0);

    if (!eventTitle || !eventDate) {
      return NextResponse.json(
        { success: false, message: "Title and Date are required" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);

    const event = new Event({
      eventTitle,
      eventDescription,
      eventType,
      location,
      eventDate: new Date(eventDate),
      eventDay,
      eventStatus,
      preRegistrationRequired,
      preRegistrationDeadline: preRegistrationRequired
        ? new Date(preRegistrationDeadline)
        : undefined,
      // ⬅ NEW — only meaningful when pre-registration is required
      externalPreRegistrationAllowed: preRegistrationRequired
        ? externalPreRegistrationAllowed
        : false,
      eventSpeakerAvailability,
      eventSpeakerCredentials: {
        speakerName,
        speakerDescription,
      },
      isFeatured,
      isActive,
      createdBy: decoded.userId,
      createdByName: user.fullName,
      createdByRole: decoded.role,
    });

    await event.save();

    try {
      if (thumbnailFile && thumbnailFile.size > 0) {
        const thumbnail = await uploadThumbnailToCloudinary(
          thumbnailFile,
          event._id,
        );
        event.eventThumbnail = thumbnail;
      }

      if (preResources.length > 0) {
        const uploaded = await uploadPDFsToCloudinary(
          preResources,
          event._id,
          "pre",
        );
        event.preResources = uploaded;
      }

      await event.save();
    } catch (uploadError) {
      await Event.findByIdAndDelete(event._id);
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create event" },
      { status: 500 },
    );
  }
}