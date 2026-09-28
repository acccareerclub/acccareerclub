// app/api/users/home/events/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Event from "@/app/models/Event";

// Cache for 60s on the CDN; revalidate for 5 min
export const revalidate = 60;

// ============= GET: Latest 2 active/upcoming events for the homepage =============
export async function GET() {
  try {
    await connectToDatabase();

    // Prefer upcoming events, sorted by soonest first.
    // If none are upcoming, fall back to the most recently created active events.
    const now = new Date();

    let events = await Event.find({
      isActive: true,
      eventStatus: "upcoming",
      // Show events whose date hasn't passed, OR events with no date set
      $or: [
        { eventDate: { $gte: now } },
        { eventDate: null },
        { eventDate: { $exists: false } },
      ],
    })
      .select(
        "eventTitle eventThumbnail.url eventDescription eventType location eventDate eventDay eventStatus preRegistrationRequired isFeatured createdAt",
      )
      .sort({ eventDate: 1, createdAt: -1 })
      .limit(2)
      .lean();

    // Fallback: if fewer than 2 upcoming, top up with latest active events
    if (events.length < 2) {
      const excludeIds = events.map((e) => e._id);
      const fallback = await Event.find({
        _id: { $nin: excludeIds },
        isActive: true,
      })
        .select(
          "eventTitle eventThumbnail.url eventDescription eventType location eventDate eventDay eventStatus preRegistrationRequired isFeatured createdAt",
        )
        .sort({ createdAt: -1 })
        .limit(2 - events.length)
        .lean();
      events = [...events, ...fallback];
    }

    return NextResponse.json(
      {
        success: true,
        events,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("❌ Home events error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load events" },
      { status: 500 },
    );
  }
}