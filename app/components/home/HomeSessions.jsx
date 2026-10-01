// app/components/home/HomeSessions.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaUsers,
  FaStar,
  FaVideo,
  FaChalkboardTeacher,
} from "react-icons/fa";

const SESSION_TYPE_LABELS = {
  workshop: "Workshop",
  seminar: "Seminar",
  webinar: "Webinar",
  meeting: "Meeting",
  training: "Training",
  competition: "Competition",
  other: "Session",
};

const STATUS_STYLES = {
  upcoming: {
    badge: "bg-[#D3A16D] text-[#3D444C] border-transparent",
    label: "Upcoming",
  },
  completed: {
    badge: "bg-green-500/20 text-green-300 border-green-500/40",
    label: "Completed",
  },
  cancelled: {
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    label: "Cancelled",
  },
};

const HomeSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/users/home/sessions", {
          next: { revalidate: 60 },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load sessions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && sessions.length === 0) return null;

  return (
    <section className="relative bg-[#3D444C] py-16 sm:py-20 overflow-hidden">
      {/* Decorative blurs — subtly tinted on dark bg */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-20 -right-32 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#994D35] opacity-15 blur-3xl -bottom-20 -left-32 pointer-events-none" />

      {/* Subtle grid pattern for texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#E7E3D8 1px, transparent 1px), linear-gradient(90deg, #E7E3D8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-2">
              Learn With Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E7E3D8]">
              Career <span className="text-[#D3A16D]">Sessions</span>
            </h2>
            <p className="text-[#E7E3D8]/60 mt-2 max-w-xl text-sm sm:text-base">
              Skill-building workshops, expert talks, and hands-on training —
              curated for our members.
            </p>
          </div>

          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#D3A16D] hover:text-[#E7E3D8] transition-colors group whitespace-nowrap"
          >
            View all sessions
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ==================== GRID ==================== */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <SessionCardSkeleton />
            <SessionCardSkeleton />
            <ViewAllCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {sessions.slice(0, 2).map((session) => (
              <SessionCard key={session._id} session={session} />
            ))}
            <ViewAllCard />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeSessions;

// =====================================================================
// Session Card — DARK variant (matches the slate section)
// =====================================================================
const SessionCard = ({ session }) => {
  const sessionDate = session.sessionDate ? new Date(session.sessionDate) : null;

  const dateDay = sessionDate
    ? sessionDate.toLocaleDateString("en-US", { day: "2-digit" })
    : "—";
  const dateMonth = sessionDate
    ? sessionDate.toLocaleDateString("en-US", { month: "short" })
    : "";
  const dateYear = sessionDate ? sessionDate.getFullYear() : "";

  const longDate = sessionDate
    ? sessionDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date to be announced";

  const typeLabel =
    SESSION_TYPE_LABELS[session.sessionType] || SESSION_TYPE_LABELS.other;
  const status = STATUS_STYLES[session.sessionStatus] || STATUS_STYLES.upcoming;
  const isOnline = session.meetingType === "online";

  const excerpt = session.sessionDescription
    ? session.sessionDescription
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 130) + "…"
    : "Click to learn more about this session.";

  const thumbnail =
    session.sessionThumbnail?.url ||
    "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";

  return (
    <Link
      href={`/sessions/${session._id}`}
      className="group bg-[#2f353c] rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#E7E3D8]/10 hover:border-[#D3A16D]/40 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-32 sm:h-44 md:h-52 lg:h-56 bg-[#2a3037] overflow-hidden">
        <Image
          src={thumbnail}
          alt={session.sessionTitle}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2f353c] via-[#3D444C]/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
          <span
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${status.badge}`}
          >
            {status.label}
          </span>
        </div>

        {/* Featured star */}
        {session.isFeatured && (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
            <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#D3A16D] flex items-center justify-center shadow-lg">
              <FaStar className="text-[#3D444C] text-[8px] sm:text-xs" />
            </span>
          </div>
        )}

        {/* Type badge — hidden on smallest screens to save space */}
        <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 hidden sm:block">
          <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#3D444C]/90 backdrop-blur-sm text-[#D3A16D] border border-[#D3A16D]/40">
            {typeLabel}
          </span>
        </div>

        {/* Date block */}
        {sessionDate && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-[#E7E3D8] rounded-lg sm:rounded-xl shadow-lg overflow-hidden w-[38px] sm:w-[58px] text-center">
            <div className="bg-[#994D35] text-white text-[7px] sm:text-[10px] font-bold uppercase py-0.5">
              {dateMonth}
            </div>
            <div className="py-0.5 sm:py-1">
              <p className="text-sm sm:text-xl font-extrabold text-[#3D444C] leading-none">
                {dateDay}
              </p>
              <p className="text-[7px] sm:text-[9px] text-[#3D444C]/50 font-semibold mt-0.5">
                {dateYear}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-[#E7E3D8] text-xs sm:text-base md:text-lg leading-snug mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 group-hover:text-[#D3A16D] transition-colors">
          {session.sessionTitle}
        </h3>

        {/* Meta */}
        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm">
          <div className="flex items-start gap-1 sm:gap-2 text-[#E7E3D8]/70">
            <FaCalendarAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
            <span className="line-clamp-1">
              {session.sessionDay ? `${session.sessionDay}, ` : ""}
              {longDate}
            </span>
          </div>

          {/* Location or meeting link */}
          {isOnline ? (
            session.meetingLink && (
              <div className="flex items-start gap-1 sm:gap-2 text-[#E7E3D8]/70">
                <FaVideo className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
                <span className="line-clamp-1">Online Session</span>
              </div>
            )
          ) : (
            session.location && (
              <div className="flex items-start gap-1 sm:gap-2 text-[#E7E3D8]/70">
                <FaMapMarkerAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
                <span className="line-clamp-1">{session.location}</span>
              </div>
            )
          )}
        </div>

        {/* Excerpt — hidden on mobile to keep cards compact */}
        <p className="hidden sm:block text-xs md:text-sm text-[#E7E3D8]/50 leading-relaxed mb-3 md:mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-2 sm:pt-3 md:pt-4 border-t border-[#E7E3D8]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#D3A16D]/15 text-[#D3A16D] border border-[#D3A16D]/30 self-start">
              <FaVideo className="text-[7px] sm:text-[9px]" /> Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#E7E3D8]/10 text-[#E7E3D8] border border-[#E7E3D8]/20 self-start">
              <FaChalkboardTeacher className="text-[7px] sm:text-[9px]" /> On-site
            </span>
          )}

          <span className="text-[#D3A16D] text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 group-hover:gap-1.5 sm:group-hover:gap-2 transition-all self-end sm:self-auto">
            Details <FaArrowRight className="text-[8px] sm:text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// View All Card — DARK section variant
// =====================================================================
const ViewAllCard = () => {
  return (
    <Link
      href="/sessions"
      className="group relative bg-gradient-to-br from-[#D3A16D] to-[#994D35] rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#D3A16D]/30 flex flex-col items-center justify-center text-center min-h-[260px] sm:min-h-[340px] md:min-h-[420px] p-4 sm:p-6 md:p-8"
    >
      {/* Decorative blurs — inverted for a warm card */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-[#E7E3D8] opacity-20 blur-3xl -top-16 -right-16 pointer-events-none group-hover:opacity-30 transition-opacity" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#3D444C] opacity-20 blur-3xl -bottom-16 -left-16 pointer-events-none group-hover:opacity-30 transition-opacity" />

      {/* Icon ring */}
      <div className="relative mb-3 sm:mb-4 md:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#3D444C]/20 border-2 border-[#E7E3D8]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <FaArrowRight className="text-[#E7E3D8] text-base sm:text-xl md:text-2xl" />
        </div>
      </div>

      <div className="relative">
        <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#3D444C]/70 mb-1 sm:mb-2">
          Explore More
        </p>
        <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#E7E3D8] mb-2 sm:mb-3 leading-tight drop-shadow-sm">
          View All
          <br />
          Sessions
        </h3>
        <p className="hidden sm:block text-xs md:text-sm text-[#E7E3D8]/80 max-w-[220px] mx-auto leading-relaxed">
          Browse our full archive — past, present, and upcoming.
        </p>
      </div>

      <span className="relative mt-4 sm:mt-6 md:mt-8 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-[#3D444C] text-[#E7E3D8] font-bold text-[10px] sm:text-sm group-hover:bg-[#E7E3D8] group-hover:text-[#3D444C] transition-colors">
        See All
        <FaArrowRight className="text-[8px] sm:text-xs group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
};

// =====================================================================
// Session Card — Skeleton
// =====================================================================
const SessionCardSkeleton = () => (
  <div className="bg-[#2f353c] rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#E7E3D8]/10 animate-pulse">
    {/* Thumbnail area */}
    <div className="relative w-full h-32 sm:h-44 md:h-52 lg:h-56 bg-[#E7E3D8]/10">
      <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 h-4 sm:h-6 w-12 sm:w-20 rounded-full bg-[#E7E3D8]/15" />
      <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 h-4 sm:h-6 w-14 sm:w-24 rounded-full bg-[#E7E3D8]/15" />
      <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 h-[38px] sm:h-[58px] w-[38px] sm:w-[58px] rounded-lg sm:rounded-xl bg-[#E7E3D8]/20" />
    </div>

    {/* Body */}
    <div className="p-2.5 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
      {/* Title */}
      <div className="h-3.5 sm:h-5 w-4/5 rounded bg-[#E7E3D8]/15" />
      <div className="h-3.5 sm:h-5 w-3/5 rounded bg-[#E7E3D8]/15" />

      {/* Meta */}
      <div className="space-y-1.5 sm:space-y-2 pt-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#E7E3D8]/15" />
          <div className="h-2.5 sm:h-3 w-2/3 rounded bg-[#E7E3D8]/15" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#E7E3D8]/15" />
          <div className="h-2.5 sm:h-3 w-1/2 rounded bg-[#E7E3D8]/15" />
        </div>
      </div>

      {/* Excerpt — hidden on mobile */}
      <div className="hidden sm:block space-y-2 pt-2">
        <div className="h-3 w-full rounded bg-[#E7E3D8]/10" />
        <div className="h-3 w-5/6 rounded bg-[#E7E3D8]/10" />
      </div>

      {/* Footer */}
      <div className="pt-2 sm:pt-4 border-t border-[#E7E3D8]/10 flex items-center justify-between">
        <div className="h-4 sm:h-6 w-14 sm:w-24 rounded-full bg-[#E7E3D8]/10" />
        <div className="h-2.5 sm:h-3 w-10 sm:w-16 rounded bg-[#E7E3D8]/10" />
      </div>
    </div>
  </div>
);

// =====================================================================
// View All Card — Skeleton
// =====================================================================
const ViewAllCardSkeleton = () => (
  <div className="relative bg-gradient-to-br from-[#D3A16D]/40 to-[#994D35]/40 rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#D3A16D]/20 flex flex-col items-center justify-center text-center min-h-[260px] sm:min-h-[340px] md:min-h-[420px] p-4 sm:p-6 md:p-8 animate-pulse">
    {/* Icon circle */}
    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#E7E3D8]/20 mb-3 sm:mb-4 md:mb-6" />

    {/* Kicker */}
    <div className="h-2.5 sm:h-3 w-20 sm:w-24 rounded bg-[#E7E3D8]/20 mb-2 sm:mb-3" />

    {/* Title lines */}
    <div className="h-4 sm:h-6 w-24 sm:w-32 rounded bg-[#E7E3D8]/25 mb-1.5 sm:mb-2" />
    <div className="h-4 sm:h-6 w-20 sm:w-24 rounded bg-[#E7E3D8]/25 mb-3 sm:mb-4" />

    {/* Subtitle — hidden on mobile */}
    <div className="hidden sm:block h-3 w-44 rounded bg-[#E7E3D8]/20 mb-1" />
    <div className="hidden sm:block h-3 w-36 rounded bg-[#E7E3D8]/20" />

    {/* Button */}
    <div className="mt-4 sm:mt-6 md:mt-8 h-7 sm:h-10 w-20 sm:w-28 rounded-full bg-[#E7E3D8]/25" />
  </div>
);