// app/components/home/HomeArticles.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaArrowRight,
  FaNewspaper,
  FaClock,
  FaUser,
} from "react-icons/fa";

const HomeArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/users/home/articles", {
          next: { revalidate: 60 },
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error("Failed to load articles:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchArticles();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide the section entirely if there are no articles
  if (!loading && articles.length === 0) return null;

  return (
    <section className="relative bg-[#E7E3D8] py-16 sm:py-20 overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-20 -left-32 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-20 -right-32 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ==================== HEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#994D35] mb-2">
              From the Blog
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D444C]">
              Latest <span className="text-[#994D35]">Articles</span>
            </h2>
            <p className="text-[#3D444C]/60 mt-2 max-w-xl text-sm sm:text-base">
              Insights, career tips, and stories curated by the ACC Career Club.
            </p>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#994D35] hover:text-[#3D444C] transition-colors group whitespace-nowrap"
          >
            View all articles
            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ==================== GRID ==================== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ViewAllCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 2).map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
            <ViewAllCard />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeArticles;

// =====================================================================
// Article Card — light variant
// =====================================================================
const ArticleCard = ({ article }) => {
  const publishedDate = article.publishedAt || article.createdAt;
  const dateStr = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // Build excerpt from either the article content or fallback text
  const excerpt = article.content
    ? article.content
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 130) + "…"
    : "Click to read the full article.";

  // Estimate read time (fallback — model virtual isn't available in lean())
  const plain = article.content
    ? String(article.content).replace(/<[^>]*>/g, " ")
    : "";
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.round(words / 200));

  const thumbnail =
    article.thumbnail ||
    "https://res.cloudinary.com/ffuatrrt/image/upload/v1790448939/DefaultThumnailArticle_wh2voa.jpg";

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-52 sm:h-56 bg-[#E7E3D8] overflow-hidden">
        <Image
          src={thumbnail}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/95 backdrop-blur-sm text-[#994D35] border border-[#D3A16D]/40">
            {article.category}
          </span>
        </div>

        {/* Read-time badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#3D444C]/85 backdrop-blur-sm text-[#E7E3D8] border border-[#E7E3D8]/20">
            <FaClock className="text-[8px]" /> {readTime} min
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-[#3D444C] text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#994D35] transition-colors">
          {article.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3 text-xs text-[#3D444C]/60">
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-[#D3A16D]" />
            {dateStr}
          </span>
        </div>

        <p className="text-sm text-[#3D444C]/60 leading-relaxed mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
          {/* Author chip */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#994D35] text-white flex items-center justify-center font-bold shrink-0 text-xs">
              {article.author?.profilePicture ? (
                <Image
                  src={article.author.profilePicture}
                  alt={article.author.fullName || "Author"}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              ) : (
                article.author?.fullName?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <span className="text-xs text-[#3D444C]/70 truncate">
              {article.author?.fullName || "ACC Career Club"}
            </span>
          </div>

          <span className="text-[#994D35] text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
            Read <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// View All Card — light section variant (dark gradient to stand out)
// =====================================================================
const ViewAllCard = () => {
  return (
    <Link
      href="/articles"
      className="group relative bg-gradient-to-br from-[#3D444C] to-[#2a3037] rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col items-center justify-center text-center min-h-[420px] p-8"
    >
      {/* Decorative blurs */}
      <div className="absolute w-[200px] h-[200px] rounded-full bg-[#D3A16D] opacity-20 blur-3xl -top-16 -right-16 pointer-events-none group-hover:opacity-30 transition-opacity" />
      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#994D35] opacity-20 blur-3xl -bottom-16 -left-16 pointer-events-none group-hover:opacity-30 transition-opacity" />

      {/* Icon ring */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-[#D3A16D]/15 border-2 border-[#D3A16D]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
          <FaNewspaper className="text-[#D3A16D] text-2xl" />
        </div>
      </div>

      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-widest text-[#D3A16D] mb-2">
          Explore More
        </p>
        <h3 className="text-2xl font-extrabold text-[#E7E3D8] mb-3 leading-tight">
          View All
          <br />
          Articles
        </h3>
        <p className="text-sm text-[#E7E3D8]/60 max-w-[220px] mx-auto leading-relaxed">
          Career tips, success stories, event recaps, and more from our archive.
        </p>
      </div>

      <span className="relative mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D3A16D] text-[#3D444C] font-bold text-sm group-hover:bg-[#E7E3D8] transition-colors">
        See All
        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
      </span>
    </Link>
  );
};

// =====================================================================
// Article Card — Skeleton
// =====================================================================
const ArticleCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 animate-pulse">
    {/* Thumbnail */}
    <div className="relative w-full h-52 sm:h-56 bg-[#3D444C]/10">
      <div className="absolute top-3 left-3 h-6 w-20 rounded-full bg-white/60" />
      <div className="absolute top-3 right-3 h-6 w-16 rounded-full bg-[#3D444C]/20" />
    </div>

    {/* Body */}
    <div className="p-5 space-y-3">
      {/* Title */}
      <div className="h-5 w-4/5 rounded bg-[#3D444C]/10" />
      <div className="h-5 w-3/5 rounded bg-[#3D444C]/10" />

      {/* Meta */}
      <div className="flex items-center gap-2 pt-1">
        <div className="w-3 h-3 rounded bg-[#3D444C]/10" />
        <div className="h-3 w-24 rounded bg-[#3D444C]/10" />
      </div>

      {/* Excerpt */}
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded bg-[#3D444C]/10" />
        <div className="h-3 w-5/6 rounded bg-[#3D444C]/10" />
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#3D444C]/10" />
          <div className="h-3 w-24 rounded bg-[#3D444C]/10" />
        </div>
        <div className="h-3 w-12 rounded bg-[#3D444C]/10" />
      </div>
    </div>
  </div>
);

// =====================================================================
// View All Card — Skeleton
// =====================================================================
const ViewAllCardSkeleton = () => (
  <div className="relative bg-[#3D444C] rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 flex flex-col items-center justify-center text-center min-h-[420px] p-8 animate-pulse">
    {/* Icon circle */}
    <div className="w-20 h-20 rounded-full bg-white/10 mb-6" />

    {/* Kicker */}
    <div className="h-3 w-24 rounded bg-white/10 mb-3" />

    {/* Title lines */}
    <div className="h-6 w-32 rounded bg-white/15 mb-2" />
    <div className="h-6 w-24 rounded bg-white/15 mb-4" />

    {/* Subtitle */}
    <div className="h-3 w-44 rounded bg-white/10 mb-1" />
    <div className="h-3 w-36 rounded bg-white/10" />

    {/* Button */}
    <div className="mt-8 h-10 w-28 rounded-full bg-white/15" />
  </div>
);