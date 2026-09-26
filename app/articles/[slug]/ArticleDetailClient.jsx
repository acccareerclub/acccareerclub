// app/articles/[slug]/ArticleDetailClient.jsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaShare,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaLink,
  FaCheck,
  FaUser,
  FaNewspaper,
  FaArrowRight,
  FaChevronUp,
  FaCopy,
  FaPrint,
} from "react-icons/fa";
import toast from "react-hot-toast";

const SITE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : "https://ccacc.vercel.app";

const ArticleDetailClient = ({
  initialArticle,
  initialRelated,
  initialCategories,
}) => {
  const router = useRouter();
  const article = initialArticle;
  const related = initialRelated || [];
  const categories = initialCategories || [];

  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState(null);

  const articleRef = useRef(null);
  const contentRef = useRef(null);

  // ---------- Reading progress + scroll-to-top ----------
  useEffect(() => {
    const onScroll = () => {
      // Show back-to-top after 600px
      setShowScrollTop(window.scrollY > 600);

      // Reading progress based on article element
      if (contentRef.current) {
        const rect = contentRef.current.getBoundingClientRect();
        const total = rect.height;
        const scrolled = -rect.top + window.innerHeight * 0.4;
        const pct = Math.max(0, Math.min(100, (scrolled / total) * 100));
        setReadingProgress(pct);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- Extract headings from content for TOC ----------
  const [headings, setHeadings] = useState([]);
  useEffect(() => {
    if (!contentRef.current) return;
    const nodes = contentRef.current.querySelectorAll("h2, h3");
    const list = Array.from(nodes).map((node, i) => {
      // Give each heading an ID so we can anchor to it
      if (!node.id) {
        const id =
          "section-" +
          (node.textContent
            ?.toLowerCase()
            .trim()
            .replace(/[^\w]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 50) || i);
        node.id = id;
      }
      return {
        id: node.id,
        text: node.textContent,
        level: node.tagName === "H2" ? 2 : 3,
      };
    });
    setHeadings(list);
  }, [contentRef.current]);

  // Track active heading while scrolling
  useEffect(() => {
    if (!headings.length) return;
    const onScroll = () => {
      let current = headings[0]?.id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < 140) {
          current = h.id;
        }
      }
      setActiveHeading(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  // ---------- Share ----------
  const shareUrl = `${SITE_URL}/articles/${article.slug}`;
  const shareTitle = article.title;

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
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
    );
  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    );
  const shareWhatsApp = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
      "_blank",
    );

  const handlePrint = () => window.print();

  // ---------- Format date ----------
  const publishedDate = article.publishedAt || article.createdAt;
  const dateStr = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // ---------- Estimate read time ----------
  const plain = String(article.content || "").replace(/<[^>]*>/g, " ");
  const wordCount = plain.trim().split(/\s+/).filter(Boolean).length;
  const readTime = article.readTimeMinutes || Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-[#994D35] to-[#D3A16D] transition-[width] duration-100"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* ==================== HERO ==================== */}
      <section className="relative bg-[#3D444C] text-[#E7E3D8] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-40 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24" />

        {/* Thumbnail as background */}
        {article.thumbnail && (
          <div className="absolute inset-0 opacity-15">
            <Image
              src={article.thumbnail}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#3D444C]/70 via-[#3D444C]/80 to-[#3D444C]" />
          </div>
        )}

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#E7E3D8]/70 hover:text-[#D3A16D] transition-colors mb-8 text-sm font-medium"
          >
            <FaArrowLeft /> Back
          </button>

          {/* Category + meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5 text-xs sm:text-sm">
            <Link
              href={`/articles?category=${encodeURIComponent(article.category)}`}
              className="px-3 py-1 bg-[#D3A16D]/20 border border-[#D3A16D]/40 text-[#D3A16D] font-bold uppercase tracking-wider rounded-full hover:bg-[#D3A16D]/30 transition-colors"
            >
              {article.category}
            </Link>
            <span className="text-[#E7E3D8]/60 flex items-center gap-1.5">
              <FaCalendarAlt className="text-xs" />
              {dateStr}
            </span>
            <span className="text-[#E7E3D8]/60 flex items-center gap-1.5">
              <FaClock className="text-xs" />
              {readTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#994D35] text-white flex items-center justify-center font-bold text-lg shrink-0 border-2 border-[#D3A16D]/40">
                {article.author?.profilePicture ? (
                  <Image
                    src={article.author.profilePicture}
                    alt={article.author.fullName || "Author"}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  article.author?.fullName?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <div>
                <p className="font-semibold text-[#E7E3D8]">
                  {article.author?.fullName}
                </p>
                <p className="text-xs text-[#E7E3D8]/60">
                  {article.author?.type === "internal"
                    ? article.author?.designation ||
                      article.author?.department ||
                      "ACC Career Club Member"
                    : article.author?.designation || "Guest Author"}
                  {article.author?.institution
                    ? ` • ${article.author.institution}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <ShareButton
                onClick={shareFacebook}
                className="hover:bg-[#1877F2] hover:border-[#1877F2]"
                label="Facebook"
              >
                <FaFacebookF />
              </ShareButton>
              <ShareButton
                onClick={shareTwitter}
                className="hover:bg-[#1DA1F2] hover:border-[#1DA1F2]"
                label="Twitter"
              >
                <FaTwitter />
              </ShareButton>
              <ShareButton
                onClick={shareLinkedIn}
                className="hover:bg-[#0A66C2] hover:border-[#0A66C2]"
                label="LinkedIn"
              >
                <FaLinkedinIn />
              </ShareButton>
              <ShareButton
                onClick={shareWhatsApp}
                className="hover:bg-[#25D366] hover:border-[#25D366]"
                label="WhatsApp"
              >
                <FaWhatsapp />
              </ShareButton>
              <ShareButton
                onClick={handleCopyLink}
                className="hover:bg-[#D3A16D] hover:border-[#D3A16D] hover:text-[#3D444C]"
                label="Copy link"
              >
                {copied ? <FaCheck /> : <FaLink />}
              </ShareButton>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ARTICLE BODY ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <article
            ref={articleRef}
            className="lg:col-span-8 bg-white rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Featured thumbnail */}
            {article.thumbnail && (
              <div className="relative w-full aspect-[16/9] bg-[#E7E3D8]">
                <Image
                  src={article.thumbnail}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 sm:p-10">
              {/* Excerpt / lead paragraph */}
              {article.excerpt && (
                <p className="text-lg sm:text-xl text-[#3D444C]/80 italic leading-relaxed border-l-4 border-[#D3A16D] pl-5 mb-8">
                  {article.excerpt}
                </p>
              )}

              {/* Body — TinyMCE HTML */}
              <div
                ref={contentRef}
                className="article-content prose prose-lg max-w-none text-[#3D444C]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags?.length > 0 && (
                <div className="mt-10 pt-8 border-t border-[#3D444C]/10">
                  <p className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
                    <FaTag className="text-[#994D35]" /> Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/articles?tag=${encodeURIComponent(t)}`}
                        className="px-3 py-1.5 bg-[#E7E3D8] hover:bg-[#D3A16D] hover:text-white text-[#3D444C] rounded-full text-xs font-semibold transition-colors"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author bio card */}
              <div className="mt-10 bg-gradient-to-br from-[#E7E3D8] to-[#D3A16D]/20 rounded-2xl p-6 border border-[#3D444C]/10">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#994D35] text-white flex items-center justify-center font-bold text-2xl shrink-0 border-2 border-white shadow-lg">
                    {article.author?.profilePicture ? (
                      <Image
                        src={article.author.profilePicture}
                        alt={article.author.fullName || "Author"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      article.author?.fullName?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#994D35] mb-1">
                      Written by
                    </p>
                    <h3 className="text-lg font-bold text-[#3D444C] mb-1">
                      {article.author?.fullName}
                    </h3>
                    <p className="text-sm text-[#3D444C]/70 leading-relaxed">
                      {article.author?.type === "internal"
                        ? `${article.author?.department || "ACC Career Club"} • ${article.author?.studentId || article.author?.membershipId || "Member"}`
                        : `${article.author?.designation || "Guest Author"}${article.author?.institution ? ` at ${article.author.institution}` : ""}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Print / Copy actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#E7E3D8] hover:bg-[#D3A16D] hover:text-white text-[#3D444C] rounded-lg text-sm font-semibold transition-colors"
                >
                  <FaPrint /> Print Article
                </button>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#E7E3D8] hover:bg-[#D3A16D] hover:text-white text-[#3D444C] rounded-lg text-sm font-semibold transition-colors"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of contents */}
            {headings.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#994D35] mb-4 flex items-center gap-2">
                  <FaNewspaper /> On this page
                </h3>
                <nav className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-2">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block text-sm transition-colors py-1 ${
                        h.level === 3 ? "pl-4" : ""
                      } ${
                        activeHeading === h.id
                          ? "text-[#994D35] font-bold"
                          : "text-[#3D444C]/70 hover:text-[#994D35]"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        document
                          .getElementById(h.id)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Share mini panel */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#994D35] mb-4 flex items-center gap-2">
                <FaShare /> Share this article
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <SidebarShareBtn onClick={shareFacebook} color="hover:bg-[#1877F2]">
                  <FaFacebookF />
                </SidebarShareBtn>
                <SidebarShareBtn onClick={shareTwitter} color="hover:bg-[#1DA1F2]">
                  <FaTwitter />
                </SidebarShareBtn>
                <SidebarShareBtn onClick={shareLinkedIn} color="hover:bg-[#0A66C2]">
                  <FaLinkedinIn />
                </SidebarShareBtn>
                <SidebarShareBtn onClick={shareWhatsApp} color="hover:bg-[#25D366]">
                  <FaWhatsapp />
                </SidebarShareBtn>
                <SidebarShareBtn
                  onClick={handleCopyLink}
                  color="hover:bg-[#994D35]"
                >
                  {copied ? <FaCheck /> : <FaLink />}
                </SidebarShareBtn>
              </div>
            </div>

            {/* Explore categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#994D35] mb-4">
                  Explore Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 12).map((c) => (
                    <Link
                      key={c}
                      href={`/articles?category=${encodeURIComponent(c)}`}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        c === article.category
                          ? "bg-[#994D35] text-white"
                          : "bg-[#E7E3D8] text-[#3D444C] hover:bg-[#D3A16D]/40"
                      }`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ==================== SUGGESTED READING ==================== */}
      {related.length > 0 && (
        <section className="bg-[#3D444C] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-2">
                  Keep Reading
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#E7E3D8]">
                  You might also like
                </h2>
              </div>
              <Link
                href="/articles"
                className="text-sm font-semibold text-[#D3A16D] hover:text-[#E7E3D8] flex items-center gap-2 transition-colors"
              >
                View all articles <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.slice(0, 6).map((r) => (
                <RelatedCard key={r._id} article={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== CTA ==================== */}
      <section className="bg-[#E7E3D8] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D444C] mb-3">
            Want more insights like this?
          </h2>
          <p className="text-[#3D444C]/60 mb-8 max-w-xl mx-auto">
            Browse the full archive of articles from ACC Career Club — career
            tips, event recaps, and success stories from our community.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 bg-[#994D35] hover:bg-[#3D444C] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FaNewspaper /> Browse All Articles
          </Link>
        </div>
      </section>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#994D35] hover:bg-[#D3A16D] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <FaChevronUp />
        </button>
      )}

      {/* Article content styles */}
      <style jsx global>{`
        .article-content {
          color: #3d444c;
          font-size: 1.0625rem;
          line-height: 1.8;
        }
        .article-content > * + * {
          margin-top: 1.25em;
        }
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4 {
          color: #3d444c;
          font-weight: 800;
          line-height: 1.25;
          scroll-margin-top: 100px;
        }
        .article-content h2 {
          font-size: 1.75em;
          margin-top: 2em;
          padding-bottom: 0.3em;
          border-bottom: 2px solid #d3a16d;
        }
        .article-content h3 {
          font-size: 1.35em;
          margin-top: 1.5em;
          color: #994d35;
        }
        .article-content h4 {
          font-size: 1.15em;
          margin-top: 1.25em;
        }
        .article-content p {
          margin: 0;
        }
        .article-content a {
          color: #994d35;
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .article-content a:hover {
          color: #d3a16d;
        }
        .article-content ul,
        .article-content ol {
          padding-left: 1.5em;
        }
        .article-content ul {
          list-style-type: disc;
        }
        .article-content ol {
          list-style-type: decimal;
        }
        .article-content li {
          margin: 0.4em 0;
        }
        .article-content li::marker {
          color: #994d35;
          font-weight: bold;
        }
        .article-content blockquote {
          border-left: 4px solid #d3a16d;
          background: #faf8f3;
          padding: 1em 1.5em;
          margin: 1.5em 0;
          font-style: italic;
          color: #3d444c;
          border-radius: 0 8px 8px 0;
        }
        .article-content code {
          background: #e7e3d8;
          padding: 0.15em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
          color: #994d35;
          font-weight: 600;
        }
        .article-content pre {
          background: #3d444c;
          color: #e7e3d8;
          padding: 1.25em;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 0.9em;
          line-height: 1.6;
        }
        .article-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .article-content img {
          border-radius: 12px;
          max-width: 100%;
          height: auto;
          margin: 1.5em auto;
          display: block;
          box-shadow: 0 8px 24px rgba(61, 68, 76, 0.12);
        }
        .article-content figure {
          margin: 1.5em 0;
        }
        .article-content figcaption {
          text-align: center;
          font-size: 0.85em;
          color: rgba(61, 68, 76, 0.6);
          margin-top: 0.5em;
          font-style: italic;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.95em;
        }
        .article-content th {
          background: #3d444c;
          color: #e7e3d8;
          text-align: left;
          padding: 0.75em;
          font-weight: 700;
        }
        .article-content td {
          padding: 0.75em;
          border-bottom: 1px solid #e7e3d8;
        }
        .article-content tr:nth-child(even) td {
          background: #faf8f3;
        }
        .article-content hr {
          border: 0;
          border-top: 2px solid #e7e3d8;
          margin: 2em 0;
        }
        @media print {
          .article-content pre {
            background: #f5f5f5 !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

// =====================================================================
// Helpers
// =====================================================================

const ShareButton = ({ onClick, className = "", label, children }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`w-10 h-10 rounded-full bg-white/10 border border-[#E7E3D8]/20 text-[#E7E3D8] flex items-center justify-center text-sm transition-all duration-200 hover:scale-110 hover:text-white hover:border-transparent ${className}`}
  >
    {children}
  </button>
);

const SidebarShareBtn = ({ onClick, color, children }) => (
  <button
    onClick={onClick}
    className={`aspect-square rounded-lg bg-[#E7E3D8] text-[#3D444C] flex items-center justify-center text-sm font-semibold transition-all duration-200 hover:text-white hover:scale-105 ${color}`}
  >
    {children}
  </button>
);

// =====================================================================
// Related Card
// =====================================================================
const RelatedCard = ({ article }) => {
  const publishedDate = article.publishedAt || article.createdAt;
  const dateStr = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative w-full h-40 bg-[#E7E3D8] overflow-hidden">
        <Image
          src={article.thumbnail}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[#994D35] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#D3A16D]/40">
          {article.category}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-xs text-[#3D444C]/60">
          <FaCalendarAlt className="text-[10px]" />
          <span>{dateStr}</span>
        </div>

        <h3 className="font-bold text-[#3D444C] text-sm leading-snug line-clamp-3 mb-3 group-hover:text-[#994D35] transition-colors">
          {article.title}
        </h3>

        <div className="mt-auto flex items-center justify-between text-xs">
          <span className="text-[#3D444C]/60 truncate">
            {article.author?.fullName}
          </span>
          <span className="text-[#994D35] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
            Read <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleDetailClient;