// app/api/users/home/sessions/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Session from "@/app/models/Session";

// Cache for 60s on the CDN; revalidate for 5 min
export const revalidate = 60;

// ============= GET: Latest 2 active/upcoming sessions for the homepage =============
export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // Prefer upcoming sessions, sorted soonest first.
    let sessions = await Session.find({
      isActive: true,
      sessionStatus: "upcoming",
      $or: [
        { sessionDate: { $gte: now } },
        { sessionDate: null },
        { sessionDate: { $exists: false } },
      ],
    })
      .select(
        "sessionTitle sessionThumbnail.url sessionDescription sessionType meetingType location meetingLink sessionDate sessionDay sessionStatus isFeatured createdAt",
      )
      .sort({ sessionDate: 1, createdAt: -1 })
      .limit(2)
      .lean();

    // Fallback: top up with the latest active sessions if fewer than 2 upcoming
    if (sessions.length < 2) {
      const excludeIds = sessions.map((s) => s._id);
      const fallback = await Session.find({
        _id: { $nin: excludeIds },
        isActive: true,
      })
        .select(
          "sessionTitle sessionThumbnail.url sessionDescription sessionType meetingType location meetingLink sessionDate sessionDay sessionStatus isFeatured createdAt",
        )
        .sort({ createdAt: -1 })
        .limit(2 - sessions.length)
        .lean();
      sessions = [...sessions, ...fallback];
    }

    return NextResponse.json(
      {
        success: true,
        sessions,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("❌ Home sessions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load sessions" },
      { status: 500 },
    );
  }
}