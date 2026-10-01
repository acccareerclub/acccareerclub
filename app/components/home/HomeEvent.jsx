// app/components/home/HomeEvents.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaClock,
  FaUsers,
  FaStar,
} from "react-icons/fa";

const EVENT_TYPE_LABELS = {
  workshop: "Workshop",
  seminar: "Seminar",
  webinar: "Webinar",
  meeting: "Meeting",
  training: "Training",
  competition: "Competition",
  "talent hunt": "Talent Hunt",
  other: "Event",
};

const STATUS_STYLES = {
  upcoming: {
    badge: "bg-[#D3A16D]/20 text-[#D3A16D] border-[#D3A16D]/40",
    label: "Upcoming",
  },
  completed: {
    badge: "bg-green-500/20 text-green-400 border-green-500/40",
    label: "Completed",
  },
  cancelled: {
    badge: "bg-red-500/20 text-red-400 border-red-500/40",
    label: "Cancelled",
  },
};

const HomeEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/users/home/events", {
          next: { revalidate: 60 },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && events.length === 0) return null;

  return (
    <section className="relative bg-[#E7E3D8] py-16 sm:py-20 overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-20 -right-32 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-20 -left-32 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#994D35] mb-2">
              What&apos;s Happening
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D444C]">
              Glance of <span className="text-[#994D35]">Events</span>
            </h2>
            <p className="text-[#3D444C]/60 mt-2 max-w-xl text-sm sm:text-base">
              Workshops, competitions, seminars and more — join us at our next
              event.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#994D35] hover:text-[#3D444C] transition-colors group whitespace-nowrap"
          >
            View all events
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ==================== GRID ==================== */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <ViewAllCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {events.slice(0, 2).map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
            <ViewAllCard />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeEvents;

// =====================================================================
// Event Card
// =====================================================================
const EventCard = ({ event }) => {
  const eventDate = event.eventDate ? new Date(event.eventDate) : null;

  const dateDay = eventDate
    ? eventDate.toLocaleDateString("en-US", { day: "2-digit" })
    : "—";
  const dateMonth = eventDate
    ? eventDate.toLocaleDateString("en-US", { month: "short" })
    : "";
  const dateYear = eventDate ? eventDate.getFullYear() : "";

  const longDate = eventDate
    ? eventDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date to be announced";

  const typeLabel =
    EVENT_TYPE_LABELS[event.eventType] || EVENT_TYPE_LABELS.other;
  const status = STATUS_STYLES[event.eventStatus] || STATUS_STYLES.upcoming;

  const excerpt = event.eventDescription
    ? event.eventDescription
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 130) + "…"
    : "Click to learn more about this event.";

  const thumbnail =
    event.eventThumbnail?.url ||
    "https://res.cloudinary.com/ffuatrrt/image/upload/v1790148020/event-invitation_alzpch.jpg";

  return (
    <Link
      href={`/events/${event._id}`}
      className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-32 sm:h-44 md:h-52 lg:h-56 bg-[#3D444C] overflow-hidden">
        <Image
          src={thumbnail}
          alt={event.eventTitle}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
          <span
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${status.badge}`}
          >
            {status.label}
          </span>
        </div>

        {/* Featured star */}
        {event.isFeatured && (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
            <span className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-[#D3A16D] flex items-center justify-center shadow-lg">
              <FaStar className="text-white text-[8px] sm:text-xs" />
            </span>
          </div>
        )}

        {/* Event type badge — hidden on smallest screens to save space */}
        <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 hidden xs:block sm:block">
          <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/95 backdrop-blur-sm text-[#994D35] border border-[#D3A16D]/40">
            {typeLabel}
          </span>
        </div>

        {/* Date block */}
        {eventDate && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden w-[38px] sm:w-[58px] text-center">
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
        <h3 className="font-bold text-[#3D444C] text-xs sm:text-base md:text-lg leading-snug mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 group-hover:text-[#994D35] transition-colors">
          {event.eventTitle}
        </h3>

        {/* Meta: date & location */}
        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm">
          <div className="flex items-start gap-1 sm:gap-2 text-[#3D444C]/70">
            <FaCalendarAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
            <span className="line-clamp-1">
              {event.eventDay ? `${event.eventDay}, ` : ""}
              {longDate}
            </span>
          </div>
          {event.location && (
            <div className="flex items-start gap-1 sm:gap-2 text-[#3D444C]/70">
              <FaMapMarkerAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>

        {/* Excerpt — hidden on mobile to keep cards compact */}
        <p className="hidden sm:block text-xs md:text-sm text-[#3D444C]/60 leading-relaxed mb-3 md:mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-2 sm:pt-3 md:pt-4 border-t border-[#3D444C]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          {event.preRegistrationRequired ? (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#994D35]/10 text-[#994D35] border border-[#994D35]/20 self-start">
              <FaUsers className="text-[7px] sm:text-[9px]" />
              <span className="hidden xs:inline">Pre-registration</span>
              <span className="xs:hidden">Pre-reg</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-green-500/10 text-green-700 border border-green-500/20 self-start">
              Open to all
            </span>
          )}

          <span className="text-[#994D35] text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 group-hover:gap-1.5 sm:group-hover:gap-2 transition-all self-end sm:self-auto">
            Details <FaArrowRight className="text-[8px] sm:text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// Skeleton Loader
// =====================================================================
const EventCardSkeleton = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 animate-pulse">
    {/* Thumbnail area */}
    <div className="relative w-full h-32 sm:h-44 md:h-52 lg:h-56 bg-[#3D444C]/20">
      <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 h-4 sm:h-6 w-12 sm:w-20 rounded-full bg-white/40" />
      <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 h-4 sm:h-6 w-14 sm:w-24 rounded-full bg-white/40" />
      <div className="absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 h-[38px] sm:h-[58px] w-[38px] sm:w-[58px] rounded-lg sm:rounded-xl bg-white/60" />
    </div>

    {/* Body */}
    <div className="p-2.5 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
      {/* Title */}
      <div className="h-3.5 sm:h-5 w-4/5 rounded bg-[#3D444C]/10" />
      <div className="h-3.5 sm:h-5 w-3/5 rounded bg-[#3D444C]/10" />

      {/* Meta */}
      <div className="space-y-1.5 sm:space-y-2 pt-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#3D444C]/10" />
          <div className="h-2.5 sm:h-3 w-2/3 rounded bg-[#3D444C]/10" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-[#3D444C]/10" />
          <div className="h-2.5 sm:h-3 w-1/2 rounded bg-[#3D444C]/10" />
        </div>
      </div>

      {/* Excerpt — hidden on mobile */}
      <div className="hidden sm:block space-y-2 pt-2">
        <div className="h-3 w-full rounded bg-[#3D444C]/10" />
        <div className="h-3 w-5/6 rounded bg-[#3D444C]/10" />
      </div>

      {/* Footer */}
      <div className="pt-2 sm:pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
        <div className="h-4 sm:h-6 w-14 sm:w-24 rounded-full bg-[#3D444C]/10" />
        <div className="h-2.5 sm:h-3 w-10 sm:w-16 rounded bg-[#3D444C]/10" />
      </div>
    </div>
  </div>
);

// =====================================================================
// View All Card — sits in the grid as a 3rd tile
// =====================================================================
const ViewAllCard = () => {
  return (
    <Link
      href="/events"
      className="group relative bg-gradient-to-br from-[#3D444C] to-[#2a3037] rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col items-center justify-center text-center min-h-[260px] sm:min-h-[340px] md:min-h-[420px] p-4 sm:p-6 md:p-8"
    >
      <div className="absolute w-[200px] h-[200px] rounded-full bg-[#D3A16D] opacity-20 blur-3xl -top-16 -right-16 pointer-events-none group-hover:opacity-30 transition-opacity" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#994D35] opacity-20 blur-3xl -bottom-16 -left-16 pointer-events-none group-hover:opacity-30 transition-opacity" />

      {/* Icon ring */}
      <div className="relative mb-3 sm:mb-4 md:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#D3A16D]/15 border-2 border-[#D3A16D]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <FaArrowRight className="text-[#D3A16D] text-base sm:text-xl md:text-2xl" />
        </div>
      </div>

      <div className="relative">
        <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-1 sm:mb-2">
          Explore More
        </p>
        <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#E7E3D8] mb-2 sm:mb-3 leading-tight">
          View All
          <br />
          Events
        </h3>
        <p className="hidden sm:block text-xs md:text-sm text-[#E7E3D8]/60 max-w-[220px] mx-auto leading-relaxed">
          Browse our complete archive — past, present, and upcoming.
        </p>
      </div>

      <span className="relative mt-4 sm:mt-6 md:mt-8 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full bg-[#D3A16D] text-[#3D444C] font-bold text-[10px] sm:text-sm group-hover:bg-[#E7E3D8] transition-colors">
        See All
        <FaArrowRight className="text-[8px] sm:text-xs group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
};

// =====================================================================
// View All Card — Skeleton
// =====================================================================
const ViewAllCardSkeleton = () => (
  <div className="relative bg-[#3D444C] rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 flex flex-col items-center justify-center text-center min-h-[260px] sm:min-h-[340px] md:min-h-[420px] p-4 sm:p-6 md:p-8 animate-pulse">
    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 mb-3 sm:mb-4 md:mb-6" />

    <div className="h-2.5 sm:h-3 w-20 sm:w-24 rounded bg-white/10 mb-2 sm:mb-3" />

    <div className="h-4 sm:h-6 w-24 sm:w-32 rounded bg-white/15 mb-1.5 sm:mb-2" />
    <div className="h-4 sm:h-6 w-20 sm:w-24 rounded bg-white/15 mb-3 sm:mb-4" />

    <div className="hidden sm:block h-3 w-44 rounded bg-white/10 mb-1" />
    <div className="hidden sm:block h-3 w-36 rounded bg-white/10" />

    <div className="mt-4 sm:mt-6 md:mt-8 h-7 sm:h-10 w-20 sm:w-28 rounded-full bg-white/15" />
  </div>
);