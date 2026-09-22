// app/sessions/UserClientSessions.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaVideo,
  FaSpinner,
  FaStar,
  FaTh,
  FaList,
  FaArrowRight,
  FaFilePdf,
  FaSearch,
} from "react-icons/fa";
import { format } from "date-fns";

const DEFAULT_BANNER =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";

const PAGE_SIZE = 10;

const UserClientSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [filterStatus, setFilterStatus] = useState("all");

  // Persist view mode preference
  useEffect(() => {
    const saved =
      typeof window !== "undefined" && localStorage.getItem("sessionViewMode");
    if (saved === "list" || saved === "grid") setViewMode(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sessionViewMode", viewMode);
    }
  }, [viewMode]);

  const fetchSessions = async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await fetch(
        `/api/users/sessions/get-sessions?page=${pageNum}&limit=${PAGE_SIZE}`,
        { cache: "no-store" },
      );
      const data = await res.json();

      if (data.success) {
        if (append) setSessions((prev) => [...prev, ...data.sessions]);
        else setSessions(data.sessions);
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
        setPage(data.currentPage);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchSessions(1, false);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchSessions(page + 1, true);
  };

  // Client-side filter (doesn't hit API again)
  const filteredSessions =
    filterStatus === "all"
      ? sessions
      : sessions.filter((s) => s.sessionStatus === filterStatus);

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-[#E7E3D8] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-[#3D444C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7E3D8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ========= HEADER ========= */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-[#3D444C]/10 border border-[#3D444C]/20">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3D444C]">
              ACC Career Club
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D444C] mb-3">
            Our <span className="text-[#994D35]">Sessions</span>
          </h1>
          <p className="text-[#3D444C]/70 max-w-2xl mx-auto text-sm sm:text-base">
            Explore workshops, seminars, webinars, and trainings designed to
            sharpen your skills and build your career.
          </p>
          <div className="mt-4 text-sm text-[#3D444C]/60">
            <span className="font-semibold text-[#3D444C]">{totalCount}</span>{" "}
            session{totalCount !== 1 ? "s" : ""} available
          </div>
        </div>

        {/* ========= TOOLBAR ========= */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-3 sm:p-4 mb-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {["all", "upcoming", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all ${
                  filterStatus === status
                    ? "bg-[#3D444C] text-[#E7E3D8] shadow"
                    : "bg-[#E7E3D8] text-[#3D444C] hover:bg-[#D3A16D]/40"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-medium text-[#3D444C]/60 mr-1">
              View:
            </span>
            <div className="inline-flex rounded-lg border border-[#3D444C]/20 p-0.5 bg-[#E7E3D8]/50">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "grid"
                    ? "bg-[#3D444C] text-[#E7E3D8] shadow-sm"
                    : "text-[#3D444C] hover:bg-[#D3A16D]/30"
                }`}
                title="Grid view"
              >
                <FaTh className="text-xs" /> Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-[#3D444C] text-[#E7E3D8] shadow-sm"
                    : "text-[#3D444C] hover:bg-[#D3A16D]/30"
                }`}
                title="List view"
              >
                <FaList className="text-xs" /> List
              </button>
            </div>
          </div>
        </div>

        {/* ========= SESSIONS ========= */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E7E3D8] flex items-center justify-center">
              <FaCalendar className="text-[#3D444C]/50 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-[#3D444C] mb-2">
              No Sessions Found
            </h3>
            <p className="text-[#3D444C]/60 text-sm">
              Check back soon for upcoming sessions.
            </p>
          </div>
        ) : (
          <>
            {/* GRID VIEW */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => (
                  <SessionGridCard key={session._id} session={session} />
                ))}
              </div>
            )}

            {/* LIST VIEW (single row per session) */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <SessionListRow key={session._id} session={session} />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && filterStatus === "all" && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-[#3D444C] text-[#E7E3D8] rounded-xl font-semibold hover:bg-[#994D35] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin" /> Loading...
                    </>
                  ) : (
                    <>
                      Load More <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>
              </div>
            )}

            {!hasMore && sessions.length > 0 && filterStatus === "all" && (
              <div className="text-center text-[#3D444C]/40 text-sm mt-10">
                You've seen all {totalCount} session
                {totalCount !== 1 ? "s" : ""}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   GRID CARD
   ============================================================ */
const SessionGridCard = ({ session }) => {
  const banner = session.sessionThumbnail?.url || DEFAULT_BANNER;
  const statusConfig = getStatusConfig(session.sessionStatus);

  return (
    <Link href={`/sessions/${session._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#3D444C]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-[#3D444C]/10 overflow-hidden">
          <Image
            src={banner}
            alt={session.sessionTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D444C]/60 via-transparent to-transparent" />

          {/* Type badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#3D444C]/85 text-[#E7E3D8] text-xs rounded-full font-medium uppercase tracking-wide backdrop-blur-sm">
            {session.sessionType}
          </span>

          {/* Featured star */}
          {session.isFeatured && (
            <span className="absolute top-3 right-3 p-1.5 bg-[#D3A16D] text-[#3D444C] rounded-full shadow-md">
              <FaStar className="text-xs" />
            </span>
          )}

          {/* Status pill bottom-right */}
          <span
            className={`absolute bottom-3 right-3 px-2.5 py-1 text-xs rounded-full font-bold shadow-md ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 text-xs text-[#3D444C]/60 mb-2">
            <FaCalendar className="text-[#D3A16D]" />
            {format(new Date(session.sessionDate), "MMM d, yyyy")}
            {session.sessionDay && (
              <>
                <span className="text-[#3D444C]/20">•</span>
                <span>{session.sessionDay}</span>
              </>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#3D444C] mb-2 line-clamp-2 group-hover:text-[#994D35] transition-colors">
            {session.sessionTitle}
          </h3>

          <p className="text-[#3D444C]/70 text-sm mb-4 line-clamp-2">
            {session.sessionDescription?.replace(/<[^>]*>?/gm, "")}
          </p>

          <div className="mt-auto pt-4 border-t border-[#3D444C]/10 flex items-center justify-between text-xs text-[#3D444C]/60">
            <span className="flex items-center gap-1.5 truncate">
              {session.meetingType === "online" ? (
                <>
                  <FaVideo className="text-[#D3A16D] shrink-0" /> Online
                </>
              ) : (
                <>
                  <FaMapMarkerAlt className="text-[#D3A16D] shrink-0" />
                  <span className="truncate">
                    {session.location || "On-site"}
                  </span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1 text-[#994D35] font-semibold group-hover:gap-2 transition-all">
              Details <FaArrowRight className="text-[10px]" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ============================================================
   LIST ROW (Single Row Layout)
   ============================================================ */
const SessionListRow = ({ session }) => {
  const banner = session.sessionThumbnail?.url || DEFAULT_BANNER;
  const statusConfig = getStatusConfig(session.sessionStatus);

  return (
    <Link href={`/sessions/${session._id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#3D444C]/10 hover:shadow-lg hover:border-[#D3A16D]/40 transition-all duration-300 flex flex-row">
        {/* Thumbnail (left, compact on all screens) */}
        <div className="relative w-28 sm:w-56 md:w-72 shrink-0 bg-[#3D444C]/10 overflow-hidden">
          <Image
            src={banner}
            alt={session.sessionTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 112px, (max-width: 768px) 224px, 288px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#3D444C]/10" />
        </div>

        {/* Content (right) */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 flex flex-col justify-between">
          {/* Top: badges + date */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#3D444C]/10 text-[#3D444C] text-[10px] sm:text-xs rounded-full font-semibold uppercase tracking-wide">
                {session.sessionType}
              </span>
              <span
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full font-bold ${statusConfig.bg} ${statusConfig.text}`}
              >
                {statusConfig.label}
              </span>
              {session.isFeatured && (
                <span className="p-1 bg-[#D3A16D] text-[#3D444C] rounded-full">
                  <FaStar className="text-[8px] sm:text-[10px]" />
                </span>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#3D444C]/60 mb-1.5">
              <FaCalendar className="text-[#D3A16D]" />
              {format(new Date(session.sessionDate), "MMM d, yyyy")}
              {session.sessionDay && ` • ${session.sessionDay}`}
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-lg font-bold text-[#3D444C] mb-1 group-hover:text-[#994D35] transition-colors line-clamp-2">
              {session.sessionTitle}
            </h3>

            {/* Description (hide on very small screens to keep compact) */}
            <p className="hidden sm:block text-[#3D444C]/70 text-sm mb-3 line-clamp-2">
              {session.sessionDescription?.replace(/<[^>]*>?/gm, "")}
            </p>
          </div>

          {/* Bottom info */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 sm:pt-3 border-t border-[#3D444C]/10 text-[10px] sm:text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[#3D444C]/70">
              <span className="flex items-center gap-1">
                {session.meetingType === "online" ? (
                  <>
                    <FaVideo className="text-[#D3A16D]" /> Online
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt className="text-[#D3A16D]" />
                    <span className="truncate max-w-[100px] sm:max-w-[160px]">
                      {session.location || "On-site"}
                    </span>
                  </>
                )}
              </span>
              {session.preResources?.length > 0 && (
                <span className="hidden sm:flex items-center gap-1">
                  <FaFilePdf className="text-[#994D35]" />
                  {session.preResources.length} resource
                  {session.preResources.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <span className="flex items-center gap-1 text-[#994D35] font-semibold group-hover:gap-2 transition-all">
              Details <FaArrowRight className="text-[8px] sm:text-[10px]" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ============================================================
   HELPERS
   ============================================================ */
const getStatusConfig = (status) => {
  switch (status) {
    case "upcoming":
      return { label: "Upcoming", bg: "bg-[#D3A16D]", text: "text-[#3D444C]" };
    case "completed":
      return { label: "Completed", bg: "bg-green-500", text: "text-white" };
    case "cancelled":
      return { label: "Cancelled", bg: "bg-red-500", text: "text-white" };
    default:
      return { label: status, bg: "bg-gray-400", text: "text-white" };
  }
};

export default UserClientSessions;
