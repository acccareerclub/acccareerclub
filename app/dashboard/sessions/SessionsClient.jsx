// app/dashboard/sessions/SessionsClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSpinner,
  FaMapMarkerAlt,
  FaVideo,
  FaFilePdf,
  FaStar,
  FaClock,
  FaImage,
  FaToggleOn,
  FaUserCheck,
  FaToggleOff,
} from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardMenu from "@/app/components/layout/DashboardMenu";
import Image from "next/image";
import { Editor } from "@tinymce/tinymce-react";
import SessionAttendance from "./SessionAttendance";

const SESSION_TYPES = [
  "workshop",
  "seminar",
  "webinar",
  "meeting",
  "training",
  "competition",
  "other",
];
const SESSION_STATUS = ["upcoming", "completed", "cancelled"];
const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const DEFAULT_BANNER =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";
const PAGE_SIZE = 15;

const SessionsClient = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showInactive, setShowInactive] = useState(false); // ✅ NEW
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    sessionTitle: "",
    sessionDescription: "",
    sessionType: "seminar",
    meetingType: "offline",
    location: "",
    meetingLink: "",
    sessionDate: "",
    sessionDay: "",
    sessionStatus: "upcoming",
    isFeatured: false,
    isActive: true,
    removeBanner: false,
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [preResources, setPreResources] = useState([]);
  const [postResources, setPostResources] = useState([]);
  const [existingPre, setExistingPre] = useState([]);
  const [existingPost, setExistingPost] = useState([]);
  const [preToDelete, setPreToDelete] = useState([]);
  const [postToDelete, setPostToDelete] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState([]);
  const [feedbackToDelete, setFeedbackToDelete] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
    if (!authLoading && isAuthenticated) {
      const allowed = [
        "prefect",
        "itsecretary",
        "modarator",
        "assistant_prefect",
      ];
      if (!allowed.includes(authUser?.role)) router.push("/");
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  // ✅ Fetch: supports pagination + includeInactive
  const fetchSessions = async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        includeInactive: showInactive.toString(),
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
      });

      const res = await fetch(`/api/secure/sessions/get-sessions?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        if (append) {
          setSessions((prev) => [...prev, ...data.sessions]);
        } else {
          setSessions(data.sessions);
        }
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
        setPage(data.currentPage);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    fetchSessions(1, false);
  }, [searchTerm, filterStatus, showInactive]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSessions(page + 1, true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload a valid image");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Banner must be under 5MB");
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(
      (f) => f.type === "application/pdf" && f.size <= 10 * 1024 * 1024,
    );
    if (valid.length !== files.length)
      toast.error("Only PDFs under 10MB allowed.");
    if (type === "pre") setPreResources((prev) => [...prev, ...valid]);
    if (type === "post") setPostResources((prev) => [...prev, ...valid]);
    e.target.value = null;
  };

  const removeNewFile = (index, type) => {
    if (type === "pre")
      setPreResources((prev) => prev.filter((_, i) => i !== index));
    if (type === "post")
      setPostResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const fd = new FormData();
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
    if (bannerFile) fd.append("sessionThumbnail", bannerFile);
    preResources.forEach((f) => fd.append("preResources", f));

    try {
      const res = await fetch("/api/secure/sessions/create-session", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Session created!");
        setShowCreateModal(false);
        resetForm();
        fetchSessions(1, false);
      } else toast.error(data.message);
    } catch {
      toast.error("Error creating session");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const fd = new FormData();
    fd.append("sessionId", selectedSession._id);
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
    fd.append("preResourcesToDelete", JSON.stringify(preToDelete));
    fd.append("postResourcesToDelete", JSON.stringify(postToDelete));
    fd.append("feedbackToDelete", JSON.stringify(feedbackToDelete));
    if (bannerFile) fd.append("sessionThumbnail", bannerFile);
    preResources.forEach((f) => fd.append("newPreResources", f));
    postResources.forEach((f) => fd.append("newPostResources", f));

    try {
      const res = await fetch("/api/secure/sessions/edit-session", {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Session updated!");
        setShowEditModal(false);
        resetForm();
        fetchSessions(1, false);
      } else toast.error(data.message);
    } catch {
      toast.error("Error updating session");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/secure/sessions/delete-session?sessionId=${selectedSession._id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Session deleted!");
        setShowDeleteModal(false);
        fetchSessions(1, false);
      } else toast.error(data.message);
    } catch {
      toast.error("Error deleting session");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sessionTitle: "",
      sessionDescription: "",
      sessionType: "seminar",
      meetingType: "offline",
      location: "",
      meetingLink: "",
      sessionDate: "",
      sessionDay: "",
      sessionStatus: "upcoming",
      isFeatured: false,
      isActive: true,
      removeBanner: false,
    });
    setBannerFile(null);
    setBannerPreview(null);
    setPreResources([]);
    setPostResources([]);
    setExistingPre([]);
    setExistingPost([]);
    setPreToDelete([]);
    setPostToDelete([]);
    setExistingFeedback([]);
    setFeedbackToDelete([]);
  };

  const openEdit = (session) => {
    setSelectedSession(session);
    setFormData({
      sessionTitle: session.sessionTitle,
      sessionDescription: session.sessionDescription,
      sessionType: session.sessionType,
      meetingType: session.meetingType,
      location: session.location || "",
      meetingLink: session.meetingLink || "",
      sessionDate: session.sessionDate
        ? new Date(session.sessionDate).toISOString().split("T")[0]
        : "",
      sessionDay: session.sessionDay || "",
      sessionStatus: session.sessionStatus,
      isFeatured: session.isFeatured || false,
      isActive: session.isActive !== false, // default true
      removeBanner: false,
    });
    setBannerFile(null);
    setBannerPreview(null);
    setExistingPre(session.preResources || []);
    setExistingPost(session.postResources || []);
    setExistingFeedback(session.feedback || []);
    setPreResources([]);
    setPostResources([]);
    setPreToDelete([]);
    setPostToDelete([]);
    setFeedbackToDelete([]);
    setShowEditModal(true);
  };

  const getBannerUrl = (session) =>
    session.sessionThumbnail?.url || DEFAULT_BANNER;
  const getFormBannerPreview = () => {
    if (bannerPreview) return bannerPreview;
    if (showEditModal && selectedSession?.sessionThumbnail?.url)
      return selectedSession.sessionThumbnail.url;
    if (
      showEditModal &&
      selectedSession &&
      !selectedSession.sessionThumbnail?.publicId
    )
      return DEFAULT_BANNER;
    return null;
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E7E3D8]">
        <FaSpinner className="animate-spin text-4xl text-[#3D444C]" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Sessions Management
            </h1>
            <p className="text-[#3D444C]/70 mt-1">
              {totalCount} session{totalCount !== 1 ? "s" : ""} found
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-[#3D444C] text-[#E7E3D8] px-5 py-3 rounded-lg hover:bg-[#994D35] transition-all shadow-lg mt-4 sm:mt-0 font-medium"
          >
            <FaPlus /> <span>New Session</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/30"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/30 focus:outline-none focus:border-[#3D444C]"
          >
            <option value="all">All Status</option>
            {SESSION_STATUS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {/* ✅ Active/Inactive Filter */}
          <select
            value={showInactive ? "all" : "active"}
            onChange={(e) => setShowInactive(e.target.value === "all")}
            className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/30 focus:outline-none focus:border-[#3D444C]"
          >
            <option value="active">Active Only</option>
            <option value="all">All (Active + Inactive)</option>
          </select>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sessions.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-12 text-center text-[#3D444C]/50">
              No Sessions Found
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                  session.isActive === false
                    ? "border-red-300 opacity-75"
                    : "border-[#3D444C]/10"
                }`}
              >
                {/* Banner */}
                <div className="relative w-full h-44 bg-[#3D444C]/10">
                  <Image
                    src={getBannerUrl(session)}
                    alt={session.sessionTitle}
                    fill
                    className={`object-cover ${session.isActive === false ? "grayscale" : ""}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#3D444C]/80 text-[#E7E3D8] text-xs rounded-lg font-medium uppercase tracking-wide backdrop-blur-sm">
                      {session.sessionType}
                    </span>
                    {session.isFeatured && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-[#D3A16D] text-[#3D444C] text-xs rounded-lg font-bold backdrop-blur-sm">
                        <FaStar className="text-[10px]" /> Featured
                      </span>
                    )}
                    {session.isActive === false && (
                      <span className="px-2 py-1 bg-red-500/90 text-white text-xs rounded-lg font-bold backdrop-blur-sm">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-lg font-bold backdrop-blur-sm ${
                      session.sessionStatus === "upcoming"
                        ? "bg-[#D3A16D] text-[#3D444C]"
                        : session.sessionStatus === "completed"
                          ? "bg-green-500/90 text-white"
                          : "bg-red-500/90 text-white"
                    }`}
                  >
                    {session.sessionStatus}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs text-[#3D444C]/50 mb-2">
                    {new Date(session.sessionDate).toLocaleDateString()}
                  </span>
                  <h3 className="text-lg font-bold text-[#3D444C] mb-2 line-clamp-2">
                    {session.sessionTitle}
                  </h3>
                  <p className="text-[#3D444C]/70 text-sm mb-4 line-clamp-3">
                    {session.sessionDescription?.replace(/<[^>]*>?/gm, "")}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#3D444C]/10 text-xs text-[#3D444C]/60">
                    <span className="flex items-center gap-1">
                      <FaClock className="text-[#D3A16D]" />{" "}
                      {session.sessionDay || "N/A"}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                      {session.meetingType === "online" ? (
                        <>
                          <FaVideo className="text-[#D3A16D] shrink-0" /> Online
                        </>
                      ) : (
                        <>
                          <FaMapMarkerAlt className="text-[#D3A16D] shrink-0" />{" "}
                          <span className="truncate">
                            {session.location || "On-site"}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-3 bg-[#E7E3D8]/50 flex justify-end gap-2 border-t border-[#3D444C]/10">
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setShowAttendanceModal(true);
                    }}
                    className="p-2 text-[green] hover:bg-[#D3A16D]/10 rounded-lg transition-colors"
                    title="Take Attendance"
                  >
                    <FaUserCheck />
                  </button>
                  <button
                    onClick={() => openEdit(session)}
                    className="p-2 text-[#3D444C] hover:bg-[#3D444C]/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSession(session);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-[#994D35] hover:bg-[#994D35]/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-[#3D444C] text-[#E7E3D8] rounded-xl font-semibold hover:bg-[#994D35] transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <FaSpinner className="animate-spin" /> Loading...
                </>
              ) : (
                "Load More Sessions"
              )}
            </button>
          </div>
        )}

        {/* End of results */}
        {!hasMore && sessions.length > 0 && (
          <div className="text-center text-[#3D444C]/40 text-sm mt-8">
            You've seen all {totalCount} session{totalCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#3D444C]/20">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3D444C]/10">
              <h2 className="text-2xl font-bold text-[#3D444C]">
                {showCreateModal ? "Create New Session" : "Edit Session"}
              </h2>
              <button
                onClick={() =>
                  showCreateModal
                    ? setShowCreateModal(false)
                    : (setShowEditModal(false), resetForm())
                }
                className="p-2 hover:bg-[#3D444C]/10 rounded-full transition-colors"
              >
                <FaTimes className="text-[#3D444C]" />
              </button>
            </div>

            <form
              onSubmit={showCreateModal ? handleCreate : handleEdit}
              className="space-y-5"
            >
              {/* Banner */}
              <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30">
                <label className="block text-sm font-semibold text-[#3D444C] mb-2 flex items-center gap-2">
                  <FaImage className="text-[#D3A16D]" /> Session Banner
                  (Optional — uses default if not uploaded)
                </label>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-[#3D444C]/5 mb-3 border border-[#3D444C]/10">
                  <Image
                    src={getFormBannerPreview() || DEFAULT_BANNER}
                    alt="Banner Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="flex-1 min-w-[200px] text-sm text-[#3D444C] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3D444C] file:text-[#E7E3D8] file:text-sm file:font-medium hover:file:bg-[#994D35] file:cursor-pointer cursor-pointer"
                  />
                  {showEditModal &&
                    selectedSession?.sessionThumbnail?.publicId && (
                      <label className="flex items-center gap-2 text-sm text-[#994D35] font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          name="removeBanner"
                          checked={formData.removeBanner}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-[#994D35]"
                        />{" "}
                        Remove current banner
                      </label>
                    )}
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={removeBanner}
                      className="text-sm text-[#994D35] hover:text-red-700 font-medium"
                    >
                      Undo upload
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                  Session Title *
                </label>
                <input
                  type="text"
                  name="sessionTitle"
                  value={formData.sessionTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                  Description *
                </label>
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  value={formData.sessionDescription}
                  onEditorChange={(c) =>
                    setFormData({ ...formData, sessionDescription: c })
                  }
                  init={{
                    height: 250,
                    menubar: false,
                    plugins: ["lists link code"],
                    toolbar:
                      "undo redo | bold italic | bullist numlist | removeformat",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; color: #3D444C }",
                  }}
                />
              </div>

              {/* Type + Meeting Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Session Type
                  </label>
                  <select
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/20 focus:outline-none focus:border-[#3D444C]"
                  >
                    {SESSION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Meeting Type
                  </label>
                  <select
                    name="meetingType"
                    value={formData.meetingType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/20 focus:outline-none focus:border-[#3D444C]"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              {formData.meetingType === "online" ? (
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    name="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleInputChange}
                    required
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Room 301, ACC"
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="sessionDate"
                    value={formData.sessionDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Day
                  </label>
                  <select
                    name="sessionDay"
                    value={formData.sessionDay}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/20 focus:outline-none focus:border-[#3D444C]"
                  >
                    <option value="">Select Day</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Status
                  </label>
                  <select
                    name="sessionStatus"
                    value={formData.sessionStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/20 focus:outline-none focus:border-[#3D444C]"
                  >
                    {SESSION_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles: Featured + Active */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-[#D3A16D]/10 rounded-lg border border-[#D3A16D]/30">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#994D35] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="isFeatured"
                    className="flex items-center gap-2 text-sm font-medium text-[#3D444C] cursor-pointer"
                  >
                    <FaStar className="text-[#D3A16D]" /> Mark as Featured
                  </label>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    formData.isActive
                      ? "bg-green-50 border-green-300"
                      : "bg-red-50 border-red-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#3D444C] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="isActive"
                    className={`flex items-center gap-2 text-sm font-medium cursor-pointer ${
                      formData.isActive ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {formData.isActive ? (
                      <FaToggleOn className="text-lg" />
                    ) : (
                      <FaToggleOff className="text-lg" />
                    )}
                    {formData.isActive
                      ? "Active (Visible to members)"
                      : "Inactive (Hidden)"}
                  </label>
                </div>
              </div>

              {/* Pre-Resources */}
              <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30">
                <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                  Pre-Session Resources (PDF, max 10MB each)
                </label>
                {showEditModal && existingPre.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {existingPre.map((r) => (
                      <div
                        key={r.publicId}
                        className="flex justify-between items-center text-sm bg-white p-2 rounded border border-[#3D444C]/10"
                      >
                        <span className="flex items-center gap-2 text-[#3D444C] truncate">
                          <FaFilePdf className="text-[#994D35]" />{" "}
                          {r.fileName || "PDF"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPreToDelete([...preToDelete, r.publicId]);
                            setExistingPre(
                              existingPre.filter(
                                (x) => x.publicId !== r.publicId,
                              ),
                            );
                          }}
                          className="text-[#994D35] hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {preResources.length > 0 && (
                  <div className="mb-2 space-y-1">
                    {preResources.map((file, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm bg-white p-2 rounded border border-[#D3A16D]/40"
                      >
                        <span className="flex items-center gap-2 text-[#3D444C] truncate">
                          <FaFilePdf className="text-[#D3A16D]" /> {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewFile(i, "pre")}
                          className="text-[#994D35] hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => handleFileChange(e, "pre")}
                  className="mt-2 w-full text-sm text-[#3D444C] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3D444C] file:text-[#E7E3D8] file:text-sm file:font-medium hover:file:bg-[#994D35] file:cursor-pointer cursor-pointer"
                />
              </div>

              {/* Post-Resources (Edit only) */}
              {showEditModal && (
                <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30">
                  <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                    Post-Session Resources (PDF, max 10MB each)
                  </label>
                  {existingPost.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {existingPost.map((r) => (
                        <div
                          key={r.publicId}
                          className="flex justify-between items-center text-sm bg-white p-2 rounded border border-[#3D444C]/10"
                        >
                          <span className="flex items-center gap-2 text-[#3D444C] truncate">
                            <FaFilePdf className="text-[#994D35]" />{" "}
                            {r.fileName || "PDF"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPostToDelete([...postToDelete, r.publicId]);
                              setExistingPost(
                                existingPost.filter(
                                  (x) => x.publicId !== r.publicId,
                                ),
                              );
                            }}
                            className="text-[#994D35] hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {postResources.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {postResources.map((file, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-sm bg-white p-2 rounded border border-[#D3A16D]/40"
                        >
                          <span className="flex items-center gap-2 text-[#3D444C] truncate">
                            <FaFilePdf className="text-[#D3A16D]" /> {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeNewFile(i, "post")}
                            className="text-[#994D35] hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => handleFileChange(e, "post")}
                    className="mt-2 w-full text-sm text-[#3D444C] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3D444C] file:text-[#E7E3D8] file:text-sm file:font-medium hover:file:bg-[#994D35] file:cursor-pointer cursor-pointer"
                  />
                </div>
              )}

              {/* Feedback (Edit only) */}
              {showEditModal && existingFeedback.length > 0 && (
                <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30">
                  <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                    Feedback ({existingFeedback.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {existingFeedback.map((f) => (
                      <div
                        key={f._id}
                        className="flex justify-between items-start text-sm bg-white p-3 rounded border border-[#3D444C]/10"
                      >
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-1 text-[#D3A16D] mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={
                                  i < f.rating
                                    ? "text-[#D3A16D]"
                                    : "text-[#3D444C]/20"
                                }
                              />
                            ))}
                            <span className="text-xs text-[#3D444C]/60 ml-1">
                              ({f.rating}/5)
                            </span>
                          </div>
                          <p className="text-[#3D444C]/80 text-xs">
                            {f.comment || "No comment"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackToDelete([...feedbackToDelete, f._id]);
                            setExistingFeedback(
                              existingFeedback.filter((x) => x._id !== f._id),
                            );
                          }}
                          className="text-[#994D35] hover:text-red-700 mt-1"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#3D444C]/10">
                <button
                  type="button"
                  onClick={() =>
                    showCreateModal
                      ? setShowCreateModal(false)
                      : (setShowEditModal(false), resetForm())
                  }
                  className="flex-1 px-4 py-3 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-[#3D444C] text-[#E7E3D8] rounded-lg hover:bg-[#994D35] disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : showCreateModal ? (
                    "Create Session"
                  ) : (
                    "Update Session"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center border border-[#3D444C]/20">
            <div className="w-16 h-16 bg-[#994D35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-[#994D35] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#3D444C]">
              Delete Session
            </h2>
            <p className="text-[#3D444C]/70 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-[#3D444C]">
                {selectedSession.sessionTitle}
              </strong>
              ? The banner and all associated PDFs will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] disabled:opacity-50 flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAttendanceModal && selectedSession && (
        <SessionAttendance
          session={selectedSession}
          onClose={() => setShowAttendanceModal(false)}
          onSaved={() => fetchSessions(1, false)}
        />
      )}
    </div>
  );
};

export default SessionsClient;
