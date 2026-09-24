// app/api/secure/statistics/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import Event from "../../../models/Event";
import Session from "../../../models/Session";
import Notice from "../../../models/Notice";
import Certificate from "../../../models/Certificate";
import DynamicRole from "../../../models/DynamicRole";
import { getCurrentUser } from "../../../lib/authUtils";

const ALLOWED_ROLES = [
  "prefect",
  "itsecretary",
  "modarator",
  "assistant_prefect",
];

// Cache for 30s — dashboard numbers don't need to be real-time
export const revalidate = 30;

export async function GET(request) {
  try {
    // ---------- AUTH ----------
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

    // ---------- DATE HELPERS ----------
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOf30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // ---------- PARALLEL QUERIES ----------
    const [
      // === USERS ===
      totalUsers,
      activeUsers,
      verifiedUsers,
      usersThisMonth,
      usersLastMonth,
      roleBreakdown,
      departmentBreakdown,
      topUsersByAttendance,

      // === EVENTS ===
      totalEvents,
      activeEvents,
      upcomingEvents,
      completedEvents,
      cancelledEvents,
      featuredEvents,
      eventsThisMonth,

      // === SESSIONS ===
      totalSessions,
      upcomingSessions,
      completedSessions,
      cancelledSessions,
      featuredSessions,
      sessionsThisMonth,

      // === NOTICES ===
      totalNotices,
      activeNotices,
      urgentNotices,
      noticesThisMonth,

      // === CERTIFICATES ===
      totalCertificates,
      publishedCertificates,
      draftCertificates,
      certificatesThisMonth,
      certificatesEmailed,

      // === DYNAMIC ROLES ===
      totalDynamicRoles,
    ] = await Promise.all([
      // ---------- USER METRICS ----------
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Top users by combined attendance count
      User.aggregate([
        {
          $lookup: {
            from: "events",
            let: { uid: "$_id" },
            pipeline: [
              { $match: { $expr: { $in: ["$$uid", "$eventAttendees"] } } },
              { $count: "n" },
            ],
            as: "eventCount",
          },
        },
        {
          $lookup: {
            from: "sessions",
            let: { uid: "$_id" },
            pipeline: [
              { $match: { $expr: { $in: ["$$uid", "$sessionAttendees"] } } },
              { $count: "n" },
            ],
            as: "sessionCount",
          },
        },
        {
          $addFields: {
            totalAttendance: {
              $add: [
                { $ifNull: [{ $arrayElemAt: ["$eventCount.n", 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ["$sessionCount.n", 0] }, 0] },
              ],
            },
          },
        },
        { $match: { totalAttendance: { $gt: 0 } } },
        { $sort: { totalAttendance: -1 } },
        { $limit: 5 },
        {
          $project: {
            fullName: 1,
            studentId: 1,
            department: 1,
            role: 1,
            totalAttendance: 1,
          },
        },
      ]),

      // ---------- EVENT METRICS ----------
      Event.countDocuments({}),
      Event.countDocuments({ isActive: true }),
      Event.countDocuments({ eventStatus: "upcoming" }),
      Event.countDocuments({ eventStatus: "completed" }),
      Event.countDocuments({ eventStatus: "cancelled" }),
      Event.countDocuments({ isFeatured: true, isActive: true }),
      Event.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

      // ---------- SESSION METRICS ----------
      Session.countDocuments({}),
      Session.countDocuments({ sessionStatus: "upcoming" }),
      Session.countDocuments({ sessionStatus: "completed" }),
      Session.countDocuments({ sessionStatus: "cancelled" }),
      Session.countDocuments({ isFeatured: true, isActive: true }),
      Session.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

      // ---------- NOTICE METRICS ----------
      Notice.countDocuments({}),
      Notice.countDocuments({ isActive: true }),
      Notice.countDocuments({ priority: "urgent", isActive: true }),
      Notice.countDocuments({ createdAt: { $gte: startOfThisMonth } }),

      // ---------- CERTIFICATE METRICS ----------
      Certificate.countDocuments({}),
      Certificate.countDocuments({ published: true }),
      Certificate.countDocuments({ published: false }),
      Certificate.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Certificate.countDocuments({ emailSent: true }),

      // ---------- DYNAMIC ROLES ----------
      DynamicRole.countDocuments({}),
    ]);

    // ---------- ATTENDANCE AGGREGATES ----------
    const [
      totalEventAttendances,
      totalExternalAttendances,
      totalSessionAttendances,
    ] = await Promise.all([
      Event.aggregate([
        { $project: { n: { $size: { $ifNull: ["$eventAttendees", []] } } } },
        { $group: { _id: null, total: { $sum: "$n" } } },
      ]),
      Event.aggregate([
        { $project: { n: { $size: { $ifNull: ["$externalAttendees", []] } } } },
        { $group: { _id: null, total: { $sum: "$n" } } },
      ]),
      Session.aggregate([
        { $project: { n: { $size: { $ifNull: ["$sessionAttendees", []] } } } },
        { $group: { _id: null, total: { $sum: "$n" } } },
      ]),
    ]);

    const eventAttendanceCount = totalEventAttendances[0]?.total || 0;
    const externalAttendanceCount = totalExternalAttendances[0]?.total || 0;
    const sessionAttendanceCount = totalSessionAttendances[0]?.total || 0;

    // ---------- RECENT ACTIVITY ----------
    const [recentEvents, recentSessions, recentNotices, recentCertificates] =
      await Promise.all([
        Event.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .select("eventTitle createdAt eventStatus")
          .lean(),
        Session.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .select("sessionTitle createdAt sessionStatus")
          .lean(),
        Notice.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .select("title createdAt priority createdByName")
          .lean(),
        Certificate.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .select("title certificateId createdAt published recipient.fullName")
          .lean(),
      ]);

    // Merge & sort recent activity into one feed
    const activityFeed = [
      ...recentEvents.map((e) => ({
        kind: "event",
        title: e.eventTitle,
        subtitle: `Status: ${e.eventStatus}`,
        at: e.createdAt,
      })),
      ...recentSessions.map((s) => ({
        kind: "session",
        title: s.sessionTitle,
        subtitle: `Status: ${s.sessionStatus}`,
        at: s.createdAt,
      })),
      ...recentNotices.map((n) => ({
        kind: "notice",
        title: n.title,
        subtitle: `Priority: ${n.priority} • by ${n.createdByName}`,
        at: n.createdAt,
      })),
      ...recentCertificates.map((c) => ({
        kind: "certificate",
        title: c.title,
        subtitle: `${c.recipient?.fullName || ""} • ${
          c.published ? "Published" : "Draft"
        }`,
        at: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);

    // ---------- MONTH-OVER-MONTH DELTA ----------
    const userGrowthPct =
      usersLastMonth > 0
        ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
        : usersThisMonth > 0
          ? 100
          : 0;

    // ---------- RESPONSE ----------
    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),

      users: {
        total: totalUsers,
        active: activeUsers,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers,
        thisMonth: usersThisMonth,
        lastMonth: usersLastMonth,
        growthPct: userGrowthPct,
        byRole: roleBreakdown.map((r) => ({
          role: r._id || "unknown",
          count: r.count,
        })),
        topDepartments: departmentBreakdown.map((d) => ({
          department: d._id || "Unknown",
          count: d.count,
        })),
        topAttendees: topUsersByAttendance,
      },

      events: {
        total: totalEvents,
        active: activeEvents,
        upcoming: upcomingEvents,
        completed: completedEvents,
        cancelled: cancelledEvents,
        featured: featuredEvents,
        thisMonth: eventsThisMonth,
        totalMemberAttendances: eventAttendanceCount,
        totalExternalAttendances: externalAttendanceCount,
      },

      sessions: {
        total: totalSessions,
        upcoming: upcomingSessions,
        completed: completedSessions,
        cancelled: cancelledSessions,
        featured: featuredSessions,
        thisMonth: sessionsThisMonth,
        totalMemberAttendances: sessionAttendanceCount,
      },

      notices: {
        total: totalNotices,
        active: activeNotices,
        urgent: urgentNotices,
        thisMonth: noticesThisMonth,
      },

      certificates: {
        total: totalCertificates,
        published: publishedCertificates,
        draft: draftCertificates,
        thisMonth: certificatesThisMonth,
        emailed: certificatesEmailed,
        publishRate:
          totalCertificates > 0
            ? Math.round((publishedCertificates / totalCertificates) * 100)
            : 0,
      },

      dynamicRoles: {
        total: totalDynamicRoles,
      },

      combined: {
        totalEventsAndSessions: totalEvents + totalSessions,
        totalAttendances:
          eventAttendanceCount +
          externalAttendanceCount +
          sessionAttendanceCount,
        totalContent:
          totalNotices + totalCertificates + totalEvents + totalSessions,
        publishRate:
          totalCertificates > 0
            ? Math.round((publishedCertificates / totalCertificates) * 100)
            : 0,
      },

      recentActivity: activityFeed,
    });
  } catch (error) {
    console.error("❌ Statistics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load statistics" },
      { status: 500 },
    );
  }
}