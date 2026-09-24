// app/api/secure/reports/attendance-summary/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import Session from "../../../../models/Session";
import { getCurrentUser } from "../../../../lib/authUtils";

const ALLOWED_ROLES = [
  "prefect",
  "itsecretary",
  "modarator",
  "assistant_prefect",
];

export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || !ALLOWED_ROLES.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") || "all").toLowerCase();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit")) || 20),
    );
    const skip = (page - 1) * limit;

    // ---- Build date filter ----
    const dateFilter = {};
    if (from || to) {
      dateFilter.$gte = from ? new Date(from) : new Date(0);
      dateFilter.$lte = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
    }

    const eventQuery = { isActive: true };
    if (Object.keys(dateFilter).length) eventQuery.eventDate = dateFilter;
    if (status !== "all") eventQuery.eventStatus = status;

    const sessionQuery = {};
    if (Object.keys(dateFilter).length) sessionQuery.sessionDate = dateFilter;
    if (status !== "all") sessionQuery.sessionStatus = status;

    // ---- Fetch in parallel ----
    const [eventsRaw, sessionsRaw] = await Promise.all([
      type === "sessions"
        ? []
        : Event.find(eventQuery)
            .select(
              "eventTitle eventDate eventDay eventStatus location " +
                "preRegistrationRequired preRegistrationUsers " +
                "eventAttendees externalAttendees",
            )
            .sort({ eventDate: -1 })
            .lean(),
      type === "events"
        ? []
        : Session.find(sessionQuery)
            .select(
              "sessionTitle sessionDate sessionTime location " +
                "sessionStatus sessionAttendees",
            )
            .sort({ sessionDate: -1 })
            .lean(),
    ]);

    // ---- Normalize events ----
    const events = eventsRaw.map((e) => {
      const preRegMembers = (e.preRegistrationUsers || []).filter(
        (u) => u.userId,
      ).length;
      const preRegExternals = (e.preRegistrationUsers || []).filter(
        (u) => !u.userId,
      ).length;
      const memberAttendees = (e.eventAttendees || []).length;
      const externalAttendees = (e.externalAttendees || []).length;
      const totalPreReg = preRegMembers + preRegExternals;
      const totalAttended = memberAttendees + externalAttendees;
      const attendanceRate =
        totalPreReg > 0
          ? Math.round((totalAttended / totalPreReg) * 100)
          : null; // null = no pre-registration → N/A

      return {
        _id: String(e._id),
        kind: "event",
        title: e.eventTitle,
        date: e.eventDate,
        day: e.eventDay || "",
        location: e.location || "",
        status: e.eventStatus,
        preRegistrationRequired: !!e.preRegistrationRequired,
        counts: {
          preRegMembers,
          preRegExternals,
          totalPreReg,
          memberAttendees,
          externalAttendees,
          totalAttended,
        },
        attendanceRate,
      };
    });

    // ---- Normalize sessions ----
    const sessions = sessionsRaw.map((s) => {
      const attendeeCount = (s.sessionAttendees || []).length;
      return {
        _id: String(s._id),
        kind: "session",
        title: s.sessionTitle,
        date: s.sessionDate,
        time: s.sessionTime || "",
        location: s.location || "",
        status: s.sessionStatus || "upcoming",
        preRegistrationRequired: false,
        counts: {
          preRegMembers: 0,
          preRegExternals: 0,
          totalPreReg: 0,
          memberAttendees: attendeeCount,
          externalAttendees: 0,
          totalAttended: attendeeCount,
        },
        attendanceRate: null, // sessions have no pre-reg baseline
      };
    });

    // ---- Merge + sort by date desc + paginate ----
    const combined = [...events, ...sessions].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );
    const totalCount = combined.length;
    const paged = combined.slice(skip, skip + limit);

    // ---- Overall totals across the filtered set ----
    const totals = combined.reduce(
      (acc, r) => {
        acc.events += r.kind === "event" ? 1 : 0;
        acc.sessions += r.kind === "session" ? 1 : 0;
        acc.memberAttendances += r.counts.memberAttendees;
        acc.externalAttendances += r.counts.externalAttendees;
        acc.totalAttendances += r.counts.totalAttended;
        return acc;
      },
      {
        events: 0,
        sessions: 0,
        memberAttendances: 0,
        externalAttendances: 0,
        totalAttendances: 0,
      },
    );

    return NextResponse.json({
      success: true,
      count: paged.length,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit) || 1,
      hasMore: skip + paged.length < totalCount,
      totals,
      records: paged,
    });
  } catch (error) {
    console.error("❌ Attendance summary error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build attendance summary" },
      { status: 500 },
    );
  }
}