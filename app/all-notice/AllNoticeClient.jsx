// app/all-notice/AllNoticeClient.jsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaSearch,
  FaFilter,
  FaCalendar,
  FaUser,
  FaBell,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
  FaBullhorn,
  FaGraduationCap,
  FaBriefcase,
  FaStar,
} from "react-icons/fa";
import { formatDistanceToNow, format } from "date-fns";

// Category options
const CATEGORIES = [
  { value: "general", label: "General", icon: FaInfoCircle },
  { value: "academic", label: "Academic", icon: FaGraduationCap },
  { value: "event", label: "Event", icon: FaCalendar },
  { value: "career", label: "Career", icon: FaBriefcase },
  { value: "important", label: "Important", icon: FaStar },
  { value: "club", label: "Club", icon: FaBullhorn },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priority", label: "By Priority" },
];

// Create a separate component that uses useSearchParams
const AllNoticeContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalNotices, setTotalNotices] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const limit = 50;

  // Fetch notices
  const fetchNotices = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: pageNum,
        limit,
        sortBy,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== "all" && { category: selectedCategory }),
      });

      const response = await fetch(`/api/users/notice/get-notice?${params}`);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setNotices(prev => [...prev, ...data.notices]);
        } else {
          setNotices(data.notices);
        }
        setHasMore(data.pagination.hasMore);
        setTotalNotices(data.pagination.total);
        setCategories(data.categories || []);
        setPage(pageNum);
      } else {
        setError(data.message || "Failed to fetch notices");
      }
    } catch (error) {
      console.error("Fetch notices error:", error);
      setError("Failed to load notices. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, selectedCategory, sortBy]);

  // Initial load
  useEffect(() => {
    fetchNotices(1, false);
  }, [fetchNotices]);

  // Load more
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotices(page + 1, true);
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchNotices(1, false);
  };

  // Handle filter change
  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    fetchNotices(1, false);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    fetchNotices(1, false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("newest");
    fetchNotices(1, false);
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const configs = {
      low: { bg: "bg-gray-100", text: "text-gray-600", label: "Low" },
      medium: { bg: "bg-blue-100", text: "text-blue-600", label: "Medium" },
      high: { bg: "bg-orange-100", text: "text-orange-600", label: "High" },
      urgent: { bg: "bg-red-100", text: "text-red-600", label: "Urgent" },
    };
    return configs[priority] || configs.medium;
  };

  const getCategoryLabel = (value) => {
    const category = CATEGORIES.find(c => c.value === value);
    return category ? category.label : value;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C] flex items-center gap-3">
            <FaBell className="text-[#994D35]" />
            All Notices
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with the latest announcements and updates
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#994D35] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleFilterChange(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedCategory === cat.value
                      ? "bg-[#994D35] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="text-xs" />
                  {cat.label}
                </button>
              );
            })}
            {selectedCategory !== "all" && (
              <button
                onClick={resetFilters}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && !error && (
          <div className="text-sm text-gray-500 mb-4">
            Showing {notices.length} of {totalNotices} notices
          </div>
        )}

        {/* Notices Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-[#994D35] text-4xl" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-xl font-bold text-[#3D444C] mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-500">{error}</p>
            <button
              onClick={() => fetchNotices(1, false)}
              className="mt-4 px-6 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-bold text-[#3D444C] mb-2">
              No Notices Found
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your filters or search terms"
                : "Check back later for new announcements"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => {
              const priority = getPriorityBadge(notice.priority);
              return (
                <Link
                  key={notice._id}
                  href={`/all-notice/${notice._id}`}
                  className="block"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text}`}>
                            {priority.label}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FaCalendar className="text-[10px]" />
                            {format(new Date(notice.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FaUser className="text-[10px]" />
                            {notice.createdByName || "Unknown"}
                          </span>
                          <span className="text-xs bg-[#E7E3D8] text-[#3D444C] px-2 py-0.5 rounded-full">
                            {getCategoryLabel(notice.category)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#3D444C] hover:text-[#994D35] transition-colors line-clamp-2">
                          {notice.title}
                        </h3>
                        {/* Content */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {notice.content.replace(/<[^>]*>?/gm, "")}
                    </p>
                        {notice.images && notice.images.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                            <span>🖼️</span>
                            <span>{notice.images.length} image(s)</span>
                          </div>
                        )}
                      </div>
                      {/* Priority indicator */}
                      {notice.priority === "urgent" && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                            <FaExclamationTriangle className="text-xs" />
                            Urgent
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-[#994D35] text-white rounded-xl font-semibold hover:bg-[#3D444C] transition-all duration-300 hover:scale-[1.02] shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {/* End of results */}
            {!hasMore && notices.length > 0 && (
              <div className="text-center text-gray-400 text-sm pt-4">
                You've seen all {totalNotices} notices
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const AllNoticeClient = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4 font-medium">Loading notices...</p>
        </div>
      </div>
    }>
      <AllNoticeContent />
    </Suspense>
  );
};

export default AllNoticeClient;