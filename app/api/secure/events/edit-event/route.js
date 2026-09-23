// app/api/secure/events/edit-event/route.js
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

const sanitizeName = (name) =>
  name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);

const uploadPDFsToCloudinary = async (files, eventId, folderType) => {
  const uploadedFiles = [];
  for (const file of files) {
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

const deleteFilesFromCloudinary = async (publicIds, resourceType = "raw") => {
  if (!publicIds || publicIds.length === 0) return;
  await Promise.all(
    publicIds.map(
      (id) =>
        new Promise((res, rej) => {
          cloudinary.uploader.destroy(
            id,
            { resource_type: resourceType },
            (err, result) => (err ? rej(err) : res(result)),
          );
        }),
    ),
  );
};

export async function PUT(request) {
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
    const eventId = formData.get("eventId");
    const event = await Event.findById(eventId);

    if (!event)
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );

    // Update basic fields
    event.eventTitle = formData.get("eventTitle");
    event.eventDescription = formData.get("eventDescription") || "";
    event.eventType = formData.get("eventType");
    event.location = formData.get("location") || "";
    event.eventDate = new Date(formData.get("eventDate"));
    event.eventDay = formData.get("eventDay") || "";
    event.eventStatus = formData.get("eventStatus");
    event.preRegistrationRequired =
      formData.get("preRegistrationRequired") === "true";
    const deadline = formData.get("preRegistrationDeadline");
    event.preRegistrationDeadline =
      event.preRegistrationRequired && deadline ? new Date(deadline) : undefined;
    event.eventSpeakerAvailability =
      formData.get("eventSpeakerAvailability") === "true";
    event.eventSpeakerCredentials = {
      speakerName: formData.get("speakerName") || "",
      speakerDescription: formData.get("speakerDescription") || "",
    };
    event.isFeatured = formData.get("isFeatured") === "true";
    event.isActive = formData.get("isActive") === "true";

    // Handle thumbnail
    const removeThumbnail = formData.get("removeThumbnail") === "true";
    const newThumbnail = formData.get("eventThumbnail");

    if (removeThumbnail && event.eventThumbnail?.publicId) {
      await deleteFilesFromCloudinary(
        [event.eventThumbnail.publicId],
        "image",
      );
      event.eventThumbnail = {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg",
      };
    }

    if (newThumbnail && newThumbnail.size > 0) {
      if (event.eventThumbnail?.publicId) {
        await deleteFilesFromCloudinary(
          [event.eventThumbnail.publicId],
          "image",
        );
      }
      const thumb = await uploadThumbnailToCloudinary(newThumbnail, event._id);
      event.eventThumbnail = thumb;
    }

    // Delete resources
    const preToDelete = JSON.parse(
      formData.get("preResourcesToDelete") || "[]",
    );
    const postToDelete = JSON.parse(
      formData.get("postResourcesToDelete") || "[]",
    );

    if (preToDelete.length > 0) {
      await deleteFilesFromCloudinary(preToDelete, "raw");
      event.preResources = event.preResources.filter(
        (r) => !preToDelete.includes(r.publicId),
      );
    }
    if (postToDelete.length > 0) {
      await deleteFilesFromCloudinary(postToDelete, "raw");
      event.postResources = event.postResources.filter(
        (r) => !postToDelete.includes(r.publicId),
      );
    }

    // Upload new resources
    const newPreFiles = formData
      .getAll("newPreResources")
      .filter((f) => f.size > 0);
    const newPostFiles = formData
      .getAll("newPostResources")
      .filter((f) => f.size > 0);

    if (newPreFiles.length > 0) {
      const uploaded = await uploadPDFsToCloudinary(
        newPreFiles,
        event._id,
        "pre",
      );
      event.preResources.push(...uploaded);
    }
    if (newPostFiles.length > 0) {
      const uploaded = await uploadPDFsToCloudinary(
        newPostFiles,
        event._id,
        "post",
      );
      event.postResources.push(...uploaded);
    }

    // Delete feedback (admin)
    const feedbackToDelete = JSON.parse(
      formData.get("feedbackToDelete") || "[]",
    );
    if (feedbackToDelete.length > 0) {
      event.feedback = event.feedback.filter(
        (f) => !feedbackToDelete.includes(f._id.toString()),
      );
    }

    await event.save();
    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Edit event error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update event" },
      { status: 500 },
    );
  }
}