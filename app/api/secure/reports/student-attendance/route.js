// app/api/secure/reports/student-attendance/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "../../../../lib/mongodb";
import Event from "../../../../models/Event";
import Session from "../../../../models/Session";
import User from "../../../../models/User";
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
    const userId = searchParams.get("userId");
    const studentId = searchParams.get("studentId");
    const q = (searchParams.get("q") || "").trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const kind = (searchParams.get("kind") || "all").toLowerCase();

    // ============ CASE A: search mode (return matches) ============
    if (!userId && !studentId && q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const matches = await User.find({
        $or: [
          { fullName: regex },
          { studentId: regex },
          { email: regex },
        ],
        isActive: true,
      })
        .select("fullName studentId email department role personalInfo.profilePicture")
        .limit(20)
        .lean();

      return NextResponse.json({
        success: true,
        mode: "search",
        count: matches.length,
        students: matches.map((u) => ({
          _id: String(u._id),
          fullName: u.fullName,
          studentId: u.studentId,
          email: u.email,
          department: u.department,
          role: u.role,
          profilePicture: u.personalInfo?.profilePicture || "",
        })),
      });
    }

    // ============ CASE B: resolve student ============
    let student = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      student = await User.findById(userId)
        .select("fullName studentId email department role personalInfo.profilePicture")
        .lean();
    } else if (studentId) {
      student = await User.findOne({ studentId })
        .select("fullName studentId email department role personalInfo.profilePicture")
        .lean();
    }

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 },
      );
    }

    const uidStr = String(student._id);
    const sid = (student.studentId || "").toUpperCase();

    // ---- Date filter ----
    const dateRange = {};
    if (from || to) {
      dateRange.$gte = from ? new Date(from) : new Date(0);
      dateRange.$lte = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
    }

    // ---- Build queries ----
    const eventQuery = {};
    if (Object.keys(dateRange).length) eventQuery.eventDate = dateRange;

    const sessionQuery = {};
    if (Object.keys(dateRange).length) sessionQuery.sessionDate = dateRange;

    const [eventsRaw, sessionsRaw] = await Promise.all([
      kind === "sessions"
        ? []
        : Event.find(eventQuery)
            .select(
              "eventTitle eventDate eventDay eventStatus location " +
                "preRegistrationRequired preRegistrationUsers " +
                "eventAttendees externalAttendees",
            )
            .sort({ eventDate: -1 })
            .lean(),
      kind === "events"
        ? []
        : Session.find(sessionQuery)
            .select(
              "sessionTitle sessionDate sessionTime sessionStatus " +
                "location sessionAttendees",
            )
            .sort({ sessionDate: -1 })
            .lean(),
    ]);

    // ============ Build event history ============
    const eventHistory = eventsRaw.map((e) => {
      const eventAttendeeIds = (e.eventAttendees || []).map((a) =>
        String(a?._id || a),
      );
      const wasPresent = eventAttendeeIds.includes(uidStr);

      const preRegEntry = (e.preRegistrationUsers || []).find(
        (p) =>
          (p.userId && String(p.userId) === uidStr) ||
          (sid && (p.identificationNo || "").toUpperCase() === sid),
      );
      const wasPreRegistered = !!preRegEntry;

      let status;
      if (wasPresent) status = "present";
      else if (wasPreRegistered) status = "absent"; // pre-registered but didn't show
      else status = "not_registered"; // wasn't expected

      return {
        _id: String(e._id),
        kind: "event",
        title: e.eventTitle,
        date: e.eventDate,
        day: e.eventDay || "",
        location: e.location || "",
        eventStatus: e.eventStatus,
        preRegistrationRequired: !!e.preRegistrationRequired,
        wasPreRegistered,
        wasPresent,
        status,
      };
    });

    // ============ Build session history ============
    const sessionHistory = sessionsRaw.map((s) => {
      const sessionAttendeeIds = (s.sessionAttendees || []).map((a) =>
        String(a?._id || a),
      );
      const wasPresent = sessionAttendeeIds.includes(uidStr);
      return {
        _id: String(s._id),
        kind: "session",
        title: s.sessionTitle,
        date: s.sessionDate,
        time: s.sessionTime || "",
        location: s.location || "",
        sessionStatus: s.sessionStatus || "",
        wasPreRegistered: false,
        wasPresent,
        status: wasPresent ? "present" : "absent",
      };
    });

    const history = [...eventHistory, ...sessionHistory].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
    );

    // ============ Totals ============
    const totals = {
      events: {
        total: eventHistory.length,
        present: eventHistory.filter((h) => h.status === "present").length,
        absent: eventHistory.filter((h) => h.status === "absent").length,
        notRegistered: eventHistory.filter(
          (h) => h.status === "not_registered",
        ).length,
      },
      sessions: {
        total: sessionHistory.length,
        present: sessionHistory.filter((h) => h.status === "present").length,
        absent: sessionHistory.filter((h) => h.status === "absent").length,
      },
    };

    const totalExpected =
      totals.events.present +
      totals.events.absent +
      totals.sessions.present +
      totals.sessions.absent;
    const totalPresent = totals.events.present + totals.sessions.present;
    const overallRate =
      totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

    return NextResponse.json({
      success: true,
      mode: "report",
      student: {
        _id: uidStr,
        fullName: student.fullName,
        studentId: student.studentId,
        email: student.email,
        department: student.department,
        role: student.role,
        profilePicture: student.personalInfo?.profilePicture || "",
      },
      totals: { ...totals, overallRate },
      history,
    });
  } catch (error) {
    console.error("❌ Student attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build student report" },
      { status: 500 },
    );
  }
}