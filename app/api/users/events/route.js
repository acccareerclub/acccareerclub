// app/api/users/events/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Event from "../../../models/Event";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
      50,
    );
    const skip = Math.max(parseInt(searchParams.get("skip") || "0", 10), 0);
    const search = (searchParams.get("search") || "").trim();
    const type = (searchParams.get("type") || "").trim();
    const status = (searchParams.get("status") || "").trim(); // upcoming | completed | cancelled

    // ==========================================
    // BUILD QUERY
    // ==========================================
    const query = { isActive: true };

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      query.$or = [
        { eventTitle: rx },
        { eventDescription: rx },
        { location: rx },
      ];
    }

    if (type) query.eventType = type;
    if (status) query.eventStatus = status;

    // ==========================================
    // SORT — upcoming first, then past
    // We compute two "buckets" and merge them.
    // ==========================================
    const now = new Date();

    // Upcoming: date >= now, sort ascending (soonest first)
    const upcomingPromise = Event.find({
      ...query,
      eventDate: { $gte: now },
    })
      .sort({ eventDate: 1 })
      .lean();

    // Past: date < now, sort descending (most recent first)
    const pastPromise = Event.find({
      ...query,
      eventDate: { $lt: now },
    })
      .sort({ eventDate: -1 })
      .lean();

    const [upcoming, past] = await Promise.all([
      upcomingPromise,
      pastPromise,
    ]);

    // Merge — upcoming first, then past
    const merged = [...upcoming, ...past];
    const total = merged.length;

    // Paginate in memory (efficient enough for typical club-sized datasets;
    // switch to $unionWith in Mongo if you need DB-level pagination)
    const slice = merged.slice(skip, skip + limit);

    // ==========================================
    // SANITIZE — strip internal ObjectIds & private fields
    // ==========================================
    const sanitized = slice.map((ev) => ({
      _id: ev._id,
      eventTitle: ev.eventTitle,
      eventThumbnail: ev.eventThumbnail || null,
      eventDescription: ev.eventDescription || "",
      eventType: ev.eventType || "other",
      location: ev.location || "",
      eventDate: ev.eventDate || null,
      eventDay: ev.eventDay || "",
      eventStatus: ev.eventStatus || "upcoming",
      isFeatured: !!ev.isFeatured,
      speakerAvailable: !!ev.eventSpeakerAvailability,
      speakerName: ev.eventSpeakerCredentials?.speakerName || "",
      speakerDescription: ev.eventSpeakerCredentials?.speakerDescription || "",
      // Public counts (no names/emails)
      attendeeCount:
        (ev.eventAttendees?.length || 0) +
        (ev.externalAttendees?.length || 0),
      achieverCount: ev.achievers?.length || 0,
      hasPreResources: (ev.preResources?.length || 0) > 0,
      hasPostResources: (ev.postResources?.length || 0) > 0,
      createdAt: ev.createdAt,
    }));

    const hasMore = skip + sanitized.length < total;

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      total,
      skip,
      limit,
      hasMore,
      events: sanitized,
    });
  } catch (error) {
    console.error("Public events fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 },
    );
  }
}