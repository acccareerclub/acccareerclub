// app/api/secure/sessions/get-sessions/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function GET(request) {
  try {
    // 1. Verify Authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    // 2. Verify Authorization
    const allowedRoles = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to view sessions",
        },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // 3. Parse Query Parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const skip = (page - 1) * limit;

    // 4. Build Query
    const query = {};
    // By default, only show active sessions
    if (!includeInactive) {
      query.isActive = true;
    }

    if (search) {
      query.sessionTitle = { $regex: search, $options: "i" };
    }

    if (status && status !== "all") {
      query.sessionStatus = status;
    }

    // 5. Fetch Sessions with pagination
    const [sessions, totalCount] = await Promise.all([
      Session.find(query)
        .sort({ createdAt: -1 }) // Latest created first
        .skip(skip)
        .limit(limit)
        .select(
          "sessionTitle sessionThumbnail sessionDescription sessionType meetingType location meetingLink sessionDate sessionDay sessionStatus preResources postResources feedback sessionAttendees isFeatured isActive createdByName createdAt",
        )
        .lean(),
      Session.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      count: sessions.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + sessions.length < totalCount,
      sessions,
    });
  } catch (error) {
    console.error("❌ Get sessions error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sessions",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
