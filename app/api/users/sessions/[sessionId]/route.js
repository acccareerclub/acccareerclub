// app/api/users/sessions/[sessionId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";
import User from "../../../../models/User"; // 👈 Need this for populate
import { getCurrentUser } from "../../../../lib/authUtils";

// ✅ Mask a full name: firstHalf(firstName) + ******** + secondHalf(lastName)
function maskName(fullName) {
  if (!fullName || typeof fullName !== "string") return "Anonymous";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "Anonymous";

  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";

  const firstHalf = firstName.slice(0, Math.ceil(firstName.length / 2));

  let secondHalf = "";
  if (lastName) {
    // Take the second half of the last name
    const startIdx = Math.floor(lastName.length / 2);
    secondHalf = lastName.slice(startIdx);
  }

  return `${firstHalf}********${secondHalf}`;
}

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { sessionId } = await params;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch and POPULATE the feedback userId with the user's full name
    const session = await Session.findOne({ _id: sessionId, isActive: true })
      .select(
        "sessionTitle sessionThumbnail sessionDescription sessionType meetingType location meetingLink sessionDate sessionDay sessionStatus preResources postResources feedback sessionAttendees isFeatured createdByName createdByRole createdAt"
      )
      .populate({
        path: "feedback.userId",
        select: "fullName", // only need the name
      })
      .lean();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check authentication
    const token = request.cookies.get("auth_token")?.value;
    let decoded = null;
    let isAuthenticated = false;
    let isAttendee = false;

    if (token) {
      decoded = getCurrentUser(token);
      if (decoded) {
        isAuthenticated = true;
        isAttendee = session.sessionAttendees?.some(
          (id) => id.toString() === decoded.userId
        );
      }
    }

    const postResourcesLocked = !isAuthenticated;
    const postResources = postResourcesLocked ? [] : session.postResources || [];

    const canAddFeedback = isAuthenticated && isAttendee;

    const hasSubmittedFeedback =
      isAuthenticated &&
      session.feedback?.some((f) => {
        const fid = f.userId?._id?.toString() || f.userId?.toString();
        return fid === decoded.userId;
      });

    // ✅ Map feedback to include the masked display name
    const sanitizedFeedback = (session.feedback || []).map((f) => {
      const populatedUser = f.userId;
      const rawName =
        populatedUser && typeof populatedUser === "object"
          ? populatedUser.fullName
          : null;
      return {
        _id: f._id,
        rating: f.rating,
        comment: f.comment,
        submittedAt: f.submittedAt,
        displayName: maskName(rawName), // e.g., "Jo********oe"
      };
    });

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        feedback: sanitizedFeedback, // override with masked version
        postResources,
        postResourcesLocked,
        canAddFeedback,
        hasSubmittedFeedback,
        isAuthenticated,
        isAttendee,
      },
    });
  } catch (error) {
    console.error("❌ Get single session error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch session" },
      { status: 500 }
    );
  }
}