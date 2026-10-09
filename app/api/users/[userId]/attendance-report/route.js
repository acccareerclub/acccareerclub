// app/api/users/[userId]/attendance-report/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Event from "@/app/models/Event";
import Session from "@/app/models/Session";
import User from "@/app/models/User";
import { getCurrentUser } from "@/app/lib/authUtils";

// ============= GET: user attendance summary =============
export async function GET(request, { params }) {
  try {
    // ---------- Auth ----------
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || (!decoded.userId && !decoded.id)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const authUserId = decoded.userId || decoded.id;
    const ADMIN_ROLES = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    const isOwn = String(authUserId) === String(userId);
    const isAdmin = ADMIN_ROLES.includes(decoded.role);

    if (!isOwn && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const userObjectId = userId;

    // ---------- Fetch the user (need their joining date) ----------
    const targetUser = await User.findById(userId)
      .select("createdAt")
      .lean();

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const joinedAt = targetUser.createdAt
      ? new Date(targetUser.createdAt)
      : null;

    // ---------- Fetch all active events + sessions ----------
    // Include createdAt so we can compare against the user's joining date.
    const [events, sessions] = await Promise.all([
      Event.find({ isActive: true })
        .select("_id eventAttendees createdAt eventDate")
        .lean(),
      Session.find({ isActive: true })
        .select("_id sessionAttendees createdAt sessionDate")
        .lean(),
    ]);

    // ---------- Helper: decide if an occasion should count ----------
    // For a given occasion (event/session):
    //   attended        = user is in the attendees array
    //   occurredBefore  = occasion happened before the user joined
    //
    // Rules:
    //   - If occurredBefore and attended    -> counts (attended + total)
    //   - If occurredBefore and !attended   -> skip entirely
    //   - If !occurredBefore                -> counts in total,
    //                                          and in attended if attended
    //
    // We use `eventDate`/`sessionDate` when present, otherwise fall back
    // to the document's `createdAt` (both schemas have timestamps: true).
    const evaluateOccasion = (occasion, attendeesField) => {
      const attended = (occasion[attendeesField] || []).some(
        (id) => String(id) === String(userObjectId),
      );

      if (!joinedAt) {
        // No joining date on record — count it the normal way.
        return { count: true, attended };
      }

      const occurredAt = occasion.eventDate || occasion.sessionDate
        ? new Date(occasion.eventDate || occasion.sessionDate)
        : occasion.createdAt
          ? new Date(occasion.createdAt)
          : null;

      // If we can't determine when it happened, count it normally.
      if (!occurredAt) {
        return { count: true, attended };
      }

      const occurredBefore = occurredAt < joinedAt;

      if (occurredBefore && !attended) {
        // Held before the user joined and they didn't attend → ignore.
        return { count: false, attended: false };
      }

      // Either it happened after joining, or it happened before but they
      // attended anyway → count it.
      return { count: true, attended };
    };

    // ---------- Events ----------
    let eventsAttended = 0;
    let eventsTotal = 0;

    for (const ev of events) {
      const { count, attended } = evaluateOccasion(ev, "eventAttendees");
      if (count) {
        eventsTotal += 1;
        if (attended) eventsAttended += 1;
      }
    }

    // ---------- Sessions ----------
    let sessionsAttended = 0;
    let sessionsTotal = 0;

    for (const sess of sessions) {
      const { count, attended } = evaluateOccasion(
        sess,
        "sessionAttendees",
      );
      if (count) {
        sessionsTotal += 1;
        if (attended) sessionsAttended += 1;
      }
    }

    // ---------- Rates ----------
    const totalOccasions = eventsTotal + sessionsTotal;
    const totalAttended = eventsAttended + sessionsAttended;

    const eventsRate =
      eventsTotal > 0 ? Math.round((eventsAttended / eventsTotal) * 100) : 0;

    const sessionsRate =
      sessionsTotal > 0
        ? Math.round((sessionsAttended / sessionsTotal) * 100)
        : 0;

    const overallRate =
      totalOccasions > 0
        ? Math.round((totalAttended / totalOccasions) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      report: {
        joinedAt,
        events: {
          attended: eventsAttended,
          total: eventsTotal,
          rate: eventsRate,
        },
        sessions: {
          attended: sessionsAttended,
          total: sessionsTotal,
          rate: sessionsRate,
        },
        overall: {
          attended: totalAttended,
          total: totalOccasions,
          rate: overallRate,
        },
      },
    });
  } catch (error) {
    console.error("❌ User attendance report error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load attendance report" },
      { status: 500 },
    );
  }
}