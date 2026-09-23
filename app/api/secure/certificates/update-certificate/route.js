// app/api/secure/certificates/update-certificate/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

const ALLOWED_SIGNATURE_TYPES = [
  "system_generated",
  "moderator_signed",
  "moderator_and_principal_signed",
  "custom",
];

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

// ==========================================
// Sync achievement entry on the user profile
// Identified by accCareerClubAchievements[].certificate === certificateObjectId
// ==========================================
const syncMemberAchievement = async ({
  userId,
  certificateObjectId,
  position,
  eventName,
  date,
}) => {
  if (!userId || !certificateObjectId) {
    return { ok: false, reason: "missing-input" };
  }

  const setPaths = {};

  if (typeof position === "string") {
    setPaths["accCareerClubAchievements.$[el].position"] =
      position && position.trim() ? position.trim() : "Participant";
  }
  if (typeof eventName === "string" && eventName.trim()) {
    setPaths["accCareerClubAchievements.$[el].eventName"] = eventName.trim();
  }
  if (date instanceof Date || typeof date === "string") {
    const dateStr =
      date instanceof Date
        ? date.toISOString().slice(0, 10)
        : new Date(date).toISOString().slice(0, 10);
    setPaths["accCareerClubAchievements.$[el].date"] = dateStr;
  }

  if (Object.keys(setPaths).length === 0) return { ok: true, changed: false };

  try {
    const res = await User.updateOne(
      { _id: userId },
      { $set: setPaths },
      {
        // ✅ Match by the ObjectId stored in `certificate`
        arrayFilters: [{ "el.certificate": certificateObjectId }],
      },
    );
    return { ok: true, changed: res.modifiedCount > 0 };
  } catch (err) {
    console.error(
      `Failed to sync achievement for user ${userId} / cert ${certificateObjectId}:`,
      err.message,
    );
    return { ok: false, reason: err.message };
  }
};

export async function POST(request) {
  try {
    // ==========================================
    // AUTH
    // ==========================================
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

    // ==========================================
    // PARSE
    // ==========================================
    const body = await request.json();
    const { certificateId, updates } = body;

    if (!certificateId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { success: false, message: "certificateId and updates are required" },
        { status: 400 },
      );
    }

    // ==========================================
    // BUILD SANITIZED UPDATE
    // ==========================================
    const safe = {};

    if (typeof updates.title === "string") {
      if (!updates.title.trim()) {
        return NextResponse.json(
          { success: false, message: "Title cannot be empty" },
          { status: 400 },
        );
      }
      safe.title = updates.title.trim();
    }
    if (typeof updates.description === "string") {
      safe.description = updates.description.trim();
    }
    if (typeof updates.achievementTitle === "string") {
      safe.achievementTitle = updates.achievementTitle.trim();
    }
    if (typeof updates.achievementPosition === "string") {
      const validPositions = [
        "1st",
        "2nd",
        "3rd",
        "champion",
        "runner_up",
        "finalist",
        "honorable_mention",
        "special_mention",
        "participant",
        "",
      ];
      if (!validPositions.includes(updates.achievementPosition)) {
        return NextResponse.json(
          { success: false, message: "Invalid achievement position" },
          { status: 400 },
        );
      }
      safe.achievementPosition = updates.achievementPosition;
    }

    if (typeof updates.certificateType === "string") {
      const validTypes = [
        "participation",
        "achievement",
        "completion",
        "appreciation",
        "recognition",
        "membership",
        "alumni",
        "organizer",
        "speaker",
        "judge",
        "mentor",
        "excellence",
        "custom",
        "special",
      ];
      if (!validTypes.includes(updates.certificateType)) {
        return NextResponse.json(
          { success: false, message: "Invalid certificate type" },
          { status: 400 },
        );
      }
      safe.certificateType = updates.certificateType;
    }

    if (typeof updates.signatureType === "string") {
      if (!ALLOWED_SIGNATURE_TYPES.includes(updates.signatureType)) {
        return NextResponse.json(
          { success: false, message: "Invalid signature type" },
          { status: 400 },
        );
      }
      safe.signatureType = updates.signatureType;
    }

    if (Array.isArray(updates.signatories)) {
      safe.signatories = updates.signatories
        .filter((s) => s && (s.name || s.designation))
        .map((s, i) => ({
          name: String(s.name || "").trim(),
          designation: String(s.designation || "").trim(),
          signatureUrl: String(s.signatureUrl || ""),
          order: typeof s.order === "number" ? s.order : i,
        }));
    }

    if (updates.background && typeof updates.background === "object") {
      safe.background = {
        publicId: String(updates.background.publicId || ""),
        url: String(updates.background.url || ""),
      };
    }

    if (Object.keys(safe).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 },
      );
    }

    // ==========================================
    // UPDATE CERTIFICATE
    // ==========================================
    const updated = await Certificate.findOneAndUpdate(
      { certificateId },
      { $set: safe },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 },
      );
    }

    // ==========================================
    // SYNC ACHIEVEMENT ENTRY ON THE USER PROFILE
    // ==========================================
    let achievementSync = null;

    const recipientUserId = updated.recipient?.userId;
    const isMember = updated.recipient?.isClubMember;

    if (isMember && recipientUserId) {
      const newPositionRaw =
        updated.achievementPosition ||
        updated.achievementTitle ||
        "participant";
      const newPosition = formatPosition(newPositionRaw);

      const newEventName =
        updated.event?.eventName || updated.title || "Custom Certificate";

      const certDate = updated.createdAt || new Date();

      achievementSync = await syncMemberAchievement({
        userId: recipientUserId,
        certificateObjectId: updated._id, // ✅ match by ObjectId
        position: newPosition,
        eventName: newEventName,
        date: certDate,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Certificate updated successfully",
      certificate: updated,
      achievementSync,
    });
  } catch (error) {
    console.error("Update certificate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update certificate" },
      { status: 500 },
    );
  }
}