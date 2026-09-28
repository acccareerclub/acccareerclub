// app/jobs/JobsClient.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaSearch,
  FaSpinner,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaFire,
  FaClock,
  FaBuilding,
} from "react-icons/fa";

// =====================================================================
// Constants
// =====================================================================
const PAGE_SIZE = 20;

const SECTOR_LABELS = {
  government: "Government",
  private: "Private",
  ngo: "NGO",
  international: "International",
  autonomous: "Autonomous",
};

const EMPLOYMENT_LABELS = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
  temporary: "Temporary",
};

const SECTOR_COLORS = {
  government: "bg-red-100 text-red-700 border-red-300",
  private: "bg-blue-100 text-blue-700 border-blue-300",
  ngo: "bg-purple-100 text-purple-700 border-purple-300",
  international: "bg-green-100 text-green-700 border-green-300",
  autonomous: "bg-amber-100 text-amber-700 border-amber-300",
};

// =====================================================================
// Main Component
// =====================================================================
const JobsClient = () => {
  const [jobs, setJobs] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    sectors: [],
    categories: [],
    divisions: [],
    employmentTypes: [],
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true); // initial load
  const [loadingMore, setLoadingMore] = useState(false); // pagination load

  // filters
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [category, setCategory] = useState("all");
  const [division, setDivision] = useState("all");
  const [employmentType, setEmploymentType] = useState("all");
  const [sort, setSort] = useState("deadline"); // nearest deadline first

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const topRef = useRef(null);

  // ---------- Fetch ----------
  const fetchJobs = useCallback(
    async (pageToLoad = 1) => {
      const isFirstPage = pageToLoad === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams();
        params.set("page", pageToLoad);
        params.set("limit", PAGE_SIZE);
        if (sector !== "all") params.set("sector", sector);
        if (category !== "all") params.set("category", category);
        if (division !== "all") params.set("division", division);
        if (employmentType !== "all")
          params.set("employmentType", employmentType);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (sort !== "deadline") params.set("sort", sort);

        const res = await fetch(`/api/users/jobs?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          if (isFirstPage) {
            setJobs(data.jobs || []);
          } else {
            // append
            setJobs((prev) => [...prev, ...(data.jobs || [])]);
          }
          setPagination(data.pagination);
          if (data.filters) setFilterOptions(data.filters);
        } else {
          if (isFirstPage) setJobs([]);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [sector, category, division, employmentType, searchQuery, sort],
  );

  // Refetch when filters change
  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ---------- Handlers ----------
  const loadMore = () => {
    if (!pagination?.hasMore || loadingMore) return;
    fetchJobs(pagination.page + 1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSector("all");
    setCategory("all");
    setDivision("all");
    setEmploymentType("all");
    setSort("deadline");
    setMobileFiltersOpen(false);
    // scroll to top
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const hasActiveFilters =
    searchQuery.trim() ||
    sector !== "all" ||
    category !== "all" ||
    division !== "all" ||
    employmentType !== "all" ||
    sort !== "deadline";

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* ==================== HERO ==================== */}
      <section className="relative bg-[#3D444C] text-[#E7E3D8] overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-40 -left-32" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D3A16D]/20 border border-[#D3A16D]/40 text-[#D3A16D] text-xs font-bold uppercase tracking-wider mb-5">
            <FaBriefcase /> ACC Career Club
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Latest <span className="text-[#D3A16D]">Jobs</span>
          </h1>

          <p className="text-[#E7E3D8]/70 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Government, private, NGO and international job circulars — sorted
            by nearest deadline so you never miss out.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, location or tag..."
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
          {/* Desktop: filters inline */}
          <div className="hidden lg:flex items-center gap-2 flex-wrap">
            <FaFilter className="text-[#994D35] shrink-0" />
            <span className="text-sm font-semibold text-[#3D444C] shrink-0 mr-2">
              Filter
            </span>
            <FilterSelect
              value={sector}
              onChange={setSector}
              options={[
                { value: "all", label: "All Sectors" },
                ...filterOptions.sectors.map((s) => ({
                  value: s,
                  label: SECTOR_LABELS[s] || s,
                })),
              ]}
            />
            <FilterSelect
              value={category}
              onChange={setCategory}
              options={[
                { value: "all", label: "All Categories" },
                ...filterOptions.categories.map((c) => ({
                  value: c,
                  label: c,
                })),
              ]}
            />
            <FilterSelect
              value={division}
              onChange={setDivision}
              options={[
                { value: "all", label: "All Divisions" },
                ...filterOptions.divisions
                  .filter((d) => d !== "All")
                  .map((d) => ({ value: d, label: d })),
              ]}
            />
            <FilterSelect
              value={employmentType}
              onChange={setEmploymentType}
              options={[
                { value: "all", label: "All Types" },
                ...filterOptions.employmentTypes.map((t) => ({
                  value: t,
                  label: EMPLOYMENT_LABELS[t] || t,
                })),
              ]}
            />
            <FilterSelect
              value={sort}
              onChange={setSort}
              options={[
                { value: "deadline", label: "Nearest Deadline" },
                { value: "recent", label: "Most Recent" },
              ]}
            />
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#994D35] hover:text-[#3D444C] font-semibold underline-offset-2 hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Mobile: single toggle button */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg text-sm font-semibold text-[#3D444C]"
            >
              <FaFilter className="text-[#994D35]" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#994D35]"></span>
              )}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="deadline">Nearest Deadline</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>

          {/* Mobile: expanded filters */}
          {mobileFiltersOpen && (
            <div className="lg:hidden mt-3 space-y-2 pt-3 border-t border-[#3D444C]/10">
              <FilterSelect
                fullWidth
                value={sector}
                onChange={setSector}
                options={[
                  { value: "all", label: "All Sectors" },
                  ...filterOptions.sectors.map((s) => ({
                    value: s,
                    label: SECTOR_LABELS[s] || s,
                  })),
                ]}
              />
              <FilterSelect
                fullWidth
                value={category}
                onChange={setCategory}
                options={[
                  { value: "all", label: "All Categories" },
                  ...filterOptions.categories.map((c) => ({
                    value: c,
                    label: c,
                  })),
                ]}
              />
              <FilterSelect
                fullWidth
                value={division}
                onChange={setDivision}
                options={[
                  { value: "all", label: "All Divisions" },
                  ...filterOptions.divisions
                    .filter((d) => d !== "All")
                    .map((d) => ({ value: d, label: d })),
                ]}
              />
              <FilterSelect
                fullWidth
                value={employmentType}
                onChange={setEmploymentType}
                options={[
                  { value: "all", label: "All Types" },
                  ...filterOptions.employmentTypes.map((t) => ({
                    value: t,
                    label: EMPLOYMENT_LABELS[t] || t,
                  })),
                ]}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 text-sm text-[#994D35] hover:text-[#3D444C] font-semibold border border-[#994D35]/30 rounded-lg"
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
        {/* Result count */}
        {!loading && pagination && (
          <p className="text-sm text-[#3D444C]/60 mb-6">
            Showing{" "}
            <span className="font-bold text-[#3D444C]">
              {jobs.length === 0 ? 0 : 1}–{jobs.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[#3D444C]">{pagination.total}</span>{" "}
            job{pagination.total !== 1 ? "s" : ""}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState onClear={clearFilters} hasFilters={!!hasActiveFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Load More */}
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
                      <FaChevronDown /> Load More Jobs
                    </>
                  )}
                </button>
              </div>
            )}

            {/* All loaded indicator */}
            {!pagination?.hasMore && jobs.length > PAGE_SIZE && (
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

export default JobsClient;

// =====================================================================
// Job Card
// =====================================================================
const JobCard = ({ job }) => {
  const thumbnail = job.images?.[0]?.url;

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

  // Urgency tier
  let urgency = null;
  if (daysRemaining !== null) {
    if (daysRemaining <= 3) urgency = "critical";
    else if (daysRemaining <= 7) urgency = "soon";
    else urgency = "normal";
  }

  const urgencyBadge = {
    critical: "bg-red-100 text-red-700 border-red-300",
    soon: "bg-amber-100 text-amber-700 border-amber-300",
    normal: "bg-[#D3A16D]/20 text-[#994D35] border-[#D3A16D]/40",
  };

  const deadlineStr = deadline
    ? deadline.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const isWalkIn = job.applicationMode === "walk-in";

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-44 bg-[#3D444C]/5 overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={job.jobTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3D444C]/5 to-[#D3A16D]/10">
            <FaBriefcase className="text-5xl text-[#3D444C]/20" />
          </div>
        )}

        {/* Sector badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${
              SECTOR_COLORS[job.sector] ||
              "bg-gray-100 text-gray-700 border-gray-300"
            }`}
          >
            {SECTOR_LABELS[job.sector] || job.sector}
          </span>
        </div>

        {/* Deadline badge */}
        {deadlineStr && (
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border backdrop-blur-md ${
                urgencyBadge[urgency] || urgencyBadge.normal
              }`}
            >
              {isWalkIn ? (
                <>
                  <FaClock className="text-[8px]" />
                  Walk-in
                </>
              ) : daysRemaining === 0 ? (
                <>
                  <FaFire className="text-[8px]" /> Closes today
                </>
              ) : daysRemaining === 1 ? (
                <>
                  <FaClock className="text-[8px]" /> 1 day left
                </>
              ) : (
                <>
                  <FaClock className="text-[8px]" />
                  {daysRemaining} days left
                </>
              )}
            </span>
          </div>
        )}

        {/* Multiple images indicator */}
        {job.images?.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/60 text-white backdrop-blur-md">
              +{job.images.length - 1}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category */}
        <p className="text-xs text-[#994D35] font-semibold uppercase tracking-wide mb-1">
          {job.category}
        </p>

        {/* Title */}
        <h3 className="font-bold text-[#3D444C] text-base leading-snug line-clamp-2 mb-3 group-hover:text-[#994D35] transition-colors">
          {job.jobTitle}
        </h3>

        {/* Meta */}
        <div className="space-y-1.5 mb-4 text-sm">
          {job.location && (
            <div className="flex items-start gap-2 text-[#3D444C]/70">
              <FaMapMarkerAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-xs" />
              <span className="line-clamp-1">
                {job.location}
                {job.division ? ` • ${job.division}` : ""}
              </span>
            </div>
          )}
          <div className="flex items-start gap-2 text-[#3D444C]/70">
            <FaBriefcase className="text-[#D3A16D] mt-0.5 shrink-0 text-xs" />
            <span className="capitalize">
              {EMPLOYMENT_LABELS[job.employmentType] || job.employmentType}
            </span>
          </div>
          {deadlineStr && !isWalkIn && (
            <div className="flex items-start gap-2 text-[#3D444C]/70">
              <FaCalendarAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-xs" />
              <span className="line-clamp-1">Deadline: {deadlineStr}</span>
            </div>
          )}
          {deadlineStr && isWalkIn && (
            <div className="flex items-start gap-2 text-[#3D444C]/70">
              <FaCalendarAlt className="text-[#D3A16D] mt-0.5 shrink-0 text-xs" />
              <span className="line-clamp-1">Walk-in: {deadlineStr}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C]/70 text-[10px] font-medium"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D3A16D]/15 text-[#994D35] border border-[#D3A16D]/30">
            {isWalkIn ? "Walk-in" : "Apply before"}
          </span>
          <span className="text-[#994D35] text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            View <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

// =====================================================================
// Filter Select
// =====================================================================
const FilterSelect = ({ value, onChange, options, fullWidth }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm ${
      fullWidth ? "w-full" : ""
    }`}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// =====================================================================
// Skeleton
// =====================================================================
const JobSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#3D444C]/10 animate-pulse">
    <div className="relative w-full h-44 bg-[#3D444C]/10">
      <div className="absolute top-3 left-3 h-6 w-20 rounded-full bg-white/60" />
      <div className="absolute top-3 right-3 h-6 w-24 rounded-full bg-white/60" />
    </div>
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 rounded bg-[#3D444C]/10" />
      <div className="h-5 w-4/5 rounded bg-[#3D444C]/10" />
      <div className="h-5 w-3/5 rounded bg-[#3D444C]/10" />
      <div className="space-y-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#3D444C]/10" />
          <div className="h-3 w-2/3 rounded bg-[#3D444C]/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#3D444C]/10" />
          <div className="h-3 w-1/2 rounded bg-[#3D444C]/10" />
        </div>
      </div>
      <div className="pt-4 border-t border-[#3D444C]/10 flex items-center justify-between">
        <div className="h-6 w-24 rounded-full bg-[#3D444C]/10" />
        <div className="h-3 w-16 rounded bg-[#3D444C]/10" />
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
      <FaBriefcase className="text-3xl text-[#994D35]" />
    </div>
    <h3 className="text-xl font-bold text-[#3D444C] mb-2">No jobs found</h3>
    <p className="text-[#3D444C]/60 text-sm mb-6 max-w-sm mx-auto">
      {hasFilters
        ? "Try adjusting your search or filters to find what you're looking for."
        : "No active jobs right now. Check back soon!"}
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