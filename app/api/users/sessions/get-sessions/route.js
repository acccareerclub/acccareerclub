// app/api/users/sessions/get-sessions/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Session from "../../../../models/Session";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Only show active sessions to public users
    const query = { isActive: true };

    const [sessions, totalCount] = await Promise.all([
      Session.find(query)
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limit)
        .select(
          "sessionTitle sessionThumbnail sessionDescription sessionType meetingType location meetingLink sessionDate sessionDay sessionStatus preResources postResources isFeatured createdByName createdAt"
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
    console.error("❌ Get public sessions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}