// app/components/home/HomeJobs.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaArrowRight,
  FaBriefcase,
  FaClock,
  FaBuilding,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaFire,
} from "react-icons/fa";

const SECTOR_LABELS = {
  government: "Government",
  private: "Private",
  ngo: "NGO",
  international: "International",
  autonomous: "Autonomous",
};

const SECTOR_STYLES = {
  government: "bg-red-500/15 text-red-300 border-red-500/40",
  private: "bg-[#D3A16D]/15 text-[#D3A16D] border-[#D3A16D]/40",
  ngo: "bg-purple-500/15 text-purple-300 border-purple-500/40",
  international: "bg-green-500/15 text-green-300 border-green-500/40",
  autonomous: "bg-amber-500/15 text-amber-300 border-amber-500/40",
};

const EMPLOYMENT_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
  temporary: "Temporary",
};

const HomeJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/users/home/jobs", {
          next: { revalidate: 60 },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && jobs.length === 0) return null;

  return (
    <section className="relative bg-[#3D444C] py-16 sm:py-20 overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-20 -left-32 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#994D35] opacity-15 blur-3xl -bottom-20 -right-32 pointer-events-none" />

      {/* Subtle grid pattern */}
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-2 flex items-center gap-2">
              <FaFire /> Closest Deadlines
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#E7E3D8]">
              Latest <span className="text-[#D3A16D]">Jobs</span>
            </h2>
            <p className="text-[#E7E3D8]/60 mt-2 max-w-xl text-sm sm:text-base">
              Government, private and NGO opportunities — refreshed regularly.
              Apply before the deadline.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#D3A16D] hover:text-[#E7E3D8] transition-colors group whitespace-nowrap"
          >
            View all jobs
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ==================== GRID ==================== */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <ViewAllCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {jobs.slice(0, 2).map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
            <ViewAllCard />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeJobs;

// =====================================================================
// Job Card — DARK variant
// =====================================================================
const JobCard = ({ job }) => {
  const sectorLabel = SECTOR_LABELS[job.sector] || job.sector;
  const sectorStyle = SECTOR_STYLES[job.sector] || SECTOR_STYLES.private;
  const employmentLabel =
    EMPLOYMENT_LABELS[job.employmentType] || job.employmentType;

  const thumbnail = job.images?.[0]?.url;

  // ----- Deadline logic -----
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline)
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining = deadline
    ? Math.max(
        0,
        Math.ceil((deadline.getTime() - today.getTime()) / 86400000),
      )
    : null;

  let urgency = null;
  if (daysRemaining !== null) {
    if (daysRemaining <= 3) urgency = "critical";
    else if (daysRemaining <= 7) urgency = "soon";
    else urgency = "normal";
  }

  const urgencyBadge = {
    critical: "bg-red-500/20 text-red-300 border-red-500/40",
    soon: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    normal: "bg-[#D3A16D]/20 text-[#D3A16D] border-[#D3A16D]/40",
  };

  const deadlineStr = deadline
    ? deadline.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const cardHref = job.slug ? `/jobs/${job.slug}` : job.applyLink || "#";

  return (
    <Link
      href={cardHref}
      className="group bg-[#2f353c] rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#E7E3D8]/10 hover:border-[#D3A16D]/40 flex flex-col"
    >
      {/* Thumbnail / placeholder */}
      <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-52 bg-[#2a3037] overflow-hidden">
        {thumbnail ? (
          <>
            <Image
              src={thumbnail}
              alt={job.jobTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2f353c] via-[#3D444C]/20 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(#D3A16D 1px, transparent 1px), linear-gradient(90deg, #D3A16D 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <FaBriefcase className="text-[#D3A16D]/60 text-3xl sm:text-4xl md:text-5xl relative z-10" />
          </div>
        )}

        {/* Sector badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
          <span
            className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${sectorStyle}`}
          >
            {sectorLabel}
          </span>
        </div>

        {/* Deadline urgency pill */}
        {deadlineStr && (
          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
            <span
              className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${
                urgencyBadge[urgency] || urgencyBadge.normal
              }`}
            >
              <FaClock className="text-[7px] sm:text-[8px]" />
              {daysRemaining === 0
                ? "Today"
                : daysRemaining === 1
                  ? "1 day"
                  : `${daysRemaining}d`}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col">
        {/* Category + employment type row */}
        <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 text-[9px] sm:text-xs">
          <span className="text-[#D3A16D] font-semibold uppercase tracking-wider truncate">
            {job.category}
          </span>
          <span className="text-[#E7E3D8]/20 shrink-0">•</span>
          <span className="text-[#E7E3D8]/60 truncate">{employmentLabel}</span>
        </div>

        <h3 className="font-bold text-[#E7E3D8] text-xs sm:text-base md:text-lg leading-snug mb-1.5 sm:mb-2 md:mb-3 line-clamp-2 group-hover:text-[#D3A16D] transition-colors">
          {job.jobTitle}
        </h3>

        {/* Meta */}
        <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 md:mb-4 text-[10px] sm:text-xs md:text-sm">
          {job.location && (
            <div className="flex items-start gap-1 sm:gap-2 text-[#E7E3D8]/70">
              <FaMapMarkerAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
              <span className="line-clamp-1">
                {job.location}
                {job.division ? ` • ${job.division}` : ""}
              </span>
            </div>
          )}
          {deadlineStr && (
            <div className="flex items-start gap-1 sm:gap-2 text-[#E7E3D8]/70">
              <FaCalendarAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-[9px] sm:text-xs" />
              <span className="line-clamp-1">
                <span className="hidden sm:inline">Deadline: </span>
                {deadlineStr}
              </span>
            </div>
          )}
        </div>

        {/* Tags — hidden on mobile to save space */}
        {job.tags?.length > 0 && (
          <div className="hidden sm:flex flex-wrap gap-1.5 mb-3 md:mb-4">
            {job.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-[#E7E3D8]/10 text-[#E7E3D8]/60 text-[10px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-2 sm:pt-3 md:pt-4 border-t border-[#E7E3D8]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#D3A16D]/15 text-[#D3A16D] border border-[#D3A16D]/30 self-start truncate">
            <FaBriefcase className="text-[7px] sm:text-[9px] shrink-0" />
            <span className="truncate">
              {SECTOR_LABELS[job.sector] || "Job"}
            </span>
          </span>

          <span className="text-[#D3A16D] text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 group-hover:gap-1.5 sm:group-hover:gap-2 transition-all self-end sm:self-auto shrink-0">
            View <FaArrowRight className="text-[8px] sm:text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// View All Card — DARK section variant (gold→rust gradient)
// =====================================================================
const ViewAllCard = () => {
  return (
    <Link
      href="/jobs"
      className="group relative bg-gradient-to-br from-[#D3A16D] to-[#994D35] rounded-xl sm:rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#D3A16D]/30 flex flex-col items-center justify-center text-center min-h-[260px] sm:min-h-[340px] md:min-h-[420px] p-4 sm:p-6 md:p-8"
    >
      {/* Decorative blurs */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-[#E7E3D8] opacity-20 blur-3xl -top-16 -right-16 pointer-events-none group-hover:opacity-30 transition-opacity" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#3D444C] opacity-20 blur-3xl -bottom-16 -left-16 pointer-events-none group-hover:opacity-30 transition-opacity" />

      {/* Icon ring */}
      <div className="relative mb-3 sm:mb-4 md:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-[#3D444C]/20 border-2 border-[#E7E3D8]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <FaBriefcase className="text-[#E7E3D8] text-base sm:text-xl md:text-2xl" />
        </div>
      </div>

      <div className="relative">
        <p className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-[#3D444C]/70 mb-1 sm:mb-2">
          Explore More
        </p>
        <h3 className="text-base sm:text-xl md:text-2xl font-extrabold text-[#E7E3D8] mb-2 sm:mb-3 leading-tight drop-shadow-sm">
          View All
          <br />
          Jobs
        </h3>
        <p className="hidden sm:block text-xs md:text-sm text-[#E7E3D8]/80 max-w-[220px] mx-auto leading-relaxed">
          Browse every open circular — filtered by sector, category and
          location.
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
// Job Card — Skeleton
// =====================================================================
const JobCardSkeleton = () => (
  <div className="bg-[#2f353c] rounded-xl sm:rounded-2xl shadow-md overflow-hidden border border-[#E7E3D8]/10 animate-pulse">
    {/* Thumbnail area */}
    <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-52 bg-[#E7E3D8]/10">
      <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 h-4 sm:h-6 w-12 sm:w-20 rounded-full bg-[#E7E3D8]/15" />
      <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 h-4 sm:h-6 w-14 sm:w-24 rounded-full bg-[#E7E3D8]/15" />
    </div>

    {/* Body */}
    <div className="p-2.5 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
      {/* Category row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="h-2.5 sm:h-3 w-12 sm:w-20 rounded bg-[#E7E3D8]/15" />
        <div className="h-2.5 sm:h-3 w-10 sm:w-16 rounded bg-[#E7E3D8]/10" />
      </div>

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

      {/* Tags — hidden on mobile */}
      <div className="hidden sm:flex gap-2 pt-2">
        <div className="h-5 w-14 rounded-full bg-[#E7E3D8]/10" />
        <div className="h-5 w-16 rounded-full bg-[#E7E3D8]/10" />
      </div>

      {/* Footer */}
      <div className="pt-2 sm:pt-4 border-t border-[#E7E3D8]/10 flex items-center justify-between">
        <div className="h-4 sm:h-6 w-14 sm:w-24 rounded-full bg-[#E7E3D8]/10" />
        <div className="h-2.5 sm:h-3 w-8 sm:w-12 rounded bg-[#E7E3D8]/10" />
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