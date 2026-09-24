// app/api/users/home-page/featured/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import Session from "../../../../models/Session";

// Cache for 60s — featured items change rarely.
export const revalidate = 60;

const EVENT_FIELDS = [
  "eventTitle",
  "eventThumbnail",
  "eventDescription",
  "eventType",
  "location",
  "eventDate",
  "eventDay",
  "eventStatus",
  "isFeatured",
  "createdAt",
].join(" ");

const SESSION_FIELDS = [
  "sessionTitle",
  "sessionThumbnail",
  "sessionDescription",
  "sessionType",
  "meetingType",
  "location",
  "meetingLink",
  "sessionDate",
  "sessionDay",
  "sessionStatus",
  "isFeatured",
  "createdAt",
].join(" ");

// Strip HTML so the card can render a short plain-text summary
const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (str, n = 140) =>
  str.length > n ? `${str.slice(0, n).trimEnd()}…` : str;

export async function GET() {
  try {
    await connectToDatabase();

    const [eventsRaw, sessionsRaw] = await Promise.all([
      Event.find({ isFeatured: true, isActive: true })
        .select(EVENT_FIELDS)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Session.find({ isFeatured: true, isActive: true })
        .select(SESSION_FIELDS)
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    const events = eventsRaw.map((e) => ({
      _id: String(e._id),
      kind: "event",
      title: e.eventTitle || "",
      thumbnail:
        e.eventThumbnail?.url ||
        "https://res.cloudinary.com/ffuatrrt/image/upload/v1790148020/event-invitation_alzpch.jpg",
      summary: truncate(stripHtml(e.eventDescription), 140),
      type: e.eventType || "",
      location: e.location || "",
      date: e.eventDate || null,
      day: e.eventDay || "",
      status: e.eventStatus || "upcoming",
    }));

    const sessions = sessionsRaw.map((s) => ({
      _id: String(s._id),
      kind: "session",
      title: s.sessionTitle || "",
      thumbnail:
        s.sessionThumbnail?.url ||
        "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg",
      summary: truncate(stripHtml(s.sessionDescription), 140),
      type: s.sessionType || "",
      meetingType: s.meetingType || "offline",
      location: s.location || "",
      meetingLink: s.meetingLink || "",
      date: s.sessionDate || null,
      day: s.sessionDay || "",
      status: s.sessionStatus || "upcoming",
    }));

    return NextResponse.json({
      success: true,
      events,
      sessions,
    });
  } catch (error) {
    console.error("❌ Featured fetch error:", error);
    // Return empty arrays — homepage should never break because of this
    return NextResponse.json(
      { success: false, events: [], sessions: [] },
      { status: 200 },
    );
  }
}