// app/components/home/HomeFeatured.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowRight,
  FaClock,
  FaVideo,
  FaStar,
} from "react-icons/fa";
import { MdOutlineEmojiEvents } from "react-icons/md";
import { FaUsersViewfinder } from "react-icons/fa6";

const FALLBACK_EVENT =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790148020/event-invitation_alzpch.jpg";
const FALLBACK_SESSION =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const HomeFeatured = () => {
  const [data, setData] = useState({ events: [], sessions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users/home-page/featured", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!cancelled && json.success) {
          setData({
            events: json.events || [],
            sessions: json.sessions || [],
          });
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { events, sessions } = data;
  const hasEvents = events.length > 0;
  const hasSessions = sessions.length > 0;

  if (!loading && !hasEvents && !hasSessions) return null;
  if (loading) return null;

  // Merge into one stream. Tag each item so the card knows its variant.
  const combined = [
    ...events.map((e) => ({ ...e, variant: "event" })),
    ...sessions.map((s) => ({ ...s, variant: "session" })),
  ];

  return (
    <section className="w-full mt-6">
      <FeaturedBand items={combined} />
    </section>
  );
};

// =============================================================
// Animated particle canvas — lightweight, 30fps cap
// =============================================================
const ParticleField = ({ color = "211, 161, 109", density = 50 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let rafId;
    let particles = [];
    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: density }, () => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.5 + 0.2,
      }));
    };

    const draw = (t) => {
      rafId = requestAnimationFrame(draw);
      if (t - lastFrame < FRAME_INTERVAL) return;
      lastFrame = t;

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.a})`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 120 * 120) {
            const alpha = (1 - Math.sqrt(dist2) / 120) * 0.12;
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    resize();
    rafId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [color, density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

// =============================================================
// Single unified band — events + sessions in one stream
// =============================================================
const FeaturedBand = ({ items }) => {
  return (
    <div className="relative w-full overflow-hidden bg-[#2A3038]">
      {/* Aurora glows — dual warm tones since this covers both kinds */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 10% 0%, rgba(153, 77, 53, 0.55), transparent 60%),
            radial-gradient(ellipse 55% 70% at 90% 100%, rgba(211, 161, 109, 0.45), transparent 60%),
            radial-gradient(ellipse 40% 60% at 50% 50%, rgba(61,68,76,0.6), transparent 70%)
          `,
        }}
      />

      {/* Particles */}
      <ParticleField color="211, 161, 109" density={55} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #D3A16D 1px, transparent 1px), linear-gradient(to bottom, #D3A16D 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent 75%)",
        }}
      />

      {/* Top & bottom accents */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D3A16D]/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D3A16D]/40 to-transparent" />

      {/* ---- Content ---- */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Unified header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#994D35] to-[#D3A16D] text-[#E7E3D8] shadow-[0_0_30px_-5px_rgba(211,161,109,0.7)]">
            <MdOutlineEmojiEvents className="text-xl" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#D3A16D]">
                Happening Now
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#E7E3D8] leading-tight">
              Featured Events & Sessions
            </h2>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {items.map((item) => (
            <FeaturedCardBig
              key={`${item.kind}-${item._id}`}
              item={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// =============================================================
// Bigger card — large image, horizontal layout
// =============================================================
const FeaturedCardBig = ({ item }) => {
  const href =
    item.kind === "event" ? `/events/${item._id}` : `/sessions/${item._id}`;
  const isOnline = item.kind === "session" && item.meetingType === "online";
  const isEvent = item.variant === "event";

  const defaultImage = isEvent ? FALLBACK_EVENT : FALLBACK_SESSION;

  const statusPill =
    item.status === "upcoming"
      ? "bg-green-500/95 text-white shadow-[0_0_15px_-2px_rgba(34,197,94,0.6)]"
      : item.status === "completed"
        ? "bg-[#E7E3D8]/20 text-[#E7E3D8] border border-[#E7E3D8]/30"
        : "bg-red-500/95 text-white shadow-[0_0_15px_-2px_rgba(239,68,68,0.6)]";

  const typePill = isEvent
    ? "bg-[#994D35]/90 text-[#E7E3D8] border border-[#994D35]/60"
    : "bg-[#D3A16D]/90 text-[#3D444C] border border-[#D3A16D]/60";

  const accentColor = isEvent ? "#994D35" : "#D3A16D";
  const accentColorHover = isEvent ? "#D3A16D" : "#E7E3D8";

  return (
    <Link
      href={href}
      className="group relative flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-[#D3A16D]/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{
        boxShadow:
          "0 8px 32px -12px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Hover shimmer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at var(--x,50%) var(--y,50%), ${accentColor}22, transparent 40%)`,
        }}
      />

      {/* ---------- BIG thumbnail ---------- */}
      <div className="relative w-full sm:w-[200px] md:w-[220px] lg:w-[240px] aspect-[4/3] sm:aspect-auto sm:h-[180px] lg:h-[200px] rounded-xl overflow-hidden bg-[#E7E3D8] shrink-0 ring-1 ring-white/15">
        <Image
          src={item.thumbnail || defaultImage}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          sizes="(max-width: 640px) 100vw, 240px"
        />
        {/* Bottom gradient for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {/* Featured star */}
        <div
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/20"
          style={{ backgroundColor: accentColorHover }}
        >
          <FaStar className="text-[10px] text-[#3D444C]" />
        </div>
        {/* Kind badge bottom-left on image */}
        <div className="absolute bottom-2.5 left-2.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md backdrop-blur-sm ${typePill}`}
          >
            {isEvent ? "Event" : "Session"}
          </span>
        </div>
      </div>

      {/* ---------- Info ---------- */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          {/* Row 1: type + status */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D3A16D]">
              {item.type || item.kind}
            </span>
            {isOnline && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-100 bg-purple-500/40 border border-purple-300/40 px-2 py-0.5 rounded-md">
                <FaVideo className="text-[8px]" /> ONLINE
              </span>
            )}
            {item.status && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${statusPill}`}
              >
                {item.status}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-[#E7E3D8] text-lg sm:text-xl leading-snug line-clamp-2 group-hover:text-[#D3A16D] transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Meta */}
        <div className="mt-3 space-y-1.5 text-[12px] text-[#E7E3D8]/70">
          {item.date && (
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-[#D3A16D] text-[10px]" />
              <span className="font-medium text-[#E7E3D8]/85">
                {formatDate(item.date)}
              </span>
              {item.day && (
                <>
                  <span className="text-[#E7E3D8]/30">•</span>
                  <span>{item.day}</span>
                </>
              )}
            </div>
          )}
          {!isOnline && item.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-[#D3A16D] text-[10px] shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {isOnline && (
            <div className="flex items-center gap-2 text-purple-200">
              <FaVideo className="text-[10px]" />
              <span>Online session</span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute top-4 right-4 sm:static sm:flex sm:items-center">
        <div
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:translate-x-0.5"
          style={{
            backgroundColor: accentColor,
            color: "#E7E3D8",
            boxShadow: `0 0 20px -4px ${accentColor}`,
          }}
        >
          <FaArrowRight className="text-[11px]" />
        </div>
      </div>
    </Link>
  );
};

export default HomeFeatured;