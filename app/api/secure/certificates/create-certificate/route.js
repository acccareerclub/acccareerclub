// app/api/secure/certificates/create-certificate/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";
import Event from "../../../../models/Event";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------- CONSTANTS ----------
const CLUB_NAME = "ACC Career Club";

// ---------- HELPERS ----------
const ROLE_LABELS = {
  prefect: "Prefect",
  assistant_prefect: "Assistant Prefect",
  itsecretary: "IT Secretary",
  modarator: "Moderator",
  moderator: "Moderator",
  president: "President",
  vice_president: "Vice President",
  general_secretary: "General Secretary",
  joint_secretary: "Joint Secretary",
  treasurer: "Treasurer",
  member: "Member",
};

const formatRole = (role) => {
  if (!role) return "";
  return (
    ROLE_LABELS[role] ||
    role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const formatPosition = (pos) => {
  if (!pos) return "";
  const map = {
    "1st": "1st Place",
    "2nd": "2nd Place",
    "3rd": "3rd Place",
    champion: "Champion",
    runner_up: "Runner Up",
    finalist: "Finalist",
    honorable_mention: "Honorable Mention",
    special_mention: "Special Mention",
    participant: "Participant",
  };
  return map[pos] || pos;
};

const generateCertificateId = async () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${dateStr}-${rand}`;
    const exists = await Certificate.exists({ certificateId: candidate });
    if (!exists) return candidate;
  }

  const fallback = `${dateStr}-${Date.now().toString().slice(-4)}`;
  let finalId = fallback;
  let counter = 1;
  while (await Certificate.exists({ certificateId: finalId })) {
    finalId = `${dateStr}-${String(
      (parseInt(fallback.slice(-4), 10) + counter) % 10000,
    ).padStart(4, "0")}`;
    counter++;
  }
  return finalId;
};

const generateBatchId = () =>
  `BATCH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

const uploadSignatureToCloudinary = async (file, certId) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const sanitizedName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 30);
  const uploadResult = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `certificates/signatures`,
        resource_type: "image",
        public_id: `sig_${certId}_${Date.now()}_${sanitizedName}`,
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    uploadStream.end(buffer);
  });
  return { publicId: uploadResult.public_id, url: uploadResult.secure_url };
};

const buildRecipientFromUser = (user) => ({
  userId: user._id,
  isClubMember: true,
  fullName: user.fullName,
  studentId: user.studentId || "",
  email: user.email || "",
  phone: user.phone || "",
  department: user.department || "",
  roleAtIssue: user.role || "member",
  externalOrganization: "",
  externalId: "",
});

const buildRecipientFromExternal = (external) => ({
  userId: null,
  isClubMember: false,
  fullName: external.name,
  studentId: external.identificationNo || "",
  email: external.email || "",
  phone: "",
  department: "",
  roleAtIssue: "external",
  externalOrganization: external.institution || "",
  externalId: external.identificationNo || "",
});

const buildRecipientFromAchiever = (achiever) => ({
  userId: achiever.userId || null,
  isClubMember: !!achiever.userId,
  fullName: achiever.name,
  studentId: achiever.identificationNo || "",
  email: achiever.email || "",
  phone: "",
  department: "",
  roleAtIssue: achiever.userId ? "member" : "external",
  externalOrganization: achiever.institution || "",
  externalId: achiever.identificationNo || "",
});

const processSignatories = async (signatories, certId, signatureFiles) => {
  const processed = [];
  for (let i = 0; i < signatories.length; i++) {
    const sig = signatories[i];
    let signatureUrl = sig.signatureUrl || "";
    if (signatureFiles && signatureFiles[i] && signatureFiles[i].size > 0) {
      const uploadResult = await uploadSignatureToCloudinary(
        signatureFiles[i],
        certId,
      );
      signatureUrl = uploadResult.url;
    }
    processed.push({
      name: sig.name,
      designation: sig.designation,
      signatureUrl,
      order: sig.order || i,
    });
  }
  return processed;
};

// ==========================================
// Push achievement into the member's profile
// Stores `certificate` as an ObjectId reference to the Certificate doc
// ==========================================
const pushMemberAchievement = async ({
  userId,
  position,
  eventName,
  certificateObjectId,
  date,
}) => {
  if (!userId) return { ok: false, reason: "no-user-id" };
  if (!certificateObjectId) return { ok: false, reason: "no-certificate-id" };

  const dateStr =
    date instanceof Date
      ? date.toISOString().slice(0, 10)
      : new Date(date || Date.now()).toISOString().slice(0, 10);

  const finalPosition =
    position && position.trim().length > 0 ? position.trim() : "Participant";

  const entry = {
    organizer: CLUB_NAME,
    position: finalPosition,
    date: dateStr,
    eventName: eventName || "Custom Certificate",
    certificate: certificateObjectId, // ✅ ObjectId ref
  };

  try {
    await User.updateOne(
      { _id: userId },
      { $push: { accCareerClubAchievements: entry } },
    );
    return { ok: true };
  } catch (err) {
    console.error(
      `Failed to push accCareerClubAchievements for user ${userId}:`,
      err.message,
    );
    return { ok: false, reason: err.message };
  }
};

// ==========================================
// POST
// ==========================================
export async function POST(request) {
  try {
    // 1. AUTH
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

    await connectToDatabase();
    const issuer = await User.findById(decoded.userId);
    if (!issuer) {
      return NextResponse.json(
        { success: false, message: "Issuer not found" },
        { status: 404 },
      );
    }

    // 2. PARSE
    const formData = await request.formData();
    const mode = formData.get("mode") || "individual";
    const eventId = formData.get("eventId");
    const certificateType = formData.get("certificateType") || "participation";
    const title = formData.get("title") || "Certificate of Participation";
    const description = formData.get("description") || "";
    const achievementTitle = formData.get("achievementTitle") || "";
    const achievementPosition = formData.get("achievementPosition") || "";
    const signatureType = formData.get("signatureType") || "system_generated";
    const signatoriesJson = formData.get("signatories");
    const signatories = signatoriesJson ? JSON.parse(signatoriesJson) : [];
    const backgroundUrl = formData.get("backgroundUrl") || "";
    const templateUsed = formData.get("templateUsed") || "default";
    const recipientsJson = formData.get("recipients");
    const recipients = recipientsJson ? JSON.parse(recipientsJson) : [];
    const recipientUserId = formData.get("recipientUserId");
    const recipientName = formData.get("recipientName");
    const recipientEmail = formData.get("recipientEmail");
    const recipientInstitution = formData.get("recipientInstitution");
    const recipientIdentificationNo = formData.get("recipientIdentificationNo");
    const signatureFiles = formData.getAll("signatureFiles");

    // 3. VALIDATE
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Certificate title is required" },
        { status: 400 },
      );
    }

    let event = null;
    if (eventId) {
      event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json(
          { success: false, message: "Event not found" },
          { status: 404 },
        );
      }
    }

    // 4. BUILD RECIPIENT LIST
    let recipientList = [];

    if (mode === "individual") {
      if (recipientUserId) {
        const user = await User.findById(recipientUserId);
        if (!user) {
          return NextResponse.json(
            { success: false, message: "Recipient user not found" },
            { status: 404 },
          );
        }
        recipientList.push(buildRecipientFromUser(user));
      } else if (recipientName) {
        recipientList.push({
          userId: null,
          isClubMember: false,
          fullName: recipientName,
          studentId: recipientIdentificationNo || "",
          email: recipientEmail || "",
          phone: "",
          department: "",
          roleAtIssue: "external",
          externalOrganization: recipientInstitution || "",
          externalId: recipientIdentificationNo || "",
        });
      } else {
        return NextResponse.json(
          { success: false, message: "Recipient information is required" },
          { status: 400 },
        );
      }
    } else if (mode === "selective") {
      if (!recipients || recipients.length === 0) {
        return NextResponse.json(
          { success: false, message: "No recipients selected" },
          { status: 400 },
        );
      }
      for (const r of recipients) {
        if (r.userId) {
          const user = await User.findById(r.userId);
          if (user) {
            recipientList.push({
              ...buildRecipientFromUser(user),
              fullName: r.fullName || user.fullName,
              achievementPosition: r.achievementPosition || "",
              achievementTitle: r.achievementTitle || "",
            });
          }
        } else {
          recipientList.push({
            userId: null,
            isClubMember: false,
            fullName: r.name || r.fullName,
            studentId: r.identificationNo || "",
            email: r.email || "",
            phone: "",
            department: "",
            roleAtIssue: "external",
            externalOrganization: r.institution || "",
            externalId: r.identificationNo || "",
          });
        }
      }
    } else if (mode === "custom-batch") {
      if (!recipients || recipients.length === 0) {
        return NextResponse.json(
          { success: false, message: "No recipients selected" },
          { status: 400 },
        );
      }
      for (const r of recipients) {
        if (r.userId) {
          const user = await User.findById(r.userId);
          if (user) {
            recipientList.push(buildRecipientFromUser(user));
          }
        }
      }
      if (recipientList.length === 0) {
        return NextResponse.json(
          { success: false, message: "No valid users found" },
          { status: 400 },
        );
      }
    } else if (mode === "bulk") {
      if (!event) {
        return NextResponse.json(
          { success: false, message: "Event is required for bulk generation" },
          { status: 400 },
        );
      }
      if (event.eventAttendees?.length > 0) {
        const users = await User.find({ _id: { $in: event.eventAttendees } });
        for (const user of users)
          recipientList.push(buildRecipientFromUser(user));
      }
      if (event.externalAttendees?.length > 0) {
        for (const external of event.externalAttendees) {
          recipientList.push(buildRecipientFromExternal(external));
        }
      }
      if (recipientList.length === 0) {
        return NextResponse.json(
          { success: false, message: "No attendees found for this event" },
          { status: 400 },
        );
      }
    } else if (mode === "achievers") {
      if (!event) {
        return NextResponse.json(
          {
            success: false,
            message: "Event is required for achiever certificates",
          },
          { status: 400 },
        );
      }
      if (!event.achievers || event.achievers.length === 0) {
        return NextResponse.json(
          { success: false, message: "No achievers found for this event" },
          { status: 400 },
        );
      }
      for (const achiever of event.achievers) {
        recipientList.push(buildRecipientFromAchiever(achiever));
      }
    }

    if (recipientList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No recipients to generate certificates for",
        },
        { status: 400 },
      );
    }

    // 5. GENERATE
    const isBulk = recipientList.length > 1;
    const batchId = isBulk ? generateBatchId() : null;
    const createdCertificates = [];
    const errors = [];
    const achievementPushResults = { ok: 0, failed: 0 };

    const issuerDesignation =
      formatRole(issuer.executiveBranch) || formatRole(issuer.role) || "";

    for (const recipient of recipientList) {
      try {
        const certificateId = await generateCertificateId();

        let processedSignatories = [];
        if (signatureType === "custom" && signatories.length > 0) {
          processedSignatories = await processSignatories(
            signatories,
            certificateId,
            signatureFiles,
          );
        }

        // Resolve the "event name" stored on the achievement entry
        let achievementEventName = "";
        if (event) {
          achievementEventName = event.eventTitle || "";
        } else {
          achievementEventName = title || "Custom Certificate";
        }

        // Resolve the "position" stored on the achievement entry
        const rawPosition =
          recipient.achievementPosition ||
          achievementPosition ||
          recipient.achievementTitle ||
          achievementTitle ||
          "participant";
        const finalPosition = formatPosition(rawPosition);

        const certificateData = {
          certificateId,
          certificateType,
          title,
          description,
          achievementTitle: recipient.achievementTitle || achievementTitle,
          achievementPosition:
            recipient.achievementPosition || achievementPosition,
          recipient,
          issuedBy: {
            userId: issuer._id,
            fullName: issuer.fullName,
            role: issuer.role || "",
            designation: issuerDesignation,
          },
          signatureType,
          signatories: processedSignatories,
          background: {
            publicId: "",
            url:
              backgroundUrl ||
              "https://res.cloudinary.com/ffuatrrt/image/upload/v1790155935/certificate_back_1_phhpje.jpg",
          },
          templateUsed,
          batchId,
          generationMethod: isBulk ? "bulk" : mode,
        };

        if (event) {
          certificateData.event = {
            eventId: event._id,
            eventName: event.eventTitle,
            eventType: event.eventType,
            eventDate: event.eventDate,
            eventLocation: event.location,
          };
        }

        const certificate = new Certificate(certificateData);
        await certificate.save();
        createdCertificates.push(certificate);

        // ✅ Push achievement to member's profile, storing the Certificate ObjectId
        if (recipient.isClubMember && recipient.userId) {
          const result = await pushMemberAchievement({
            userId: recipient.userId,
            position: finalPosition,
            eventName: achievementEventName,
            certificateObjectId: certificate._id, // ← ObjectId, not the string ID
            date: certificate.createdAt || new Date(),
          });
          if (result.ok) achievementPushResults.ok++;
          else achievementPushResults.failed++;
        }
      } catch (err) {
        console.error(
          `Error creating certificate for ${recipient.fullName}:`,
          err,
        );
        errors.push({ recipient: recipient.fullName, error: err.message });
      }
    }

    if (createdCertificates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create any certificates",
          errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: isBulk
        ? `${createdCertificates.length} certificates created successfully`
        : "Certificate created successfully",
      batchId,
      count: createdCertificates.length,
      certificates: createdCertificates,
      achievementPush: achievementPushResults,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Create certificate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create certificate" },
      { status: 500 },
    );
  }
}