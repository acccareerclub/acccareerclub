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

    const [events, totalCount] = await Promise.all([
      Event.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "eventTitle eventThumbnail eventDescription eventType location eventDate eventDay eventStatus preResources postResources feedback preRegistrationRequired preRegistrationDeadline preRegistrationUsers eventSpeakerAvailability eventSpeakerCredentials eventAttendees achievers isFeatured isActive createdByName createdAt",
        )
        .lean(),
      Event.countDocuments(query),
    ]);

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