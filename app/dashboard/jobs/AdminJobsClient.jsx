// app/dashboard/jobs/AdminJobsClient.jsx
"use client";

import DashboardMenu from "@/app/components/layout/DashboardMenu";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Editor } from "@tinymce/tinymce-react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  FaPlus,
  FaTimes,
  FaImage,
  FaSpinner,
  FaCheck,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaBriefcase,
  FaExclamationTriangle,
  FaFilter,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const SECTORS = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "ngo", label: "NGO" },
  { value: "international", label: "International" },
  { value: "autonomous", label: "Autonomous" },
];

const CATEGORIES = [
  "IT & Software",
  "Engineering",
  "Banking & Finance",
  "Education & Teaching",
  "Healthcare & Medical",
  "Government Service",
  "Marketing & Sales",
  "Accounting & Finance",
  "Human Resources",
  "Customer Service",
  "Garments & Textile",
  "Construction & Real Estate",
  "Telecommunication",
  "Logistics & Transport",
  "Media & Journalism",
  "Legal",
  "Hospitality & Tourism",
  "Agriculture",
  "NGO & Development",
  "Research & Development",
  "Management",
  "Other",
];

const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "temporary", label: "Temporary" },
];

const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
  "All",
  "",
];

const SECTOR_BADGE = {
  government: "bg-red-100 text-red-700 border-red-300",
  private: "bg-blue-100 text-blue-700 border-blue-300",
  ngo: "bg-purple-100 text-purple-700 border-purple-300",
  international: "bg-green-100 text-green-700 border-green-300",
  autonomous: "bg-amber-100 text-amber-700 border-amber-300",
};

// ------------------------------------------------------------
// Main Admin Component
// ------------------------------------------------------------
const AdminJobsClient = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  

  // filters
  const [sectorFilter, setSectorFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // per-row action state
  const [actionLoading, setActionLoading] = useState({});
  const setJobAction = (id, action) =>
    setActionLoading((prev) => ({ ...prev, [id]: action }));
  const clearJobAction = (id) =>
    setActionLoading((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  // ---------- Fetch list ----------
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sectorFilter !== "all") params.set("sector", sectorFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (divisionFilter !== "all") params.set("division", divisionFilter);
      if (employmentFilter !== "all")
        params.set("employmentType", employmentFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/secure/jobs/list?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      } else {
        toast.error(data.message || "Failed to load jobs");
      }
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [
    sectorFilter,
    categoryFilter,
    divisionFilter,
    employmentFilter,
    searchQuery,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ---------- Open edit ----------
  const openEdit = async (jobId) => {
    if (actionLoading[jobId]) return;
    setJobAction(jobId, "edit");
    try {
      const res = await fetch(`/api/secure/jobs/${jobId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEditingJob(data.job);
        setShowModal(true);
      } else {
        toast.error(data.message || "Failed to load job");
      }
    } catch {
      toast.error("Failed to load job");
    } finally {
      clearJobAction(jobId);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/secure/jobs/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Job deleted");
        setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Toggle active ----------
  const toggleActive = async (job) => {
    if (actionLoading[job._id]) return;
    setJobAction(job._id, "toggle");
    try {
      // Fetch full doc (PUT needs all required fields)
      const getRes = await fetch(`/api/secure/jobs/${job._id}`, {
        credentials: "include",
      });
      const getData = await getRes.json();
      if (!getData.success) {
        toast.error(getData.message || "Failed to load job");
        return;
      }

      const full = getData.job;
      const fd = new FormData();
      fd.append("jobTitle", full.jobTitle);
      fd.append("sector", full.sector);
      fd.append("category", full.category);
      fd.append("employmentType", full.employmentType);
      fd.append("location", full.location || "");
      fd.append("division", full.division || "");
      fd.append("jobDescription", full.jobDescription);
         fd.append("applyLink", full.applyLink || "");
      fd.append("applicationMode", full.applicationMode || "apply-before");
      if (full.applicationDeadline) {
        fd.append(
          "applicationDeadline",
          new Date(full.applicationDeadline).toISOString().split("T")[0],
        );
      }
      fd.append("isActive", String(!full.isActive));
      (full.tags || []).forEach((t) => fd.append("tags", t));
      // keep all existing images
      (full.images || []).forEach((img) =>
        fd.append("existingImageIds[]", img.publicId),
      );

      const res = await fetch(`/api/secure/jobs/${job._id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          full.isActive ? "Job hidden from public" : "Job is now live",
        );
        fetchJobs();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      clearJobAction(job._id);
    }
  };

  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Jobs Management
            </h1>
            <p className="text-gray-600 mt-1">
              Post, edit and manage job circulars
            </p>
          </div>
          <button
            onClick={() => {
              setEditingJob(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#3D444C] transition-all duration-300 font-medium shadow-md"
          >
            <FaPlus /> New Job
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-4 mb-6 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              value={searchQuery}
              disabled={loading}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location or tag..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-[#3D444C]/40" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="all">All Sectors</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="all">All Divisions</option>
              {DIVISIONS.filter(Boolean).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={employmentFilter}
              onChange={(e) => setEmploymentFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="all">All Types</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-[#994D35]" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FaBriefcase className="text-5xl text-[#3D444C]/20 mx-auto mb-4" />
            <p className="text-gray-500">
              No jobs found. Click <strong>New Job</strong> to post the first
              one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const currentAction = actionLoading[job._id];
              const isBusy = !!currentAction;
              const thumb = job.images?.[0]?.url;
              const deadline = job.applicationDeadline
                ? new Date(job.applicationDeadline)
                : null;
              const deadlineStr = deadline
                ? deadline.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <div
                  key={job._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
                >
                  {/* Image / placeholder */}
                  <div className="relative w-full h-44 bg-[#3D444C]/5">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={job.jobTitle}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBriefcase className="text-5xl text-[#3D444C]/15" />
                      </div>
                    )}

                    {/* Active badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                          job.isActive
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-gray-200 text-gray-600 border-gray-300"
                        }`}
                      >
                        {job.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>

                    {/* Sector badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                          SECTOR_BADGE[job.sector] ||
                          "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        {job.sector}
                      </span>
                    </div>

                    {/* Image count */}
                    {job.images?.length > 1 && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/60 text-white">
                          +{job.images.length - 1} more
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-[#994D35] font-semibold uppercase tracking-wide mb-1">
                      {job.category}
                    </p>
                    <h3 className="font-bold text-[#3D444C] text-base leading-snug line-clamp-2 mb-2">
                      {job.jobTitle}
                    </h3>

                    {/* Meta */}
                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-[#D3A16D]" />
                          <span className="truncate">
                            {job.location}
                            {job.division ? ` • ${job.division}` : ""}
                          </span>
                        </div>
                      )}
                      {deadlineStr && (
                        <div className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-[#D3A16D]" />
                          <span>Deadline: {deadlineStr}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <FaBriefcase className="text-[#D3A16D]" />
                        <span className="capitalize">
                          {job.employmentType}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {job.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C]/70 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto flex gap-2 pt-3 border-t border-[#3D444C]/10">
                      <button
                        onClick={() => openEdit(job._id)}
                        disabled={isBusy}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#E7E3D8] text-[#3D444C] hover:bg-[#D3A16D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentAction === "edit" ? (
                          <>
                            <FaSpinner className="animate-spin" /> Loading...
                          </>
                        ) : (
                          <>
                            <FaEdit /> Edit
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => toggleActive(job)}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={job.isActive ? "Hide" : "Show"}
                      >
                        {currentAction === "toggle" ? (
                          <FaSpinner className="animate-spin" />
                        ) : job.isActive ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(job)}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <JobModal
          job={editingJob}
          onClose={() => {
            setShowModal(false);
            setEditingJob(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingJob(null);
            fetchJobs();
          }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D444C]">
                  Delete Job?
                </h3>
                <p className="text-sm text-gray-600">
                  This will also delete all uploaded images. Cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-[#E7E3D8]/50 rounded-lg p-3 mb-5">
              <p className="text-sm font-semibold text-[#3D444C] line-clamp-2">
                {deleteTarget.jobTitle}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {deleteTarget.images?.length || 0} image
                {(deleteTarget.images?.length || 0) !== 1 ? "s" : ""} will also
                be deleted
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsClient;

// =====================================================================
// Job Modal (Create + Edit)
// =====================================================================
const JobModal = ({ job, onClose, onSaved }) => {
  const editorRef = useRef(null);
  const isEdit = !!job;

  // ---------- form state ----------
  const [jobTitle, setJobTitle] = useState(job?.jobTitle || "");
  const [sector, setSector] = useState(job?.sector || "private");
  const [category, setCategory] = useState(job?.category || "Other");
  const [employmentType, setEmploymentType] = useState(
    job?.employmentType || "full-time",
  );
  const [location, setLocation] = useState(job?.location || "");
  const [division, setDivision] = useState(job?.division || "");
  const [jobDescription, setJobDescription] = useState(
    job?.jobDescription || "",
  );
  const [applyLink, setApplyLink] = useState(job?.applyLink || "");
  const [applicationMode, setApplicationMode] = useState(
    job?.applicationMode || "apply-before",
  );
  const [applicationDeadline, setApplicationDeadline] = useState(
    job?.applicationDeadline
      ? new Date(job.applicationDeadline).toISOString().split("T")[0]
      : "",
  );
  const [tagsInput, setTagsInput] = useState((job?.tags || []).join(", "));
  const [isActive, setIsActive] = useState(job?.isActive ?? true);

  // ---------- existing images (already uploaded) ----------
  const [existingImages, setExistingImages] = useState(job?.images || []);

  // ---------- new image files to upload ----------
  const [newImages, setNewImages] = useState([]); // File[]
  const [newImagePreviews, setNewImagePreviews] = useState([]); // data URLs

  const [submitting, setSubmitting] = useState(false);

  // ---------- Handlers ----------
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = [];
    const previews = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      valid.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setNewImages((prev) => [...prev, ...valid]);
    setNewImagePreviews((prev) => [...prev, ...previews]);

    // reset input so the same file can be picked again if removed
    e.target.value = "";
  };

  const removeExistingImage = (publicId) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.publicId !== publicId),
    );
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobTitle.trim()) return toast.error("Job title is required");

    const html = editorRef.current?.getContent() || "";
    if (!html.trim() || html === "<p></p>") {
      return toast.error("Job description is required");
    }

    if (!applyLink.trim() && existingImages.length === 0 && newImages.length === 0) {
      return toast.error("Provide an apply link or at least one image");
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("jobTitle", jobTitle.trim());
      fd.append("sector", sector);
      fd.append("category", category);
      fd.append("employmentType", employmentType);
      fd.append("location", location);
      fd.append("division", division);
      fd.append("jobDescription", html);
      fd.append("applyLink", applyLink);
      fd.append("applicationMode", applicationMode);
      fd.append("applicationDeadline", applicationDeadline);
      fd.append("isActive", String(isActive));

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tags.forEach((t) => fd.append("tags", t));

      // existing images to keep (only in edit mode)
      if (isEdit) {
        existingImages.forEach((img) =>
          fd.append("existingImageIds[]", img.publicId),
        );
      }

      // new files
      newImages.forEach((file) => fd.append("images", file));

      const url = isEdit
        ? `/api/secure/jobs/${job._id}`
        : "/api/secure/jobs/create";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEdit ? "Job updated!" : "Job created!");
        onSaved();
      } else {
        toast.error(data.message || "Failed to save job");
      }
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[#3D444C] text-[#E7E3D8] px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">
              {isEdit ? "Edit Job" : "Create New Job"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-[#994D35] transition-colors"
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Accountant"
                maxLength={200}
                required
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
            </div>

            {/* Sector + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                  Sector *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                >
                  {SECTORS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employment + Division */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                  Division
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                >
                  <option value="">Not specified</option>
                  {DIVISIONS.filter((d) => d && d !== "All").map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gulshan, Dhaka"
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
            </div>

            {/* Description — TinyMCE */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Job Description *
              </label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={jobDescription}
                init={{
                  height: 420,
                  menubar: true,
                  branding: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "help",
                    "wordcount",
                    "emoticons",
                    "codesample",
                    "quickbars",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor backcolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "link image media table | " +
                    "codesample emoticons | removeformat | code preview fullscreen | help",
                  content_style:
                    "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #3D444C; }",
                  quickbars_selection_toolbar:
                    "bold italic | quicklink h2 h3 blockquote",
                  image_advtab: true,
                  image_title: true,
                  automatic_uploads: true,
                  file_picker_types: "image",
                  images_upload_handler: async (blobInfo) => {
                    const fd = new FormData();
                    fd.append("file", blobInfo.blob(), blobInfo.filename());
                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: fd,
                      credentials: "include",
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error("Upload failed");
                    return data.imageUrl || data.url;
                  },
                }}
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                Images (job circular, flyer, etc.)
              </label>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">
                    Existing — click ✕ to remove
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {existingImages.map((img) => (
                      <div
                        key={img.publicId}
                        className="relative aspect-square rounded-lg overflow-hidden border border-[#3D444C]/10 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.fileName || "Job image"}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.publicId)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly picked (not yet uploaded) */}
              {newImagePreviews.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">
                    New — will upload on save
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {newImagePreviews.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#D3A16D] group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`New ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add files */}
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#E7E3D8] border border-[#D3A16D] rounded-lg text-sm font-medium text-[#3D444C] hover:bg-[#D3A16D]/30 transition-colors">
                <FaImage /> Add Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImages}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG/PNG, up to 5MB each. Multiple files supported.
              </p>
            </div>

                      {/* Application Mode */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                Application Mode
              </label>
              <div className="inline-flex rounded-lg overflow-hidden border border-[#3D444C]/20">
                <button
                  type="button"
                  onClick={() => setApplicationMode("apply-before")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    applicationMode === "apply-before"
                      ? "bg-[#994D35] text-white"
                      : "bg-white text-[#3D444C] hover:bg-[#E7E3D8]"
                  }`}
                >
                  Apply before deadline
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationMode("walk-in")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    applicationMode === "walk-in"
                      ? "bg-[#994D35] text-white"
                      : "bg-white text-[#3D444C] hover:bg-[#E7E3D8]"
                  }`}
                >
                  Walk-in interview
                </button>
              </div>
            </div>

            {/* Apply Link + Deadline (adaptive) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicationMode === "apply-before" && (
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                    Apply Link
                  </label>
                  <input
                    type="url"
                    value={applyLink}
                    onChange={(e) => setApplyLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
                  />
                </div>
              )}

              <div
                className={
                  applicationMode === "walk-in" ? "md:col-span-2" : undefined
                }
              >
                <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                  {applicationMode === "walk-in"
                    ? "Walk-in Date"
                    : "Application Deadline"}
                </label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
                />
                {applicationMode === "walk-in" && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Candidates should appear at the venue on this date.
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comma separated (e.g. remote, senior, bdjobs)"
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 bg-[#E7E3D8]/30 rounded-lg p-4 border border-[#3D444C]/10">
              <input
                type="checkbox"
                id="job-isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 accent-[#994D35]"
              />
              <label
                htmlFor="job-isActive"
                className="text-sm font-medium text-[#3D444C] cursor-pointer select-none"
              >
                Show this job on the public site
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#3D444C]/10">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#D3A16D] text-[#3D444C] rounded-lg hover:bg-[#994D35] hover:text-white font-bold disabled:opacity-60 flex items-center gap-2 transition-colors"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />{" "}
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <FaCheck /> {isEdit ? "Update Job" : "Create Job"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};