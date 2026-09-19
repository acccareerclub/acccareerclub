// app/dashboard/settings/alumni/AlumniClient.jsx
"use client";

import DashboardMenu from "@/app/components/layout/DashboardMenu";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import {
  FaArrowLeft,
  FaUsers,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaEye,
  FaEdit,
  FaTimes,
  FaBriefcase,
  FaBuilding,
  FaPhone,
  FaGraduationCap,
  FaLayerGroup,
  FaUserGraduate,
  FaCheckCircle,
  FaBan,
  FaUndo,
  FaUserCheck,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import CreateAlumniModal from "./CreateAlumniModal";

// ==================== SHIMMER ====================
const ShimmerRow = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
  </div>
);

const ShimmerList = ({ count = 6 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <ShimmerRow key={i} />
    ))}
  </div>
);

// ==================== MAIN ====================
const AlumniClient = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterJobStatus, setFilterJobStatus] = useState("");

  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    batch: "",
    passedYear: "",
    currentJobCompany: "",
    currentDesignation: "",
    isUnemployed: false,
    contactPhone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const LIMIT = 100;

  // ==================== FETCH ====================
  const fetchAlumni = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const params = new URLSearchParams({
          page: pageNum,
          limit: LIMIT,
          ...(searchTerm && { search: searchTerm }),
          ...(filterDepartment && { department: filterDepartment }),
          ...(filterBatch && { batch: filterBatch }),
          ...(filterJobStatus && { jobStatus: filterJobStatus }),
        });

        const res = await fetch(`/api/secure/alumni?${params}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setAlumni((prev) =>
            append ? [...prev, ...data.alumni] : data.alumni,
          );
          setHasMore(data.pagination.hasMore);
          setTotal(data.pagination.total);
          setPage(pageNum);
          setDepartments(data.filters.departments || []);
          setBatches(data.filters.batches || []);
        } else {
          toast.error(data.message || "Failed to fetch alumni");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch alumni");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, filterDepartment, filterBatch, filterJobStatus],
  );

  useEffect(() => {
    fetchAlumni(1, false);
  }, [fetchAlumni]);

  // ==================== HANDLERS ====================
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilterDepartment("");
    setFilterBatch("");
    setFilterJobStatus("");
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) fetchAlumni(page + 1, true);
  };

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditForm({
      batch: user.alumniInfo?.batch || "",
      passedYear: user.alumniInfo?.passedYear || "",
      currentJobCompany: user.alumniInfo?.currentJobCompany || "",
      currentDesignation: user.alumniInfo?.currentDesignation || "",
      isUnemployed: user.alumniInfo?.isUnemployed || false,
      contactPhone: user.alumniInfo?.contactPhone || user.phone || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;

    // Validation
    if (
      !editForm.isUnemployed &&
      (!editForm.currentJobCompany || !editForm.currentDesignation)
    ) {
      toast.error(
        "Please fill in company and designation, or mark as unemployed",
      );
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/secure/alumni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: editUser._id,
          action: "updateAlumniInfo",
          alumniInfo: editForm,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Alumni info updated!");
        setEditUser(null);
        fetchAlumni(1, false);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreMember = async (user) => {
    if (!confirm(`Restore ${user.fullName} as a regular member?`)) return;
    try {
      const res = await fetch("/api/secure/alumni", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: user._id, action: "restoreMember" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchAlumni(1, false);
      } else {
        toast.error(data.message || "Failed to restore");
      }
    } catch (err) {
      toast.error("Failed to restore");
    }
  };

  // ==================== GROUP BY DEPARTMENT THEN BATCH ====================
  const grouped = alumni.reduce((acc, user) => {
    const dept = user.department || "Unknown Department";
    const batch = user.alumniInfo?.batch || "Unknown Batch";

    if (!acc[dept]) acc[dept] = {};
    if (!acc[dept][batch]) acc[dept][batch] = [];
    acc[dept][batch].push(user);
    return acc;
  }, {});

  const sortedDepartments = Object.keys(grouped).sort();
  const sortedBatches = (dept) =>
    Object.keys(grouped[dept]).sort((a, b) => b.localeCompare(a));

  const activeFilterCount =
    (searchTerm ? 1 : 0) +
    (filterDepartment ? 1 : 0) +
    (filterBatch ? 1 : 0) +
    (filterJobStatus ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6 gap-3">
          <div>
            <Link
              href="/dashboard/settings"
              className="text-[#3D444C] hover:text-[#994D35] flex items-center mb-2 transition-colors"
            >
              <FaArrowLeft className="mr-2" /> Back
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C] flex items-center gap-3">
              <FaUsers className="text-[#994D35]" /> Alumni Management
            </h1>
            <p className="text-gray-600 mt-1">
              View, edit and manage alumni of ACC Career Club
            </p>
          </div>

          {/* Right side: Create button + Total count */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#3D444C] text-white px-4 py-3 rounded-xl shadow-md hover:bg-[#994D35] transition-colors flex items-center gap-2 font-medium"
            >
              <FaUserGraduate /> Create Alumni
            </button>
            <div className="bg-white rounded-xl shadow-md px-5 py-3 flex items-center gap-3">
              <FaUserGraduate className="text-[#994D35] text-xl" />
              <div>
                <p className="text-xs text-gray-500">Total Alumni</p>
                <p className="text-2xl font-bold text-[#3D444C]">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 lg:col-span-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name, email, ID, company..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Department */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Batch */}
            <select
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  Batch {b}
                </option>
              ))}
            </select>
          </div>

          {/* Second Row - Job Status */}
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200">
            <FaFilter className="text-gray-400" />
            <button
              onClick={() => setFilterJobStatus("")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterJobStatus === ""
                  ? "bg-[#994D35] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterJobStatus("employed")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                filterJobStatus === "employed"
                  ? "bg-[#994D35] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaBriefcase className="text-xs" /> Employed
            </button>
            <button
              onClick={() => setFilterJobStatus("unemployed")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                filterJobStatus === "unemployed"
                  ? "bg-[#994D35] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaBan className="text-xs" /> Unemployed
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <FaTimes /> Clear All ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <ShimmerList count={6} />
        ) : alumni.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-[#3D444C] mb-2">
              No Alumni Found
            </h3>
            <p className="text-gray-500">
              {activeFilterCount > 0
                ? "Try adjusting your filters"
                : "No alumni have been added yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDepartments.map((dept) => (
              <div
                key={dept}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                {/* Department Header */}
                <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-5 py-3 flex items-center gap-3">
                  <FaBuilding className="text-[#D3A16D]" />
                  <h2 className="text-lg font-bold text-[#E7E3D8]">{dept}</h2>
                  <span className="ml-auto bg-[#D3A16D] text-[#3D444C] text-xs font-bold px-2.5 py-1 rounded-full">
                    {Object.values(grouped[dept]).reduce(
                      (sum, arr) => sum + arr.length,
                      0,
                    )}{" "}
                    alumni
                  </span>
                </div>

                {/* Batches */}
                <div className="p-4 space-y-4">
                  {sortedBatches(dept).map((batch) => (
                    <div key={batch}>
                      <div className="flex items-center gap-2 mb-2">
                        <FaLayerGroup className="text-[#994D35] text-sm" />
                        <h3 className="font-semibold text-[#3D444C]">
                          Batch: {batch}
                        </h3>
                        <span className="text-xs text-gray-400">
                          ({grouped[dept][batch].length})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {grouped[dept][batch].map((user) => (
                          <AlumniCard
                            key={user._id}
                            user={user}
                            onView={() => setViewUser(user)}
                            onEdit={() => handleOpenEdit(user)}
                            onRestore={() => handleRestoreMember(user)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-2">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-[#994D35] text-white rounded-xl font-semibold hover:bg-[#3D444C] transition-all disabled:opacity-60 flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin" /> Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}

            {!hasMore && alumni.length > 0 && (
              <p className="text-center text-sm text-gray-400 py-2">
                You've seen all {total} alumni
              </p>
            )}
          </div>
        )}
      </div>

      {/* ==================== VIEW MODAL ==================== */}
      {viewUser && (
        <ViewModal user={viewUser} onClose={() => setViewUser(null)} />
      )}

      {/* ==================== EDIT MODAL ==================== */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#3D444C] flex items-center gap-2">
                <FaEdit className="text-[#994D35]" /> Edit Alumni
              </h2>
              <button
                onClick={() => setEditUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-[#3D444C] font-semibold">
                  {editUser.fullName}
                </p>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20"
                  value={editForm.batch}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>

              {/* Passed Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passing Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024"
                  value={editForm.passedYear}
                  onChange={(e) =>
                    setEditForm({ ...editForm, passedYear: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>

              {/* Unemployed checkbox */}
              <label className="flex items-center gap-3 p-3 bg-[#E7E3D8]/40 rounded-lg cursor-pointer hover:bg-[#E7E3D8]/60 transition-colors">
                <input
                  type="checkbox"
                  checked={editForm.isUnemployed}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      isUnemployed: e.target.checked,
                      ...(e.target.checked
                        ? { currentJobCompany: "", currentDesignation: "" }
                        : {}),
                    })
                  }
                  className="w-5 h-5 text-[#994D35] rounded focus:ring-[#D3A16D]"
                />
                <div>
                  <p className="font-semibold text-[#3D444C]">
                    Currently Unemployed
                  </p>
                  <p className="text-xs text-gray-500">
                    Check this if the alumni is not currently employed
                  </p>
                </div>
              </label>

              {/* Company */}
              {!editForm.isUnemployed && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FaBuilding className="text-[#994D35]" /> Current Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pran RFL Group"
                      value={editForm.currentJobCompany}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          currentJobCompany: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FaBriefcase className="text-[#994D35]" /> Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Marketing Officer"
                      value={editForm.currentDesignation}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          currentDesignation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaPhone className="text-[#994D35]" /> Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +880 1XXX-XXXXXX"
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditUser(null)}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CREATE ALUMNI MODAL ==================== */}
<CreateAlumniModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreated={() => fetchAlumni(1, false)}
/>
    </div>
  );
};

// ==================== ALUMNI CARD ====================
const AlumniCard = ({ user, onView, onEdit, onRestore }) => {
  const isUnemployed = user.alumniInfo?.isUnemployed;
  const profilePic = user?.personalInfo?.profilePicture;
  const initial = user?.fullName?.[0]?.toUpperCase() || "?";

  return (
    <div className="border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all bg-white">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3D444C] to-[#994D35] text-white font-bold border-2 border-[#D3A16D]/40">
          {profilePic ? (
            <div className="relative w-full h-full">
              <Image
                src={profilePic}
                alt={user.fullName}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
          ) : (
            initial
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#3D444C] truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
              {user.studentId}
            </span>
            {user.alumniInfo?.batch && (
              <span className="text-[10px] bg-[#E7E3D8] text-[#3D444C] px-1.5 py-0.5 rounded font-medium">
                Batch {user.alumniInfo.batch}
              </span>
            )}
          </div>

          {/* Job status */}
          <div className="mt-2">
            {isUnemployed ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                <FaBan className="text-[8px]" /> Unemployed
              </span>
            ) : user.alumniInfo?.currentJobCompany ||
              user.alumniInfo?.currentDesignation ? (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <FaBriefcase className="text-[#994D35] text-[10px]" />
                <span className="truncate">
                  {user.alumniInfo.currentDesignation}
                  {user.alumniInfo.currentJobCompany &&
                    ` at ${user.alumniInfo.currentJobCompany}`}
                </span>
              </div>
            ) : (
              <span className="text-[10px] italic text-gray-400">
                Job info not provided
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <FaEye className="text-xs" /> View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-[#994D35] hover:bg-[#E7E3D8]/50 rounded-lg transition-colors"
        >
          <FaEdit className="text-xs" /> Edit
        </button>
        <button
          onClick={onRestore}
          title="Restore as member"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <FaUndo className="text-xs" /> Restore
        </button>
      </div>
    </div>
  );
};

// ==================== VIEW MODAL ====================
const ViewModal = ({ user, onClose }) => {
  const profilePic = user?.personalInfo?.profilePicture;
  const initial = user?.fullName?.[0]?.toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-[#E7E3D8] flex items-center gap-2">
            <FaUserGraduate /> Alumni Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar + Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3D444C] to-[#994D35] text-white font-bold text-3xl border-4 border-[#D3A16D]/40 shadow-lg">
              {profilePic ? (
                <div className="relative w-full h-full">
                  <Image
                    src={profilePic}
                    alt={user.fullName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
              ) : (
                initial
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-2xl font-bold text-[#3D444C]">
                {user.fullName}
              </h3>
              <p className="text-gray-500">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  ID: {user.studentId}
                </span>
                <span className="text-xs bg-[#E7E3D8] text-[#3D444C] px-2 py-1 rounded font-medium">
                  {user.department}
                </span>
                {user.alumniInfo?.batch && (
                  <span className="text-xs bg-[#D3A16D] text-white px-2 py-1 rounded font-semibold">
                    Batch {user.alumniInfo.batch}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <InfoRow icon={FaPhone} label="Phone" value={user.phone} />
            <InfoRow
              icon={FaPhone}
              label="Contact Phone"
              value={user.alumniInfo?.contactPhone}
            />
            <InfoRow
              icon={FaGraduationCap}
              label="Passing Year"
              value={user.alumniInfo?.passedYear}
            />
            <InfoRow
              icon={FaLayerGroup}
              label="Batch"
              value={user.alumniInfo?.batch}
            />

            {user.alumniInfo?.isUnemployed ? (
              <div className="sm:col-span-2 bg-gray-100 rounded-xl p-4 flex items-center gap-3">
                <FaBan className="text-gray-500 text-2xl" />
                <div>
                  <p className="font-semibold text-gray-700">
                    Currently Unemployed
                  </p>
                  <p className="text-xs text-gray-500">
                    This alumni is currently not employed
                  </p>
                </div>
              </div>
            ) : (
              <>
                <InfoRow
                  icon={FaBuilding}
                  label="Current Company"
                  value={user.alumniInfo?.currentJobCompany}
                />
                <InfoRow
                  icon={FaBriefcase}
                  label="Designation"
                  value={user.alumniInfo?.currentDesignation}
                />
              </>
            )}

            <InfoRow
              icon={FaCheckCircle}
              label="Account Status"
              value={user.isActive !== false ? "Active" : "Inactive"}
            />
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="bg-[#E7E3D8]/30 rounded-xl p-3">
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
      <Icon className="text-[#994D35] text-xs" />
      <span>{label}</span>
    </div>
    <p className="text-sm font-medium text-[#3D444C] break-words">
      {value || "—"}
    </p>
  </div>
);

export default AlumniClient;
