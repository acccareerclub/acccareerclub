// app/api/secure/sessions/edit-session/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import { sendFeedbackRequestEmail } from "../../../../lib/mailsystem";
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
    const sessionId = formData.get("sessionId");
    const session = await Session.findById(sessionId);

    if (!session)
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 },
      );

    // ✅ Capture the OLD status BEFORE updating
    const previousStatus = session.sessionStatus;

    // Update basic fields
    session.sessionTitle = formData.get("sessionTitle");
    session.sessionDescription = formData.get("sessionDescription");
    session.sessionType = formData.get("sessionType");
    session.meetingType = formData.get("meetingType");
    session.location = formData.get("location");
    session.meetingLink = formData.get("meetingLink");
    session.sessionDate = new Date(formData.get("sessionDate"));
    session.sessionDay = formData.get("sessionDay");
    session.sessionStatus = formData.get("sessionStatus");
    session.isFeatured = formData.get("isFeatured") === "true";
    session.isActive = formData.get("isActive") === "true";

    // ✅ Detect the transition: previousStatus !== "completed" AND newStatus === "completed"
    const shouldSendFeedbackEmails =
      previousStatus !== "completed" && session.sessionStatus === "completed";

    // Handle Banner
    const removeBanner = formData.get("removeBanner") === "true";
    const newBannerFile = formData.get("sessionThumbnail");

    if (removeBanner && session.sessionThumbnail?.publicId) {
      await deleteFilesFromCloudinary(
        [session.sessionThumbnail.publicId],
        "image",
      );
      session.sessionThumbnail = {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg",
      };
    }

    if (newBannerFile && newBannerFile.size > 0) {
      // Delete old banner if it wasn't the default
      if (session.sessionThumbnail?.publicId) {
        await deleteFilesFromCloudinary(
          [session.sessionThumbnail.publicId],
          "image",
        );
      }
      const banner = await uploadBannerToCloudinary(newBannerFile, session._id);
      session.sessionThumbnail = banner;
    }

    // Handle Deleting Pre/Post Resources
    const preToDelete = JSON.parse(
      formData.get("preResourcesToDelete") || "[]",
    );
    const postToDelete = JSON.parse(
      formData.get("postResourcesToDelete") || "[]",
    );

    if (preToDelete.length > 0) {
      await deleteFilesFromCloudinary(preToDelete, "raw");
      session.preResources = session.preResources.filter(
        (r) => !preToDelete.includes(r.publicId),
      );
    }
    if (postToDelete.length > 0) {
      await deleteFilesFromCloudinary(postToDelete, "raw");
      session.postResources = session.postResources.filter(
        (r) => !postToDelete.includes(r.publicId),
      );
    }

    // Handle New Uploads
    const newPreFiles = formData
      .getAll("newPreResources")
      .filter((f) => f.size > 0);
    const newPostFiles = formData
      .getAll("newPostResources")
      .filter((f) => f.size > 0);

    if (newPreFiles.length > 0) {
      const uploaded = await uploadPDFsToCloudinary(
        newPreFiles,
        session._id,
        "pre",
      );
      session.preResources.push(...uploaded);
    }
    if (newPostFiles.length > 0) {
      const uploaded = await uploadPDFsToCloudinary(
        newPostFiles,
        session._id,
        "post",
      );
      session.postResources.push(...uploaded);
    }

    // Handle Deleting Feedback
    const feedbackToDelete = JSON.parse(
      formData.get("feedbackToDelete") || "[]",
    );
    if (feedbackToDelete.length > 0) {
      session.feedback = session.feedback.filter(
        (f) => !feedbackToDelete.includes(f._id.toString()),
      );
    }

    // ✅ Save the session first
    await session.save();

    // ✅ Send feedback request emails ONLY when transitioning TO completed
    let feedbackEmailsSent = 0;
    let feedbackEmailsFailed = 0;

    if (shouldSendFeedbackEmails && session.sessionAttendees?.length > 0) {
      try {
        // Fetch all attendees with valid emails
        const attendees = await User.find({
          _id: { $in: session.sessionAttendees },
          email: { $exists: true, $ne: "" },
        })
          .select("fullName email")
          .lean();

        console.log(
          `📧 Status transitioned: "${previousStatus}" → "completed". Sending feedback emails to ${attendees.length} attendee(s)...`
        );

        // Send all emails in parallel (partial failures don't break others)
        const emailResults = await Promise.allSettled(
          attendees.map((user) =>
            sendFeedbackRequestEmail({
              fullName: user.fullName,
              email: user.email,
              sessionTitle: session.sessionTitle,
              sessionId: session._id.toString(),
              sessionDate: session.sessionDate,
            }),
          ),
        );

        feedbackEmailsSent = emailResults.filter(
          (r) => r.status === "fulfilled" && r.value?.success,
        ).length;
        feedbackEmailsFailed = attendees.length - feedbackEmailsSent;

        console.log(
          `✅ Feedback emails: ${feedbackEmailsSent} sent, ${feedbackEmailsFailed} failed`,
        );
      } catch (emailErr) {
        // Don't block the response if emails fail
        console.error(
          "❌ Failed to send feedback emails:",
          emailErr.message,
        );
      }
    } else if (shouldSendFeedbackEmails && !session.sessionAttendees?.length) {
      console.log(
        `ℹ️ Session transitioned to completed but no attendees to notify.`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session updated successfully",
      session,
      feedbackEmails: shouldSendFeedbackEmails
        ? { sent: feedbackEmailsSent, failed: feedbackEmailsFailed }
        : null,
    });
  } catch (error) {
    console.error("Edit session error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update session" },
      { status: 500 },
    );
  }
}