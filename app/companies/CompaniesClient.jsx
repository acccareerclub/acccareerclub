// app/companies/CompaniesClient.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaSpinner,
  FaBuilding,
  FaTimes,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";

const PAGE_SIZE = 40;

// ─────────────────────────────────────────────────────────────
// Strip HTML and build a short plain-text preview
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

const buildPreview = (html, maxChars = 110) => {
  const plain = stripHtml(html);
  if (!plain) return "";
  if (plain.length <= maxChars) return plain;

  const slice = plain.slice(0, maxChars);
  // Try to end on a word boundary
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > maxChars * 0.6 ? slice.slice(0, lastSpace) : slice) + "…";
};

const CompaniesClient = () => {
  const [companies, setCompanies] = useState([]);
  const [tags, setTags] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState("recent");

  // mobile filter toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const topRef = useRef(null);

  // ---------- Fetch ----------
  const fetchCompanies = useCallback(
    async (pageToLoad = 1) => {
      const isFirstPage = pageToLoad === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("limit", PAGE_SIZE);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (activeTag !== "all") params.set("tag", activeTag);
        if (sort !== "recent") params.set("sort", sort);

        const res = await fetch(
          `/api/users/companies?${params.toString()}`,
          { cache: "no-store" },
        );
        const data = await res.json();

        if (data.success) {
          if (isFirstPage) setCompanies(data.companies || []);
          else setCompanies((prev) => [...prev, ...(data.companies || [])]);

          setPagination(data.pagination);
          if (data.tags?.length) setTags(data.tags);
        } else if (isFirstPage) {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery, activeTag, sort],
  );

  // Refetch on filter change
  useEffect(() => {
    fetchCompanies(1);
  }, [fetchCompanies]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ---------- Handlers ----------
  const loadMore = () => {
    if (!pagination?.hasMore || loadingMore) return;
    fetchCompanies(pagination.page + 1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setActiveTag("all");
    setSort("recent");
    setMobileFiltersOpen(false);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const hasActiveFilters =
    searchQuery.trim() || activeTag !== "all" || sort !== "recent";

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* ==================== HERO ==================== */}
      <section className="relative bg-[#3D444C] text-[#E7E3D8] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-40 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D3A16D]/20 border border-[#D3A16D]/40 text-[#D3A16D] text-xs font-bold uppercase tracking-wider mb-5">
            <FaBuilding /> ACC Career Club
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Company <span className="text-[#D3A16D]">Insights</span>
          </h1>

          <p className="text-[#E7E3D8]/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Detailed profiles of top employers — culture, hiring process, and
            career opportunities in Bangladesh.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-12 pr-12 py-4 bg-white text-[#3D444C] rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#D3A16D]/30 text-sm sm:text-base placeholder:text-[#3D444C]/40"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-[#3D444C]/40 hover:text-[#994D35] hover:bg-[#994D35]/10 transition-colors"
                  type="button"
                  aria-label="Clear search"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#3D444C]/70 shrink-0">
              <FaFilter className="text-[#994D35]" />
              <span className="font-semibold">Filter</span>
            </div>

            <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
              <button
                onClick={() => setActiveTag("all")}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTag === "all"
                    ? "bg-[#994D35] text-white shadow-md"
                    : "bg-white text-[#3D444C] hover:bg-[#D3A16D]/30 border border-[#3D444C]/10"
                }`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTag === t
                      ? "bg-[#994D35] text-white shadow-md"
                      : "bg-white text-[#3D444C] hover:bg-[#D3A16D]/30 border border-[#3D444C]/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shrink-0 px-3 py-2 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
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

          {/* Mobile */}
          <div className="lg:hidden flex items-center justify-between gap-2">
            <button
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg text-sm font-semibold text-[#3D444C]"
            >
              <FaFilter className="text-[#994D35]" />
              Filter
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#994D35]" />
              )}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="recent">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">A → Z</option>
            </select>
          </div>

          {mobileFiltersOpen && (
            <div className="lg:hidden mt-3 pt-3 border-t border-[#3D444C]/10">
              <p className="text-xs font-bold uppercase tracking-wider text-[#3D444C]/60 mb-2">
                Browse by tag
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeTag === "all"
                      ? "bg-[#994D35] text-white"
                      : "bg-white text-[#3D444C] border border-[#3D444C]/10"
                  }`}
                >
                  All
                </button>
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeTag === t
                        ? "bg-[#994D35] text-white"
                        : "bg-white text-[#3D444C] border border-[#3D444C]/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-3 py-2.5 text-sm text-[#994D35] font-semibold border border-[#994D35]/30 rounded-lg"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== GRID ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!loading && pagination && (
          <p className="text-sm text-[#3D444C]/60 mb-6">
            Showing{" "}
            <span className="font-bold text-[#3D444C]">
              {companies.length === 0 ? 0 : 1}–{companies.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#3D444C]">{pagination.total}</span>{" "}
            compan{pagination.total !== 1 ? "ies" : "y"}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CompanySkeleton key={i} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <EmptyState onClear={clearFilters} hasFilters={!!hasActiveFilters} />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {companies.map((company) => (
                <CompanyCard key={company._id} company={company} />
              ))}
            </div>

            {pagination?.hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#994D35] hover:bg-[#3D444C] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin" /> Loading...
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> Load More
                    </>
                  )}
                </button>
              </div>
            )}

            {!pagination?.hasMore && companies.length > PAGE_SIZE && (
              <div className="mt-12 text-center text-sm text-[#3D444C]/40">
                — You&apos;ve reached the end —
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CompaniesClient;

// =====================================================================
// Company Card (with description preview)
// =====================================================================
const CompanyCard = ({ company }) => {
  const preview = buildPreview(company.content, 110);

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
    >
      {/* Logo box */}
      <div className="relative w-full aspect-square bg-[#E7E3D8]/50 flex items-center justify-center p-6 sm:p-8">
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
          <div className="flex flex-col items-center justify-center text-[#3D444C]/30">
            <FaBuilding className="text-5xl sm:text-6xl mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-bold">
              No logo
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-[#3D444C] text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-[#994D35] transition-colors text-center">
          {company.title}
        </h3>

        {/* ✅ Description preview */}
        {preview && (
          <p className="text-[#3D444C]/60 text-xs leading-relaxed line-clamp-3 text-center mb-3">
            {preview}
          </p>
        )}

        {/* Tags */}
        {company.tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {company.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C]/70 text-[10px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-[#3D444C]/10 text-center">
          <span className="text-[#994D35] text-xs font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View Profile <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// Skeleton (updated to include description placeholder)
// =====================================================================
const CompanySkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 animate-pulse">
    <div className="relative w-full aspect-square bg-[#3D444C]/10" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="h-4 w-4/5 mx-auto rounded bg-[#3D444C]/10" />
      <div className="h-4 w-3/5 mx-auto rounded bg-[#3D444C]/10" />

      {/* Description placeholder */}
      <div className="space-y-1.5 pt-1">
        <div className="h-2.5 w-full rounded bg-[#3D444C]/10" />
        <div className="h-2.5 w-11/12 mx-auto rounded bg-[#3D444C]/10" />
        <div className="h-2.5 w-8/12 mx-auto rounded bg-[#3D444C]/10" />
      </div>

      <div className="flex justify-center gap-2 pt-1">
        <div className="h-5 w-14 rounded-full bg-[#3D444C]/10" />
        <div className="h-5 w-16 rounded-full bg-[#3D444C]/10" />
      </div>
      <div className="pt-3 border-t border-[#3D444C]/10">
        <div className="h-3 w-20 mx-auto rounded bg-[#3D444C]/10" />
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
      <FaBuilding className="text-3xl text-[#994D35]" />
    </div>
    <h3 className="text-xl font-bold text-[#3D444C] mb-2">
      No companies found
    </h3>
    <p className="text-[#3D444C]/60 text-sm mb-6 max-w-sm mx-auto">
      {hasFilters
        ? "Try adjusting your search or filters to find what you're looking for."
        : "No company profiles yet. Check back soon!"}
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