// app/events/EventsClient.jsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSearch,
  FaUsers,
  FaTrophy,
  FaMicrophone,
  FaExclamationTriangle,
} from "react-icons/fa";

const PAGE_SIZE = 20;

// ==========================================
// COLOR PALETTE
// ==========================================
const COLORS = {
  bg: "#E7E3D8",
  card: "#FFFFFF",
  primary: "#3D444C",
  accent: "#D3A16D",
  accentDark: "#994D35",
  success: "#059669",
  danger: "#DC2626",
  shimmer: "#F2EFE6",
  shimmerHi: "#FFFFFF",
};

// ==========================================
// TYPE META (icon + label + color)
// ==========================================
const TYPE_META = {
  workshop: { label: "Workshop", emoji: "🛠️" },
  seminar: { label: "Seminar", emoji: "🎓" },
  webinar: { label: "Webinar", emoji: "💻" },
  meeting: { label: "Meeting", emoji: "🤝" },
  training: { label: "Training", emoji: "📈" },
  competition: { label: "Competition", emoji: "🏆" },
  "talent hunt": { label: "Talent Hunt", emoji: "⭐" },
  other: { label: "Event", emoji: "📌" },
};

// ==========================================
// MAIN
// ==========================================
const EventsClient = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ==========================================
  // DEBOUNCE SEARCH
  // ==========================================
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ==========================================
  // FETCH (initial or reset)
  // ==========================================
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: "0",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/users/events?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setEvents(data.events || []);
        setHasMore(!!data.hasMore);
        setTotal(data.total || 0);
      } else {
        setError(data.message || "Failed to load events");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterType, filterStatus]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ==========================================
  // LOAD MORE
  // ==========================================
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: String(events.length),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/users/events?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setEvents((prev) => {
          const seen = new Set(prev.map((e) => e._id));
          const merged = [...prev];
          for (const e of data.events || []) {
            if (!seen.has(e._id)) {
              seen.add(e._id);
              merged.push(e);
            }
          }
          return merged;
        });
        setHasMore(!!data.hasMore);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load more events");
    } finally {
      setLoadingMore(false);
    }
  }, [events.length, debouncedSearch, filterType, filterStatus, hasMore, loadingMore]);

  // ==========================================
  // SPLIT INTO UPCOMING / PAST (visual sections)
  // ==========================================
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up = [];
    const pst = [];
    for (const e of events) {
      const d = e.eventDate ? new Date(e.eventDate).getTime() : Infinity;
      if (d >= now) up.push(e);
      else pst.push(e);
    }
    return { upcoming: up, past: pst };
  }, [events]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: COLORS.bg }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{
              background: `${COLORS.accent}25`,
              color: COLORS.accentDark,
            }}
          >
            ACC Career Club
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ color: COLORS.primary }}
          >
            Events & Programs
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Explore our workshops, seminars, competitions, and more — designed
            to help you grow academically and professionally.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={12}
              />
              <input
                type="text"
                placeholder="Search events by title, description, or location…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D444C] focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg capitalize"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_META).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg capitalize"
            >
              <option value="">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState hasFilters={!!(debouncedSearch || filterType || filterStatus)} />
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  label="Upcoming Events"
                  count={upcoming.length}
                  dotColor={COLORS.success}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {upcoming.map((ev) => (
                    <EventCard key={ev._id} event={ev} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <SectionHeading
                  label="Past Events"
                  count={past.length}
                  dotColor={`${COLORS.primary}80`}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {past.map((ev) => (
                    <EventCard key={ev._id} event={ev} />
                  ))}
                </div>
              </section>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-xl font-semibold text-white shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  style={{ background: COLORS.primary }}
                >
                  {loadingMore ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>Load More ({events.length} / {total})</>
                  )}
                </button>
              </div>
            )}

            {!hasMore && total > PAGE_SIZE && (
              <p className="mt-10 text-center text-xs text-gray-500">
                All {total} events loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// SECTION HEADING
// ==========================================
const SectionHeading = ({ label, count, dotColor }) => (
  <div className="flex items-center gap-3 mb-4">
    <span
      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: dotColor }}
    />
    <h2
      className="text-lg sm:text-xl font-bold"
      style={{ color: COLORS.primary }}
    >
      {label}
    </h2>
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: `${COLORS.accent}25`,
        color: COLORS.accentDark,
      }}
    >
      {count}
    </span>
  </div>
);

// ==========================================
// EVENT CARD
// ==========================================
const EventCard = ({ event }) => {
  const typeMeta = TYPE_META[event.eventType] || TYPE_META.other;
  const date = event.eventDate ? new Date(event.eventDate) : null;
  const isPast = date && date.getTime() < Date.now();
  const isCancelled = event.eventStatus === "cancelled";

  return (
    <Link
      href={`/events/${event._id}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {event.eventThumbnail?.url ? (
          <Image
            src={event.eventThumbnail.url}
            alt={event.eventTitle}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl"
            style={{ background: `${COLORS.accent}20` }}
          >
            {typeMeta.emoji}
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
          {isCancelled ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-red-100 text-red-700 backdrop-blur">
              Cancelled
            </span>
          ) : isPast ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-gray-100 text-gray-700 backdrop-blur">
              Past
            </span>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-green-100 text-green-700 backdrop-blur">
              Upcoming
            </span>
          )}
          {event.isFeatured && (
            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 backdrop-blur">
              ★ Featured
            </span>
          )}
        </div>

        {/* Type chip bottom-right */}
        <div className="absolute bottom-3 right-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full text-white backdrop-blur"
            style={{ background: `${COLORS.primary}CC` }}
          >
            {typeMeta.emoji} {typeMeta.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title */}
        <h3
          className="text-base font-bold leading-tight line-clamp-2 mb-2"
          style={{ color: COLORS.primary }}
        >
          {event.eventTitle}
        </h3>

        {/* Date + location */}
        <div className="space-y-1.5 mb-3">
          {date && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FaCalendarAlt
                size={11}
                className="flex-shrink-0"
                style={{ color: COLORS.accentDark }}
              />
              <span>
                {date.toLocaleDateString(undefined, {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FaMapMarkerAlt
                size={11}
                className="flex-shrink-0"
                style={{ color: COLORS.accentDark }}
              />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Counts */}
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          {event.attendeeCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <FaUsers size={10} /> {event.attendeeCount}
            </span>
          )}
          {event.achieverCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <FaTrophy size={10} /> {event.achieverCount}
            </span>
          )}
          {event.speakerAvailable && (
            <span className="inline-flex items-center gap-1">
              <FaMicrophone size={10} /> Speaker
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ==========================================
// EMPTY STATE
// ==========================================
const EmptyState = ({ hasFilters }) => (
  <div className="bg-white rounded-2xl shadow-md p-16 text-center">
    <p className="text-4xl mb-4">📅</p>
    <p className="text-lg font-medium" style={{ color: COLORS.primary }}>
      {hasFilters ? "No events match your filters" : "No events yet"}
    </p>
    <p className="text-sm text-gray-500 mt-1">
      {hasFilters
        ? "Try clearing the search or filters above."
        : "Check back soon for upcoming events."}
    </p>
  </div>
);

// ==========================================
// SHIMMER
// ==========================================
const ShimmerCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white shadow-md">
    <div
      className="aspect-video w-full"
      style={{
        background: `linear-gradient(90deg, ${COLORS.shimmer} 0%, ${COLORS.shimmerHi} 50%, ${COLORS.shimmer} 100%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
      }}
    />
    <div className="p-4 space-y-2">
      <ShimmerBlock className="h-4 w-3/4" />
      <ShimmerBlock className="h-3 w-1/2" />
      <ShimmerBlock className="h-3 w-2/3" />
    </div>
  </div>
);

const ShimmerBlock = ({ className = "" }) => (
  <div
    className={`rounded ${className}`}
    style={{
      background: `linear-gradient(90deg, ${COLORS.shimmer} 0%, ${COLORS.shimmerHi} 50%, ${COLORS.shimmer} 100%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s ease-in-out infinite",
    }}
  />
);

// ==========================================
// GLOBAL KEYFRAMES
// ==========================================
if (typeof document !== "undefined") {
  const styleId = "events-shimmer-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
    document.head.appendChild(style);
  }
}

export default EventsClient;