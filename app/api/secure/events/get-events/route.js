// app/api/secure/events/get-events/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function GET(request) {
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

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const skip = (page - 1) * limit;

    const query = {};
    if (!includeInactive) query.isActive = true;

    if (search) {
      query.eventTitle = { $regex: search, $options: "i" };
    }

    if (status && status !== "all") {
      query.eventStatus = status;
    }

    const [rawEvents, totalCount] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "eventTitle eventThumbnail eventDescription eventType location " +
            "eventDate eventDay eventStatus " +
            "preResources postResources feedback " +
            "preRegistrationRequired preRegistrationDeadline " +
            "externalPreRegistrationAllowed " +
            "preRegistrationUsers " +
            "eventSpeakerAvailability eventSpeakerCredentials " +
            "eventAttendees externalAttendees achievers " +
            "isFeatured isActive createdByName createdAt",
        )
        .populate({
          path: "feedback.userId",
          select: "fullName email studentId department phone role",
        })
        .lean(),
      Event.countDocuments(query),
    ]);

    // ==========================================
    // FLATTEN populated user data into each feedback entry
    // so the client can read simple fields (userFullName, userEmail, etc.)
    // ==========================================
    const events = rawEvents.map((ev) => ({
      ...ev,
      feedback: (ev.feedback || []).map((f) => {
        const u = f.userId; // now an object or null
        return {
          _id: f._id,
          rating: f.rating,
          comment: f.comment || "",
          submittedAt: f.submittedAt,
          // External submitter snapshot
          externalEmail: f.externalEmail || "",
          externalName: f.externalName || "",
          // Reference ID only (string form)
          userId: u?._id ? String(u._id) : null,
          // Flattened member info (for the FeedbackCard UI)
          userFullName: u?.fullName || "",
          userEmail: u?.email || "",
          userStudentId: u?.studentId || "",
          userDepartment: u?.department || "",
          userPhone: u?.phone || "",
          userRole: u?.role || "",
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      count: events.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + events.length < totalCount,
      events,
    });
  } catch (error) {
    console.error("❌ Get events error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 },
    );
  }
}