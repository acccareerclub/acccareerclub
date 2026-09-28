// app/jobs/[slug]/SingleJobClient.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaFire,
  FaExternalLinkAlt,
  FaShare,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaLink,
  FaCheck,
  FaBuilding,
  FaUsers,
  FaInfoCircle,
  FaCopy,
  FaPrint,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaArrowRight,
  FaTag,
} from "react-icons/fa";
import toast from "react-hot-toast";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://ccacc.vercel.app";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const SECTOR_LABELS = {
  government: "Government",
  private: "Private",
  ngo: "NGO",
  international: "International",
  autonomous: "Autonomous",
};

const SECTOR_COLORS = {
  government: "bg-red-100 text-red-700 border-red-300",
  private: "bg-blue-100 text-blue-700 border-blue-300",
  ngo: "bg-purple-100 text-purple-700 border-purple-300",
  international: "bg-green-100 text-green-700 border-green-300",
  autonomous: "bg-amber-100 text-amber-700 border-amber-300",
};

const EMPLOYMENT_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
  temporary: "Temporary",
};

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------
const SingleJobClient = ({ initialJob, initialRelated }) => {
  const router = useRouter();
  const job = initialJob;
  const related = initialRelated || [];

  const [copied, setCopied] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const contentRef = useRef(null);

  // ---------- Derived ----------
  const isWalkIn = job.applicationMode === "walk-in";
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline)
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysRemaining =
    job.daysRemaining !== null && job.daysRemaining !== undefined
      ? job.daysRemaining
      : deadline
        ? Math.max(
            0,
            Math.ceil((deadline.getTime() - today.getTime()) / 86400000),
          )
        : null;

  let urgency = "normal";
  if (daysRemaining !== null) {
    if (daysRemaining <= 3) urgency = "critical";
    else if (daysRemaining <= 7) urgency = "soon";
  }

  const urgencyPill = {
    critical: "bg-red-500/20 text-red-300 border-red-500/40",
    soon: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    normal: "bg-[#D3A16D]/20 text-[#D3A16D] border-[#D3A16D]/40",
  };

  const urgencyCard = {
    critical: "bg-red-50 border-red-200",
    soon: "bg-amber-50 border-amber-200",
    normal: "bg-[#E7E3D8] border-[#3D444C]/10",
  };

  const urgencyText = {
    critical: "text-red-700",
    soon: "text-amber-700",
    normal: "text-[#994D35]",
  };

  const deadlineStr = deadline
    ? deadline.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const primaryImage = job.images?.[0]?.url;
  const hasImages = job.images?.length > 0;
  const multipleImages = job.images?.length > 1;

  // ---------- Share ----------
  const shareUrl = `${SITE_URL}/jobs/${job.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shareFacebook = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
    );
  const shareTwitter = () =>
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(job.jobTitle)}`,
      "_blank",
    );
  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    );
  const shareWhatsApp = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(job.jobTitle + " " + shareUrl)}`,
      "_blank",
    );

  const handlePrint = () => window.print();

  // ---------- Gallery ----------
  const openGallery = (index) => {
    setGalleryIndex(index);
    setShowGallery(true);
  };
  const nextImage = () => {
    setGalleryIndex((i) => (i + 1) % job.images.length);
  };
  const prevImage = () => {
    setGalleryIndex((i) => (i - 1 + job.images.length) % job.images.length);
  };

  useEffect(() => {
    if (!showGallery) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowGallery(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGallery]);

  const deadlineCopy = isWalkIn
    ? {
        label: "Walk-in Date",
        icon: <FaClock />,
        helper:
          daysRemaining === 0
            ? "Walk-in is today"
            : daysRemaining === 1
              ? "Walk-in tomorrow"
              : `${daysRemaining} days until walk-in`,
      }
    : {
        label: "Apply Before",
        icon: <FaCalendarAlt />,
        helper:
          daysRemaining === 0
            ? "Last day to apply"
            : daysRemaining === 1
              ? "Only 1 day left"
              : `${daysRemaining} days remaining`,
      };

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* ==================== HERO ==================== */}
      <section className="relative bg-[#3D444C] text-[#E7E3D8] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-40 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#E7E3D8]/70 hover:text-[#D3A16D] transition-colors mb-8 text-sm font-medium"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                SECTOR_COLORS[job.sector] ||
                "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {SECTOR_LABELS[job.sector] || job.sector}
            </span>
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[#D3A16D]/20 border border-[#D3A16D]/40 text-[#D3A16D]">
              {job.category}
            </span>
            {deadlineStr && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${urgencyPill[urgency]}`}
              >
                {isWalkIn ? (
                  <>
                    <FaClock className="text-[10px]" /> Walk-in
                  </>
                ) : daysRemaining === 0 ? (
                  <>
                    <FaFire className="text-[10px]" /> Closes today
                  </>
                ) : daysRemaining === 1 ? (
                  <>
                    <FaClock className="text-[10px]" /> 1 day left
                  </>
                ) : (
                  <>
                    <FaClock className="text-[10px]" /> {daysRemaining} days left
                  </>
                )}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl">
            {job.jobTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#E7E3D8]/75">
            {job.location && (
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#D3A16D]" />
                <span className="font-medium">
                  {job.location}
                  {job.division ? `, ${job.division}` : ""}
                </span>
              </span>
            )}
            <span className="flex items-center gap-2">
              <FaBriefcase className="text-[#D3A16D]" />
              <span className="font-medium">
                {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}
              </span>
            </span>
            {job.postedBy?.fullName && (
              <span className="flex items-center gap-2">
                <FaBuilding className="text-[#D3A16D]" />
                <span className="font-medium">
                  Posted by {job.postedBy.fullName}
                </span>
              </span>
            )}
          </div>

          <div className="mt-8 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E7E3D8]/60 mr-2">
              <FaShare className="inline mr-1.5" /> Share
            </span>
            <ShareButton onClick={shareFacebook} label="Facebook">
              <FaFacebookF />
            </ShareButton>
            <ShareButton onClick={shareTwitter} label="Twitter">
              <FaTwitter />
            </ShareButton>
            <ShareButton onClick={shareLinkedIn} label="LinkedIn">
              <FaLinkedinIn />
            </ShareButton>
            <ShareButton onClick={shareWhatsApp} label="WhatsApp">
              <FaWhatsapp />
            </ShareButton>
            <ShareButton
              onClick={handleCopyLink}
              label="Copy link"
              className="hover:bg-[#D3A16D] hover:border-[#D3A16D] hover:text-[#3D444C]"
            >
              {copied ? <FaCheck /> : <FaLink />}
            </ShareButton>
          </div>
        </div>
      </section>

      {/* ==================== BODY ==================== */}
      {/* 
        FIX: Removed `-mt-16 sm:-mt-20` (negative margin that was causing 
        the columns to stack visually over the hero on mobile).
        Instead we now have a natural gap between hero and content.
      */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ---- SIDEBAR ---- */}
          {/* 
            FIX: Removed `lg:sticky lg:top-6` from the inner card.
            Sticky positioning was pulling the sidebar out of flow and 
            causing it to overlap the sections below (related jobs) on
            both mobile and desktop.
          */}
          <aside className="lg:col-span-4 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl border border-[#3D444C]/10 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#994D35] via-[#D3A16D] to-[#994D35]" />

              <div className="p-5 sm:p-6">
                {deadlineStr && (
                  <div
                    className={`rounded-xl p-4 mb-5 border ${urgencyCard[urgency]}`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 text-[#3D444C]/60 flex items-center gap-2">
                      {deadlineCopy.icon}
                      {deadlineCopy.label}
                    </p>
                    <p className="text-base sm:text-lg font-extrabold text-[#3D444C] leading-tight">
                      {deadlineStr}
                    </p>
                    {daysRemaining !== null && (
                      <p
                        className={`text-xs font-semibold mt-1.5 ${urgencyText[urgency]}`}
                      >
                        {deadlineCopy.helper}
                      </p>
                    )}
                  </div>
                )}

                {job.applyLink ? (
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#994D35] hover:bg-[#3D444C] text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                  >
                    <FaExternalLinkAlt />
                    Apply Now
                  </a>
                ) : (
                  <div className="w-full inline-flex items-center justify-center gap-2 bg-[#E7E3D8] text-[#3D444C] px-6 py-4 rounded-xl font-semibold text-sm border border-[#3D444C]/10 text-center leading-snug">
                    {isWalkIn
                      ? "Attend the walk-in interview at the venue"
                      : "No online apply link — see description"}
                  </div>
                )}

                <div className="my-6 h-px bg-[#3D444C]/10" />

                <h3 className="text-xs font-bold uppercase tracking-wider text-[#994D35] mb-4 flex items-center gap-2">
                  <FaInfoCircle /> Quick Info
                </h3>
                <div className="space-y-3.5">
                  <InfoRow
                    icon={<FaBriefcase />}
                    label="Type"
                    value={
                      EMPLOYMENT_LABELS[job.employmentType] ||
                      job.employmentType
                    }
                  />
                  <InfoRow
                    icon={<FaBuilding />}
                    label="Category"
                    value={job.category}
                  />
                  <InfoRow
                    icon={<FaMapMarkerAlt />}
                    label="Location"
                    value={
                      `${job.location || "—"}${job.division ? ` • ${job.division}` : ""}`
                    }
                  />
                  <InfoRow
                    icon={<FaUsers />}
                    label="Sector"
                    value={SECTOR_LABELS[job.sector] || job.sector}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ---- MAIN COLUMN ---- */}
          <div className="lg:col-span-8 lg:order-1 space-y-6">
            {hasImages && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#3D444C]/10">
                <div
                  className="relative w-full aspect-[16/10] bg-[#E7E3D8] cursor-pointer group"
                  onClick={() => openGallery(0)}
                >
                  <Image
                    src={primaryImage}
                    alt={job.jobTitle}
                    fill
                    className="object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                  {multipleImages && (
                    <div className="absolute bottom-4 right-4 bg-[#3D444C]/85 backdrop-blur-md text-[#E7E3D8] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <FaBriefcase className="text-[10px]" />
                      {job.images.length} images
                    </div>
                  )}
                </div>

                {multipleImages && (
                  <div className="p-3 sm:p-4 flex gap-2 overflow-x-auto bg-[#E7E3D8]/40">
                    {job.images.map((img, i) => (
                      <button
                        key={img.publicId || i}
                        onClick={() => openGallery(i)}
                        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          i === 0
                            ? "border-[#994D35]"
                            : "border-transparent hover:border-[#D3A16D]"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={img.fileName || `Image ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-[#3D444C]/10 overflow-hidden">
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-[#3D444C]/10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#994D35] rounded-full" />
                  <h2 className="text-lg sm:text-xl font-bold text-[#3D444C]">
                    Job Description
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div
                  ref={contentRef}
                  className="job-content text-[#3D444C]"
                  dangerouslySetInnerHTML={{
                    __html:
                      job.jobDescription || "<p>No description provided.</p>",
                  }}
                />

                {job.tags?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-[#3D444C]/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#3D444C] mb-3 flex items-center gap-2">
                      <FaTag className="text-[#994D35]" /> Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((t) => (
                        <Link
                          key={t}
                          href={`/jobs?q=${encodeURIComponent(t)}`}
                          className="px-3 py-1.5 bg-[#E7E3D8] hover:bg-[#D3A16D] hover:text-white text-[#3D444C] rounded-full text-xs font-semibold transition-colors"
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#3D444C]/15 hover:bg-[#D3A16D] hover:text-white hover:border-transparent text-[#3D444C] rounded-lg text-sm font-semibold transition-colors"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#3D444C]/15 hover:bg-[#D3A16D] hover:text-white hover:border-transparent text-[#3D444C] rounded-lg text-sm font-semibold transition-colors"
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RELATED JOBS ==================== */}
      {related.length > 0 && (
        <section className="bg-[#3D444C] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-2">
                  Keep Exploring
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E7E3D8]">
                  Similar Jobs
                </h2>
              </div>
              <Link
                href="/jobs"
                className="text-sm font-semibold text-[#D3A16D] hover:text-[#E7E3D8] flex items-center gap-2 transition-colors"
              >
                View all jobs <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.slice(0, 6).map((r) => (
                <RelatedJobCard key={r._id} job={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== GALLERY MODAL ==================== */}
      {showGallery && hasImages && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowGallery(false)}
        >
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
            aria-label="Close"
          >
            <FaTimes className="text-xl" />
          </button>

          <div
            className="relative max-w-5xl w-full aspect-[16/10]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={job.images[galleryIndex].url}
              alt={job.images[galleryIndex].fileName || "Job image"}
              fill
              className="object-contain"
              sizes="100vw"
            />

            {multipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                  aria-label="Previous"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                  aria-label="Next"
                >
                  <FaChevronRight />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full backdrop-blur-md">
                  {galleryIndex + 1} / {job.images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleJobClient;

// =====================================================================
// Sub-components
// =====================================================================
const ShareButton = ({ onClick, label, children, className = "" }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`w-9 h-9 rounded-full bg-white/10 border border-[#E7E3D8]/20 text-[#E7E3D8] flex items-center justify-center text-sm transition-all duration-200 hover:scale-110 hover:text-white hover:border-transparent ${className}`}
  >
    {children}
  </button>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-5 flex justify-center text-[#D3A16D] text-sm">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-[#3D444C]/50 font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-[#3D444C] font-semibold break-words text-sm mt-0.5">
        {value}
      </p>
    </div>
  </div>
);

// =====================================================================
// Related Job Card
// =====================================================================
const RelatedJobCard = ({ job }) => {
  const thumbnail = job.images?.[0]?.url;
  const isWalkIn = job.applicationMode === "walk-in";
  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline)
    : null;
  const deadlineShort = deadline
    ? deadline.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group bg-[#2f353c] rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#E7E3D8]/10 hover:border-[#D3A16D]/40 flex flex-col"
    >
      <div className="relative w-full h-40 bg-[#2a3037] overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={job.jobTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaBriefcase className="text-5xl text-[#D3A16D]/30" />
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-[#3D444C]/85 backdrop-blur-sm text-[#D3A16D] border border-[#D3A16D]/40">
          {SECTOR_LABELS[job.sector] || job.sector}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10px] text-[#D3A16D] font-bold uppercase tracking-wider mb-1.5">
          {job.category}
        </p>
        <h3 className="font-bold text-[#E7E3D8] text-sm leading-snug line-clamp-2 mb-3 group-hover:text-[#D3A16D] transition-colors">
          {job.jobTitle}
        </h3>

        <div className="mt-auto flex items-center justify-between text-xs">
          <span className="text-[#E7E3D8]/60 truncate">
            {deadlineShort
              ? isWalkIn
                ? `Walk-in ${deadlineShort}`
                : `Apply by ${deadlineShort}`
              : "Open"}
          </span>
          <span className="text-[#D3A16D] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
            View <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};