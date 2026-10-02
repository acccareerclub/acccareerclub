// app/companies/[slug]/SingleCompanyClient.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaBuilding,
  FaShare,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaLink,
  FaCheck,
  FaTag,
  FaCopy,
  FaPrint,
  FaArrowRight,
  FaClock,
} from "react-icons/fa";
import toast from "react-hot-toast";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://ccacc.vercel.app";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const buildPreview = (html, maxChars = 120) => {
  const plain = stripHtml(html);
  if (!plain) return "";
  if (plain.length <= maxChars) return plain;
  const slice = plain.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice) + "…";
};

const estimateReadTime = (content = "") => {
  const plain = stripHtml(content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 200));
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const SingleCompanyClient = ({ initialCompany, initialRelated }) => {
  const router = useRouter();
  const company = initialCompany;
  const related = initialRelated || [];

  const [copied, setCopied] = useState(false);

  // ---------- Derived ----------
  const readTime = estimateReadTime(company.content);
  const publishedDate = company.publishedAt || company.createdAt;
  const dateStr = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // ---------- Share ----------
  const shareUrl = `${SITE_URL}/companies/${company.slug}`;

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
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(company.title)}`,
      "_blank",
    );
  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    );
  const shareWhatsApp = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(company.title + " " + shareUrl)}`,
      "_blank",
    );

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* ==================== HERO ==================== */}
      <section className="relative bg-[#3D444C] text-[#E7E3D8] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-40 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16">
          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#E7E3D8]/70 hover:text-[#D3A16D] transition-colors mb-8 text-sm font-medium"
          >
            <FaArrowLeft /> Back
          </button>

          {/* Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D3A16D]/20 border border-[#D3A16D]/40 text-[#D3A16D] text-xs font-bold uppercase tracking-wider mb-5">
            <FaBuilding /> Company Profile
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl">
            {company.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#E7E3D8]/75">
            {dateStr && (
              <span className="flex items-center gap-2">
                <FaClock className="text-[#D3A16D]" />
                <span className="font-medium">Published {dateStr}</span>
              </span>
            )}
            <span className="flex items-center gap-2">
              <FaClock className="text-[#D3A16D]" />
              <span className="font-medium">{readTime} min read</span>
            </span>
          </div>

          {/* Share row */}
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* ---- SIDEBAR (logo + tags) ---- */}
          <aside className="lg:col-span-4 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl border border-[#3D444C]/10 overflow-hidden">
              {/* Top accent */}
              <div className="h-1 bg-gradient-to-r from-[#994D35] via-[#D3A16D] to-[#994D35]" />

              {/* Logo box */}
              <div className="p-6">
                <div className="relative w-full aspect-square bg-[#E7E3D8]/50 rounded-xl flex items-center justify-center p-8">
                  {company.companyLogo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={company.companyLogo}
                        alt={company.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#3D444C]/30">
                      <FaBuilding className="text-6xl mb-2" />
                      <span className="text-[10px] uppercase tracking-wider font-bold">
                        No logo
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {company.tags?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#3D444C]/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#994D35] mb-3 flex items-center gap-2">
                      <FaTag /> Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {company.tags.map((t) => (
                        <Link
                          key={t}
                          href={`/companies?tag=${encodeURIComponent(t)}`}
                          className="px-3 py-1.5 bg-[#E7E3D8] hover:bg-[#D3A16D] hover:text-white text-[#3D444C] rounded-full text-xs font-semibold transition-colors"
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-[#3D444C]/10 flex flex-wrap gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#3D444C]/15 hover:bg-[#D3A16D] hover:text-white hover:border-transparent text-[#3D444C] rounded-lg text-sm font-semibold transition-colors"
                  >
                    <FaPrint /> Print
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#3D444C]/15 hover:bg-[#D3A16D] hover:text-white hover:border-transparent text-[#3D444C] rounded-lg text-sm font-semibold transition-colors"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ---- MAIN CONTENT ---- */}
          <div className="lg:col-span-8 lg:order-1">
            <div className="bg-white rounded-2xl shadow-xl border border-[#3D444C]/10 overflow-hidden">
              {/* Header strip */}
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-[#3D444C]/10">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#994D35] rounded-full" />
                  <h2 className="text-lg sm:text-xl font-bold text-[#3D444C]">
                    About the Company
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div
                  className="company-content text-[#3D444C]"
                  dangerouslySetInnerHTML={{
                    __html:
                      company.content || "<p>No details provided yet.</p>",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MORE COMPANIES ==================== */}
      {related.length > 0 && (
        <section className="bg-[#3D444C] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-2">
                  Explore More
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E7E3D8]">
                  Other Companies
                </h2>
              </div>
              <Link
                href="/companies"
                className="text-sm font-semibold text-[#D3A16D] hover:text-[#E7E3D8] flex items-center gap-2 transition-colors"
              >
                View all companies <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {/* 2 cols mobile, 4 cols desktop — same as the list page */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.slice(0, 8).map((c) => (
                <RelatedCompanyCard key={c._id} company={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== CTA ==================== */}
      <section className="bg-[#E7E3D8] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D444C] mb-3">
            Want to explore more companies?
          </h2>
          <p className="text-[#3D444C]/60 mb-8 max-w-xl mx-auto">
            Browse our full archive of company profiles — culture, hiring
            process, and insider insights.
          </p>
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 bg-[#994D35] hover:bg-[#3D444C] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaBuilding /> Browse All Companies
          </Link>
        </div>
      </section>

      {/* ==================== CONTENT STYLES ==================== */}
      {/* 
        NOTE: Using a plain <style> tag (no `jsx` attribute) to avoid
        hydration mismatch issues with styled-jsx inside client components.
        The classes are global but only used by this page.
      */}
      <style>{`
        .company-content {
          color: #3d444c;
          font-size: 1rem;
          line-height: 1.75;
        }
        .company-content > * + * {
          margin-top: 1em;
        }
        .company-content h1,
        .company-content h2,
        .company-content h3,
        .company-content h4 {
          color: #3d444c;
          font-weight: 800;
          line-height: 1.3;
          margin-top: 1.5em;
        }
        .company-content h2 {
          font-size: 1.5em;
          padding-bottom: 0.3em;
          border-bottom: 2px solid #d3a16d;
        }
        .company-content h3 {
          font-size: 1.2em;
          color: #994d35;
        }
        .company-content p {
          margin: 0;
        }
        .company-content a {
          color: #994d35;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 600;
        }
        .company-content a:hover {
          color: #d3a16d;
        }
        .company-content ul,
        .company-content ol {
          padding-left: 1.5em;
        }
        .company-content ul {
          list-style-type: disc;
        }
        .company-content ol {
          list-style-type: decimal;
        }
        .company-content li {
          margin: 0.4em 0;
        }
        .company-content li::marker {
          color: #994d35;
          font-weight: bold;
        }
        .company-content blockquote {
          border-left: 4px solid #d3a16d;
          background: #faf8f3;
          padding: 1em 1.5em;
          margin: 1.5em 0;
          font-style: italic;
          border-radius: 0 8px 8px 0;
        }
        .company-content code {
          background: #e7e3d8;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          color: #994d35;
          font-weight: 600;
        }
        .company-content pre {
          background: #3d444c;
          color: #e7e3d8;
          padding: 1.25em;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 0.9em;
          line-height: 1.6;
        }
        .company-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .company-content img {
          border-radius: 12px;
          max-width: 100%;
          height: auto;
          margin: 1.5em auto;
          display: block;
          box-shadow: 0 8px 24px rgba(61, 68, 76, 0.12);
        }
        .company-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.95em;
        }
        .company-content th {
          background: #3d444c;
          color: #e7e3d8;
          text-align: left;
          padding: 0.75em;
          font-weight: 700;
        }
        .company-content td {
          padding: 0.75em;
          border-bottom: 1px solid #e7e3d8;
        }
        .company-content tr:nth-child(even) td {
          background: #faf8f3;
        }
        @media print {
          .company-content pre {
            background: #f5f5f5 !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SingleCompanyClient;

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

// =====================================================================
// Related Company Card — mirrors list page card
// =====================================================================
const RelatedCompanyCard = ({ company }) => {
  const preview = buildPreview(company.content, 90);

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group bg-[#2f353c] rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#E7E3D8]/10 hover:border-[#D3A16D]/40 flex flex-col"
    >
      {/* Logo box */}
      <div className="relative w-full aspect-square bg-[#2a3037] flex items-center justify-center p-6">
        {company.companyLogo ? (
          <div className="relative w-full h-full">
            <Image
              src={company.companyLogo}
              alt={company.title}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#E7E3D8]/20">
            <FaBuilding className="text-5xl mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-bold">
              No logo
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-[#E7E3D8] text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#D3A16D] transition-colors text-center">
          {company.title}
        </h3>

        {preview && (
          <p className="text-[#E7E3D8]/50 text-[11px] leading-relaxed line-clamp-2 text-center mb-3">
            {preview}
          </p>
        )}

        {company.tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {company.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7E3D8]/10 text-[#E7E3D8]/60 text-[10px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-[#E7E3D8]/10 text-center">
          <span className="text-[#D3A16D] text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};