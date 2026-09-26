// app/articles/ArticlesClient.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaCalendarAlt,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaNewspaper,
  FaArrowRight,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

const PAGE_SIZE = 50;

const ArticlesClient = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const topRef = useRef(null);

  // ---------- Fetch ----------
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", PAGE_SIZE);
      if (category !== "all") params.set("category", category);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (sort !== "recent") params.set("sort", sort);

      const res = await fetch(`/api/users/articles/list?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success) {
        setArticles(data.articles || []);
        setPagination(data.pagination);
        if (data.categories?.length) setCategories(data.categories);
      } else {
        setArticles([]);
      }
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, searchQuery, sort]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Debounce the search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ---------- Handlers ----------
  const goToPage = (newPage) => {
    setPage(newPage);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setCategory("all");
    setSort("recent");
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery || category !== "all" || sort !== "recent";

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* ==================== HERO ==================== */}
      <section className="relative bg-[#3D444C] text-[#E7E3D8] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-40 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D3A16D]/20 border border-[#D3A16D]/40 text-[#D3A16D] text-xs font-bold uppercase tracking-wider mb-5">
            <FaNewspaper /> ACC Career Club
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Insights & <span className="text-[#D3A16D]">Stories</span>
          </h1>

          <p className="text-[#E7E3D8]/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Career advice, event recaps, success stories, and tips curated by
            the ACC Career Club — for students, by students.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles, authors, tags..."
                className="w-full pl-12 pr-12 py-4 bg-white text-[#3D444C] rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#D3A16D]/30 text-sm sm:text-base placeholder:text-[#3D444C]/40"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#3D444C]/40 hover:text-[#994D35] hover:bg-[#994D35]/10 transition-colors"
                  aria-label="Clear search"
                  type="button"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FILTER BAR ==================== */}
      <div
        ref={topRef}
        className="sticky top-0 z-30 bg-[#E7E3D8]/95 backdrop-blur-md border-b border-[#3D444C]/10 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#3D444C]/70 shrink-0">
            <FaFilter className="text-[#994D35]" />
            <span className="font-semibold">Filter</span>
          </div>

          <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 -mb-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setCategory("all");
                setPage(1);
              }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === "all"
                  ? "bg-[#994D35] text-white shadow-md"
                  : "bg-white text-[#3D444C] hover:bg-[#D3A16D]/30 border border-[#3D444C]/10"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  category === c
                    ? "bg-[#994D35] text-white shadow-md"
                    : "bg-white text-[#3D444C] hover:bg-[#D3A16D]/30 border border-[#3D444C]/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="shrink-0 px-3 py-2 bg-white border border-[#3D444C]/20 rounded-lg text-sm focus:outline-none focus:border-[#3D444C]"
          >
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A → Z</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 text-sm text-[#994D35] hover:text-[#3D444C] font-semibold underline-offset-2 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ==================== GRID ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!loading && pagination && (
          <p className="text-sm text-[#3D444C]/60 mb-6">
            Showing{" "}
            <span className="font-bold text-[#3D444C]">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#3D444C]">
              {pagination.total}
            </span>{" "}
            articles
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState onClear={clearFilters} hasFilters={!!hasActiveFilters} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
              <ArticleCard
                key={article._id}
                article={article}
                featured={i === 0 && page === 1 && !hasActiveFilters}
              />
            ))}
          </div>
        )}

        {!loading && pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={goToPage}
          />
        )}
      </section>
    </div>
  );
};

export default ArticlesClient;

// =====================================================================
// Article Card
// =====================================================================
const ArticleCard = ({ article, featured }) => {
  const publishedDate = article.publishedAt || article.createdAt;
  const dateStr = publishedDate
    ? new Date(publishedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  // ✅ Build a preview excerpt — prefer author-supplied excerpt, else pull from content
  const previewText = buildPreview(article, featured ? 220 : 160);

  // ✅ Read time estimate (uses same helper logic)
  const readTime = estimateReadTime(article.content);

  if (featured) {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="sm:col-span-2 lg:col-span-2 group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col md:flex-row"
      >
        <div className="relative w-full md:w-1/2 h-56 md:h-auto md:min-h-[320px] bg-[#E7E3D8]">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <span className="absolute top-4 left-4 px-3 py-1 bg-[#994D35] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
            Featured
          </span>
        </div>
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#994D35]">
              {article.category}
            </span>
            <span className="text-[#3D444C]/20">•</span>
            <span className="text-xs text-[#3D444C]/60 flex items-center gap-1">
              <FaCalendarAlt className="text-[10px]" />
              {dateStr}
            </span>
            <span className="text-[#3D444C]/20">•</span>
            <span className="text-xs text-[#3D444C]/60">
              {readTime} min read
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#3D444C] leading-tight mb-3 group-hover:text-[#994D35] transition-colors line-clamp-3">
            {article.title}
          </h2>

          <p className="text-sm text-[#3D444C]/60 mb-6 line-clamp-4 leading-relaxed">
            {previewText}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <AuthorChip author={article.author} />
            <span className="text-[#994D35] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Read <FaArrowRight className="text-xs" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
    >
      <div className="relative w-full h-48 bg-[#E7E3D8] overflow-hidden">
        <Image
          src={article.thumbnail}
          alt={article.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#994D35] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#D3A16D]/40">
          {article.category}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-xs text-[#3D444C]/60 flex-wrap">
          <span className="flex items-center gap-1">
            <FaCalendarAlt className="text-[10px]" />
            {dateStr}
          </span>
          <span className="text-[#3D444C]/20">•</span>
          <span>{readTime} min read</span>
        </div>

        <h3 className="font-bold text-[#3D444C] text-lg leading-snug mb-2 line-clamp-2 group-hover:text-[#994D35] transition-colors">
          {article.title}
        </h3>

        {/* ✅ Content excerpt — always shown now */}
        <p className="text-sm text-[#3D444C]/60 mb-4 line-clamp-3 leading-relaxed">
          {previewText}
        </p>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C]/70 text-[10px] font-medium"
              >
                <FaTag className="text-[8px]" />
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
          <AuthorChip author={article.author} compact />
          <span className="text-[#994D35] text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <FaArrowRight className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// Author Chip
// =====================================================================
const AuthorChip = ({ author, compact }) => {
  if (!author?.fullName) return null;

  const initial = author.fullName[0]?.toUpperCase() || "?";
  const hasPic = !!author.profilePicture;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`relative rounded-full overflow-hidden bg-[#994D35] text-white flex items-center justify-center font-bold shrink-0 ${
          compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
        }`}
      >
        {hasPic ? (
          <Image
            src={author.profilePicture}
            alt={author.fullName}
            fill
            className="object-cover"
            sizes="36px"
          />
        ) : (
          initial
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`truncate font-semibold text-[#3D444C] ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {author.fullName}
        </p>
        {!compact && author.type === "external" && (
          <p className="text-[10px] text-[#3D444C]/50 truncate">
            {author.designation || "Guest Author"}
          </p>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// Skeleton Loader
// =====================================================================
const ArticleSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 animate-pulse">
    <div className="w-full h-48 bg-[#E7E3D8]" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 bg-[#E7E3D8] rounded" />
      <div className="h-5 w-3/4 bg-[#E7E3D8] rounded" />
      <div className="h-4 w-full bg-[#E7E3D8] rounded" />
      <div className="h-4 w-5/6 bg-[#E7E3D8] rounded" />
      <div className="h-4 w-2/3 bg-[#E7E3D8] rounded" />
      <div className="pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E7E3D8]" />
          <div className="h-3 w-24 bg-[#E7E3D8] rounded" />
        </div>
        <div className="h-3 w-10 bg-[#E7E3D8] rounded" />
      </div>
    </div>
  </div>
);

// =====================================================================
// Empty State
// =====================================================================
const EmptyState = ({ onClear, hasFilters }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-[#3D444C]/10 py-20 px-6 text-center">
    <div className="w-20 h-20 mx-auto rounded-full bg-[#E7E3D8] flex items-center justify-center mb-5">
      <FaNewspaper className="text-3xl text-[#994D35]" />
    </div>
    <h3 className="text-xl font-bold text-[#3D444C] mb-2">No articles found</h3>
    <p className="text-[#3D444C]/60 text-sm mb-6 max-w-sm mx-auto">
      {hasFilters
        ? "Try adjusting your search or filters to find what you're looking for."
        : "We haven't published anything yet. Check back soon!"}
    </p>
    {hasFilters && (
      <button
        onClick={onClear}
        className="px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors font-semibold text-sm"
      >
        Clear filters
      </button>
    )}
  </div>
);

// =====================================================================
// Pagination
// =====================================================================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    const range = {
      start: Math.max(2, currentPage - delta),
      end: Math.min(totalPages - 1, currentPage + delta),
    };

    pages.push(1);
    if (range.start > 2) pages.push("…");
    for (let i = range.start; i <= range.end; i++) pages.push(i);
    if (range.end < totalPages - 1) pages.push("…");
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-2 flex-wrap"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg bg-white border border-[#3D444C]/15 text-[#3D444C] hover:bg-[#994D35] hover:text-white hover:border-[#994D35] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#3D444C]"
        aria-label="Previous page"
      >
        <FaChevronLeft className="text-xs" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-[#3D444C]/40 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              p === currentPage
                ? "bg-[#994D35] text-white shadow-md"
                : "bg-white border border-[#3D444C]/15 text-[#3D444C] hover:bg-[#D3A16D]/30"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg bg-white border border-[#3D444C]/15 text-[#3D444C] hover:bg-[#994D35] hover:text-white hover:border-[#994D35] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#3D444C]"
        aria-label="Next page"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </nav>
  );
};

// =====================================================================
// Utils
// =====================================================================

// Strip HTML tags from content
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

// ✅ Build a preview: prefer author-supplied excerpt, else extract from content
const buildPreview = (article, maxChars = 160) => {
  // 1. If the article has an explicit excerpt, use it
  if (article.excerpt && article.excerpt.trim()) {
    return truncate(article.excerpt.trim(), maxChars);
  }

  // 2. Otherwise, pull text from content and trim to maxChars
  const plain = stripHtml(article.content || "");
  if (!plain) return "Read the full article to learn more.";

  // Try to end on a sentence boundary
  if (plain.length <= maxChars) return plain;

  const slice = plain.slice(0, maxChars);
  const lastPunct = Math.max(
    slice.lastIndexOf(". "),
    slice.lastIndexOf("! "),
    slice.lastIndexOf("? "),
  );

  // Use sentence boundary if it's not too early, else fall back to word boundary
  if (lastPunct > maxChars * 0.6) {
    return slice.slice(0, lastPunct + 1);
  }

  // Trim to last full word
  const lastSpace = slice.lastIndexOf(" ");
  return slice.slice(0, lastSpace > 0 ? lastSpace : maxChars) + "…";
};

// Simple truncation helper
const truncate = (str, max) => {
  if (str.length <= max) return str;
  const slice = str.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return slice.slice(0, lastSpace > 0 ? lastSpace : max) + "…";
};

// ✅ Estimate read time from content (≈200 wpm)
const estimateReadTime = (content = "") => {
  const plain = stripHtml(content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 200));
};