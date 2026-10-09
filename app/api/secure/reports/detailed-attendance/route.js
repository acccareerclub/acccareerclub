// app/api/secure/reports/detailed-attendance/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import Event from "@/app/models/Event";
import Session from "@/app/models/Session";
import { getCurrentUser } from "@/app/lib/authUtils";

// ============= GET: Detailed attendance report =============
// Query params:
//   from      — ISO date (default: 90 days ago)
//   to        — ISO date (default: today)
//   include   — "events" | "sessions" | "both" (default: "both")
//   search    — optional (name, studentId, membershipId, phone, email)
//   role      — optional filter (default: exclude moderators)
export async function GET(request) {
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

    // ---------- Parse query params ----------
    const { searchParams } = new URL(request.url);
    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");
    const include = searchParams.get("include") || "both"; // events | sessions | both
    const search = (searchParams.get("q") || "").trim();
    const onlyActive = searchParams.get("onlyActive") !== "false";

    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 90);

    const from = fromRaw ? new Date(fromRaw) : defaultFrom;
    const to = toRaw ? new Date(toRaw) : now;

    // Make `to` end-of-day so it includes the full day
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    // ---------- Fetch eligible users ----------
    const userQuery = {
      role: { $nin: ["modarator", "moderator"] }, // exclude moderators from the list
    };
    if (onlyActive) userQuery.isActive = true;

    // Search filter
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = { $regex: escaped, $options: "i" };
      userQuery.$or = [
        { fullName: regex },
        { studentId: regex },
        { membershipId: regex },
        { phone: regex },
        { email: regex },
      ];
    }

    const users = await User.find(userQuery)
      .select(
        "fullName email phone studentId membershipId department role isActive personalInfo.classOrYear personalInfo.profilePicture",
      )
      .sort({ fullName: 1 })
      .lean();

    const userIds = users.map((u) => u._id);

    // ---------- Fetch events + sessions in range ----------
    const rangeFilter = {
      isActive: true,
      $or: [
        { eventDate: { $gte: from, $lte: toEnd } },
        { sessionDate: { $gte: from, $lte: toEnd } },
      ],
    };

    // Fetch separately for clarity
    const [events, sessions] = await Promise.all([
      include === "sessions"
        ? Promise.resolve([])
        : Event.find({
            isActive: true,
            eventDate: { $gte: from, $lte: toEnd },
          })
            .select("_id eventTitle eventDate eventStatus eventAttendees")
            .lean(),
      include === "events"
        ? Promise.resolve([])
        : Session.find({
            isActive: true,
            sessionDate: { $gte: from, $lte: toEnd },
          })
            .select("_id sessionTitle sessionDate sessionStatus sessionAttendees")
            .lean(),
    ]);

    // ---------- Combine into a unified timeline ----------
    const timeline = [
      ...events.map((e) => ({
        _id: e._id,
        kind: "event",
        title: e.eventTitle,
        date: e.eventDate,
        status: e.eventStatus,
        attendees: (e.eventAttendees || []).map((id) => id.toString()),
      })),
      ...sessions.map((s) => ({
        _id: s._id,
        kind: "session",
        title: s.sessionTitle,
        date: s.sessionDate,
        status: s.sessionStatus,
        attendees: (s.sessionAttendees || []).map((id) => id.toString()),
      })),
    ].sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalOccasions = timeline.length;

    // ---------- Build per-user attendance matrix ----------
    const userIdSet = new Set(userIds.map((id) => id.toString()));

    const reports = users.map((u) => {
      const uid = u._id.toString();

      const attended = [];
      const missed = [];

      for (const occ of timeline) {
        const wasThere = occ.attendees.includes(uid);
        if (wasThere) {
          attended.push({
            _id: occ._id,
            kind: occ.kind,
            title: occ.title,
            date: occ.date,
          });
        } else {
          missed.push({
            _id: occ._id,
            kind: occ.kind,
            title: occ.title,
            date: occ.date,
          });
        }
      }

      const attendedCount = attended.length;
      const attendanceRate =
        totalOccasions > 0
          ? Math.round((attendedCount / totalOccasions) * 100)
          : 0;

      return {
        _id: u._id,
        fullName: u.fullName || "",
        email: u.email || "",
        phone: u.phone || "",
        studentId: u.studentId || "",
        membershipId: u.membershipId || "",
        department: u.department || "",
        role: u.role || "",
        isActive: u.isActive,
        classOrYear: u.personalInfo?.classOrYear || "",
        profilePicture: u.personalInfo?.profilePicture || "",
        attendedCount,
        missedCount: missed.length,
        totalOccasions,
        attendanceRate,
        attended,
        missed,
      };
    });

    // ---------- Sort by most attended first ----------
    reports.sort((a, b) => {
      if (b.attendedCount !== a.attendedCount)
        return b.attendedCount - a.attendedCount;
      // tie-break by attendanceRate, then name
      if (b.attendanceRate !== a.attendanceRate)
        return b.attendanceRate - a.attendanceRate;
      return a.fullName.localeCompare(b.fullName);
    });

    // ---------- Stats ----------
    const activeUsers = users.filter((u) => u.isActive);
    const inactiveUsers = users.filter((u) => !u.isActive);

    const totalAttendanceMarks = reports.reduce(
      (sum, r) => sum + r.attendedCount,
      0,
    );

    const avgAttendanceRate =
      reports.length > 0
        ? Math.round(
            reports.reduce((sum, r) => sum + r.attendanceRate, 0) /
              reports.length,
          )
        : 0;

    const stats = {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      inactiveUsers: inactiveUsers.length,
      totalEvents: events.length,
      totalSessions: sessions.length,
      totalOccasions,
      totalAttendanceMarks,
      avgAttendanceRate,
      perfectAttendance: reports.filter(
        (r) => r.attendanceRate === 100 && r.totalOccasions > 0,
      ).length,
      zeroAttendance: reports.filter(
        (r) => r.attendedCount === 0 && r.totalOccasions > 0,
      ).length,
    };

    return NextResponse.json({
      success: true,
      dateRange: {
        from: from.toISOString(),
        to: toEnd.toISOString(),
      },
      stats,
      timeline: timeline.map((t) => ({
        _id: t._id,
        kind: t.kind,
        title: t.title,
        date: t.date,
        attendeeCount: t.attendees.length,
      })),
      reports,
    });
  } catch (error) {
    console.error("❌ Attendance report error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report" },
      { status: 500 },
    );
  }
}