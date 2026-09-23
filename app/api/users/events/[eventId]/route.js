// app/api/users/events/[eventId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

// ---- Optional auth (doesn't throw if no token) ----
const getOptionalUser = async (request) => {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) return null;
    const decoded = getCurrentUser(token);
    if (!decoded?.userId) return null;
    await connectToDatabase();
    return (
      (await User.findById(
        decoded.userId,
        "fullName email studentId department role",
      ).lean()) || null
    );
  } catch {
    return null;
  }
};

const maskName = (fullName) => {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const word = parts[0];
    if (word.length <= 3) return word;
    return `${word.slice(0, 3)}${word.charAt(3).toUpperCase()}.`;
  }
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
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

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { eventId } = await params;
    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID required" },
        { status: 400 },
      );
    }

    const event = await Event.findById(eventId).lean();
    if (!event || !event.isActive) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 },
      );
    }

    // ==========================================
    // Viewer identity
    // ==========================================
    const viewer = await getOptionalUser(request);
    const isAuthenticated = !!viewer;

    const { searchParams } = new URL(request.url);
    const verifiedEmailParam = (
      searchParams.get("verifiedEmail") ||
      request.headers.get("x-verify-email") ||
      ""
    )
      .toLowerCase()
      .trim();

    const isCompleted = event.eventStatus === "completed";

    // ==========================================
    // Viewer-scoped flags
    // ==========================================
    let isPreRegisteredMember = false;
    if (viewer) {
      isPreRegisteredMember = (event.preRegistrationUsers || []).some(
        (p) => p.userId && String(p.userId) === String(viewer._id),
      );
    }

    let hasSubmittedFeedback = false;
    // Object: { email, name, institution } | null
    let externalFeedbackIdentity = null;

    if (viewer) {
      hasSubmittedFeedback = (event.feedback || []).some(
        (f) => String(f.userId) === String(viewer._id),
      );
    } else if (verifiedEmailParam) {
      // Only external ATTENDEES (people who were actually present) may leave feedback.
      // Pre-registrations do NOT grant feedback rights.
      const attendeeRecord = (event.externalAttendees || []).find(
        (a) => (a.email || "").trim().toLowerCase() === verifiedEmailParam,
      );

      if (attendeeRecord) {
        externalFeedbackIdentity = {
          email: (attendeeRecord.email || "").trim().toLowerCase(),
          name: (attendeeRecord.name || "").trim(),
          institution: (attendeeRecord.institution || "").trim(),
        };

        // Has this specific external email already submitted?
        hasSubmittedFeedback = (event.feedback || []).some(
          (f) =>
            !f.userId &&
            f.externalEmail &&
            f.externalEmail.trim().toLowerCase() === verifiedEmailParam,
        );
      }
    }

    // ==========================================
    // Feedback (masked names, no email leak)
    // ==========================================
    const feedbackUserIds = [
      ...new Set(
        (event.feedback || [])
          .map((f) => f.userId)
          .filter(Boolean)
          .map((id) => String(id)),
      ),
    ];

    let userMap = new Map();
    if (feedbackUserIds.length > 0) {
      const users = await User.find(
        { _id: { $in: feedbackUserIds } },
        "fullName",
      ).lean();
      userMap = new Map(users.map((u) => [String(u._id), u.fullName]));
    }

    const publicFeedback = (event.feedback || [])
      .slice()
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .map((f) => {
        let displayName = "Anonymous";
        if (f.userId) {
          const name = userMap.get(String(f.userId));
          if (name && name.trim()) {
            displayName = maskName(name);
          }
        } else if (f.externalName && f.externalName.trim()) {
          displayName = maskName(f.externalName);
        } else if (f.externalEmail && f.externalEmail.trim()) {
          const prefix = f.externalEmail.split("@")[0] || "Guest";
          displayName = maskName(prefix);
        }
        return {
          _id: f._id,
          rating: f.rating,
          comment: f.comment || "",
          submittedAt: f.submittedAt,
          displayName,
          isExternal: !f.userId,
        };
      });

    // ==========================================
    // Achievers (public, only for completed events)
    // ==========================================
    const publicAchievers = isCompleted
      ? (event.achievers || []).map((a) => ({
          name: a.name,
          position: a.position || "",
          positionLabel: formatPosition(a.position),
          isExternal: !a.userId,
          institution: a.institution || "",
        }))
      : [];

    // ==========================================
    // Safe event shape
    // ==========================================
    const safeEvent = {
      _id: event._id,
      eventTitle: event.eventTitle,
      eventThumbnail: event.eventThumbnail || null,
      eventDescription: event.eventDescription || "",
      eventType: event.eventType,
      location: event.location || "",
      eventDate: event.eventDate || null,
      eventDay: event.eventDay || "",
      eventStatus: event.eventStatus || "upcoming",
      isFeatured: !!event.isFeatured,

      preResources: event.preResources || [],
      postResources: event.postResources || [],

      eventSpeakerAvailability: !!event.eventSpeakerAvailability,
      eventSpeakerCredentials: {
        speakerName: event.eventSpeakerCredentials?.speakerName || "",
        speakerDescription:
          event.eventSpeakerCredentials?.speakerDescription || "",
      },

      preRegistrationRequired: !!event.preRegistrationRequired,
      preRegistrationDeadline: event.preRegistrationDeadline || null,
      externalPreRegistrationAllowed: !!event.externalPreRegistrationAllowed,

      attendeeCount:
        (event.eventAttendees?.length || 0) +
        (event.externalAttendees?.length || 0),
      preRegistrationCount: event.preRegistrationUsers?.length || 0,
      achieverCount: event.achievers?.length || 0,

      feedback: publicFeedback,
      achievers: publicAchievers,

      // Viewer-scoped
      isAuthenticated,
      isPreRegisteredMember,
      hasSubmittedFeedback,
      // Now an object: { email, name, institution } | null
      externalFeedbackIdentity,
    };

    return NextResponse.json({ success: true, event: safeEvent });
  } catch (error) {
    console.error("Get single event error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event" },
      { status: 500 },
    );
  }
}