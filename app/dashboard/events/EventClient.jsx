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
  FaFilePdf,
  FaStar,
  FaCalendar,
  FaClock,
  FaImage,
  FaToggleOn,
  FaToggleOff,
  FaUsers,
  FaMicrophone,
  FaClipboardList,
  FaEye,
  FaUserPlus,
  FaUserCheck,
  FaTrophy,
  FaGlobe, // ⬅ NEW
} from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardMenu from "@/app/components/layout/DashboardMenu";
import Image from "next/image";
import { Editor } from "@tinymce/tinymce-react";
import PreRegistrationModal from "./PreRegistrationModal";
import AttendanceModal from "./AttendanceModal";
import AchieversModal from "./AchieversModal";

const EVENT_TYPES = [
  "workshop",
  "seminar",
  "webinar",
  "meeting",
  "training",
  "competition",
  "talent hunt",
  "other",
];
const EVENT_STATUS = ["upcoming", "completed", "cancelled"];
const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const DEFAULT_THUMB =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";
const PAGE_SIZE = 15;

const EventsClient = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showInactive, setShowInactive] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreRegModal, setShowPreRegModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAchieversModal, setShowAchieversModal] = useState(false);

  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDescription: "",
    eventType: "competition",
    location: "",
    eventDate: "",
    eventDay: "",
    eventStatus: "upcoming",
    preRegistrationRequired: false,
    preRegistrationDeadline: "",
    externalPreRegistrationAllowed: false, // ⬅ NEW
    eventSpeakerAvailability: false,
    speakerName: "",
    speakerDescription: "",
    isFeatured: false,
    isActive: true,
    removeThumbnail: false,
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [preResources, setPreResources] = useState([]);
  const [postResources, setPostResources] = useState([]);
  const [existingPre, setExistingPre] = useState([]);
  const [existingPost, setExistingPost] = useState([]);
  const [preToDelete, setPreToDelete] = useState([]);
  const [postToDelete, setPostToDelete] = useState([]);
  const [existingFeedback, setExistingFeedback] = useState([]);

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

  const fetchEvents = async (pageNum = 1, append = false) => {
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

      const res = await fetch(`/api/secure/events/get-events?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        if (append) setEvents((prev) => [...prev, ...data.events]);
        else setEvents(data.events);
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
        setPage(data.currentPage);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents(1, false);
  }, [searchTerm, filterStatus, showInactive]);

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchEvents(page + 1, true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload a valid image");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Thumbnail must be under 5MB");
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
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
    if (thumbnailFile) fd.append("eventThumbnail", thumbnailFile);
    preResources.forEach((f) => fd.append("preResources", f));

    try {
      const res = await fetch("/api/secure/events/create-event", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event created!");
        setShowCreateModal(false);
        resetForm();
        fetchEvents(1, false);
      } else toast.error(data.message);
    } catch {
      toast.error("Error creating event");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const fd = new FormData();
    fd.append("eventId", selectedEvent._id);
    Object.keys(formData).forEach((k) => fd.append(k, formData[k]));
    fd.append("preResourcesToDelete", JSON.stringify(preToDelete));
    fd.append("postResourcesToDelete", JSON.stringify(postToDelete));
    if (thumbnailFile) fd.append("eventThumbnail", thumbnailFile);
    preResources.forEach((f) => fd.append("newPreResources", f));
    postResources.forEach((f) => fd.append("newPostResources", f));

    try {
      const res = await fetch("/api/secure/events/edit-event", {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Event updated!");
        setShowEditModal(false);
        resetForm();
        fetchEvents(1, false);
      } else toast.error(data.message);
    } catch {
      toast.error("Error updating event");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/secure/events/delete-event?eventId=${selectedEvent._id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Event deleted!");
        setShowDeleteModal(false);
        fetchEvents(1, false);
      } else toast.error(data.message);
    } catch {
      toast.error("Error deleting event");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventTitle: "",
      eventDescription: "",
      eventType: "competition",
      location: "",
      eventDate: "",
      eventDay: "",
      eventStatus: "upcoming",
      preRegistrationRequired: false,
      preRegistrationDeadline: "",
      externalPreRegistrationAllowed: false, // ⬅ NEW
      eventSpeakerAvailability: false,
      speakerName: "",
      speakerDescription: "",
      isFeatured: false,
      isActive: true,
      removeThumbnail: false,
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setPreResources([]);
    setPostResources([]);
    setExistingPre([]);
    setExistingPost([]);
    setPreToDelete([]);
    setPostToDelete([]);
    setExistingFeedback([]);
  };

  const openEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      eventTitle: event.eventTitle,
      eventDescription: event.eventDescription || "",
      eventType: event.eventType,
      location: event.location || "",
      eventDate: event.eventDate
        ? new Date(event.eventDate).toISOString().split("T")[0]
        : "",
      eventDay: event.eventDay || "",
      eventStatus: event.eventStatus,
      preRegistrationRequired: event.preRegistrationRequired || false,
      preRegistrationDeadline: event.preRegistrationDeadline
        ? new Date(event.preRegistrationDeadline).toISOString().split("T")[0]
        : "",
      externalPreRegistrationAllowed:
        event.externalPreRegistrationAllowed || false,
      eventSpeakerAvailability: event.eventSpeakerAvailability || false,
      speakerName: event.eventSpeakerCredentials?.speakerName || "",
      speakerDescription:
        event.eventSpeakerCredentials?.speakerDescription || "",
      isFeatured: event.isFeatured || false,
      isActive: event.isActive !== false,
      removeThumbnail: false,
    });
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setExistingPre(event.preResources || []);
    setExistingPost(event.postResources || []);
    setExistingFeedback(event.feedback || []);
    setPreResources([]);
    setPostResources([]);
    setPreToDelete([]);
    setPostToDelete([]);
    setShowEditModal(true);
  };

  const openFeedback = (event) => {
    setSelectedEvent(event);
    setExistingFeedback(event.feedback || []);
    setShowFeedbackModal(true);
  };

  const deleteSingleFeedback = async (fid) => {
    if (!selectedEvent?._id) return;
    if (!confirm("Delete this feedback permanently?")) return;

    try {
      const res = await fetch(
        `/api/secure/events/${selectedEvent._id}/feedback/${fid}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback deleted");
        setExistingFeedback((prev) => prev.filter((x) => x._id !== fid));
        // Refresh parent list so feedback count updates
        fetchEvents(1, false);
      } else {
        toast.error(data.message || "Failed to delete feedback");
      }
    } catch {
      toast.error("Failed to delete feedback");
    }
  };

  const getEventThumb = (event) => event.eventThumbnail?.url || DEFAULT_THUMB;
  const getFormThumbPreview = () => {
    if (thumbnailPreview) return thumbnailPreview;
    if (showEditModal && selectedEvent?.eventThumbnail?.url)
      return selectedEvent.eventThumbnail.url;
    return DEFAULT_THUMB;
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Events Management
            </h1>
            <p className="text-[#3D444C]/70 mt-1">
              {totalCount} event{totalCount !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-[#3D444C] text-[#E7E3D8] px-5 py-3 rounded-lg hover:bg-[#994D35] transition-all shadow-lg mt-4 sm:mt-0 font-medium"
          >
            <FaPlus /> <span>New Event</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              placeholder="Search events..."
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
            {EVENT_STATUS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={showInactive ? "all" : "active"}
            onChange={(e) => setShowInactive(e.target.value === "all")}
            className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/30 focus:outline-none focus:border-[#3D444C]"
          >
            <option value="active">Active Only</option>
            <option value="all">All (Active + Inactive)</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-12 text-center text-[#3D444C]/50">
              No Events Found
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                  event.isActive === false
                    ? "border-red-300 opacity-75"
                    : "border-[#3D444C]/10"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-44 bg-[#3D444C]/10">
                  <Image
                    src={getEventThumb(event)}
                    alt={event.eventTitle}
                    fill
                    className={`object-cover ${
                      event.isActive === false ? "grayscale" : ""
                    }`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#3D444C]/85 text-[#E7E3D8] text-xs rounded-lg font-medium uppercase tracking-wide backdrop-blur-sm">
                      {event.eventType}
                    </span>
                    {event.isFeatured && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-[#D3A16D] text-[#3D444C] text-xs rounded-lg font-bold backdrop-blur-sm">
                        <FaStar className="text-[10px]" /> Featured
                      </span>
                    )}
                    {event.isActive === false && (
                      <span className="px-2 py-1 bg-red-500/90 text-white text-xs rounded-lg font-bold backdrop-blur-sm">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <span
                    className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-lg font-bold backdrop-blur-sm ${
                      event.eventStatus === "upcoming"
                        ? "bg-[#D3A16D] text-[#3D444C]"
                        : event.eventStatus === "completed"
                          ? "bg-green-500/90 text-white"
                          : "bg-red-500/90 text-white"
                    }`}
                  >
                    {event.eventStatus}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-xs text-[#3D444C]/50 mb-2 flex items-center gap-1">
                    <FaCalendar className="text-[#D3A16D]" />
                    {new Date(event.eventDate).toLocaleDateString()}
                    {event.eventDay && ` • ${event.eventDay}`}
                  </span>
                  <h3 className="text-lg font-bold text-[#3D444C] mb-2 line-clamp-2">
                    {event.eventTitle}
                  </h3>
                  <p className="text-[#3D444C]/70 text-sm mb-3 line-clamp-2">
                    {event.eventDescription?.replace(/<[^>]*>?/gm, "")}
                  </p>

                  {/* Meta badges */}
                  <div className="flex flex-wrap gap-2 mb-3 text-[10px]">
                    {event.preRegistrationRequired && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        <FaClipboardList /> Pre-Reg
                      </span>
                    )}
                    {/* ⬅ NEW: external pre-reg badge */}
                    {event.externalPreRegistrationAllowed && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                        <FaGlobe /> External
                      </span>
                    )}
                    {event.eventSpeakerAvailability && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                        <FaMicrophone /> Speaker
                      </span>
                    )}
                    {event.preResources?.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-[#E7E3D8] text-[#3D444C] rounded-full font-medium">
                        <FaFilePdf /> {event.preResources.length} Pre
                      </span>
                    )}
                    {event.feedback?.length > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        <FaStar /> {event.feedback.length}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#3D444C]/10 text-xs text-[#3D444C]/60">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <FaMapMarkerAlt className="text-[#D3A16D] shrink-0" />
                      <span className="truncate">
                        {event.location || "Location TBD"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-[#E7E3D8]/50 flex justify-end gap-2 border-t border-[#3D444C]/10">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowPreRegModal(true);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Pre-Registration"
                  >
                    <FaUserPlus />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowAttendanceModal(true);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Take Attendance"
                  >
                    <FaUserCheck />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowAchieversModal(true);
                    }}
                    className="p-2 text-[#D3A16D] hover:bg-[#D3A16D]/10 rounded-lg transition-colors"
                    title="Set Achievers"
                  >
                    <FaTrophy />
                  </button>
                  <button
                    onClick={() => openFeedback(event)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="View Feedback"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => openEdit(event)}
                    className="p-2 text-[#3D444C] hover:bg-[#3D444C]/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
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

        {/* Load More */}
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
                "Load More Events"
              )}
            </button>
          </div>
        )}

        {!hasMore && events.length > 0 && (
          <div className="text-center text-[#3D444C]/40 text-sm mt-8">
            You've seen all {totalCount} event{totalCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#3D444C]/20">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3D444C]/10">
              <h2 className="text-2xl font-bold text-[#3D444C]">
                {showCreateModal ? "Create New Event" : "Edit Event"}
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
              {/* Thumbnail */}
              <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30">
                <label className="block text-sm font-semibold text-[#3D444C] mb-2 flex items-center gap-2">
                  <FaImage className="text-[#D3A16D]" /> Event Thumbnail
                  (Optional)
                </label>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-[#3D444C]/5 mb-3 border border-[#3D444C]/10">
                  <Image
                    src={getFormThumbPreview()}
                    alt="Thumbnail Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="flex-1 min-w-[200px] text-sm text-[#3D444C] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3D444C] file:text-[#E7E3D8] file:text-sm file:font-medium hover:file:bg-[#994D35] file:cursor-pointer cursor-pointer"
                  />
                  {showEditModal && selectedEvent?.eventThumbnail?.publicId && (
                    <label className="flex items-center gap-2 text-sm text-[#994D35] font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        name="removeThumbnail"
                        checked={formData.removeThumbnail}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[#994D35]"
                      />
                      Remove thumbnail
                    </label>
                  )}
                  {thumbnailPreview && (
                    <button
                      type="button"
                      onClick={removeThumbnail}
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
                  Event Title *
                </label>
                <input
                  type="text"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                  Description
                </label>
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                  value={formData.eventDescription}
                  onEditorChange={(c) =>
                    setFormData({ ...formData, eventDescription: c })
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

              {/* Type + Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/20 focus:outline-none focus:border-[#3D444C]"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Room 301, ACC"
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-[#E7E3D8]/20"
                  />
                </div>
              </div>

              {/* Date / Day / Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3D444C] mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
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
                    name="eventDay"
                    value={formData.eventDay}
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
                    name="eventStatus"
                    value={formData.eventStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg bg-[#E7E3D8]/20 focus:outline-none focus:border-[#3D444C]"
                  >
                    {EVENT_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pre-Registration */}
              <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="preRegistrationRequired"
                    name="preRegistrationRequired"
                    checked={formData.preRegistrationRequired}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#994D35] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="preRegistrationRequired"
                    className="flex items-center gap-2 text-sm font-medium text-[#3D444C] cursor-pointer"
                  >
                    <FaClipboardList className="text-[#D3A16D]" />
                    Pre-Registration Required
                  </label>
                </div>

                {/* ⬅ NEW: External pre-registration toggle — only visible when pre-reg is on */}
                {formData.preRegistrationRequired && (
                  <div className="flex items-center gap-3 pl-8">
                    <input
                      type="checkbox"
                      id="externalPreRegistrationAllowed"
                      name="externalPreRegistrationAllowed"
                      checked={formData.externalPreRegistrationAllowed}
                      onChange={handleInputChange}
                      className="w-5 h-5 accent-[#3D444C] rounded cursor-pointer"
                    />
                    <label
                      htmlFor="externalPreRegistrationAllowed"
                      className="flex items-center gap-2 text-sm font-medium text-[#3D444C] cursor-pointer"
                    >
                      <FaGlobe className="text-[#D3A16D]" />
                      Allow external (non-member) pre-registration
                    </label>
                  </div>
                )}

                {formData.preRegistrationRequired && (
                  <div>
                    <label className="block text-xs font-semibold text-[#3D444C] mb-1.5">
                      Registration Deadline
                    </label>
                    <input
                      type="date"
                      name="preRegistrationDeadline"
                      value={formData.preRegistrationDeadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Speaker */}
              <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="eventSpeakerAvailability"
                    name="eventSpeakerAvailability"
                    checked={formData.eventSpeakerAvailability}
                    onChange={handleInputChange}
                    className="w-5 h-5 accent-[#994D35] rounded cursor-pointer"
                  />
                  <label
                    htmlFor="eventSpeakerAvailability"
                    className="flex items-center gap-2 text-sm font-medium text-[#3D444C] cursor-pointer"
                  >
                    <FaMicrophone className="text-[#D3A16D]" />
                    Speaker Availability
                  </label>
                </div>
                {formData.eventSpeakerAvailability && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="speakerName"
                      value={formData.speakerName}
                      onChange={handleInputChange}
                      placeholder="Speaker Name"
                      className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                    <textarea
                      name="speakerDescription"
                      value={formData.speakerDescription}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Speaker Description"
                      className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Toggles */}
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
                    <FaStar className="text-[#D3A16D]" /> Featured Event
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
                    {formData.isActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>

              {/* Pre-Resources */}
              <div className="border border-[#3D444C]/15 p-4 rounded-lg bg-[#E7E3D8]/30">
                <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                  Pre-Event Resources (PDF, max 10MB each)
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
                    Post-Event Resources (PDF, max 10MB each)
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
                    "Create Event"
                  ) : (
                    "Update Event"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ FEEDBACK MODAL ============ */}
      {showFeedbackModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#3D444C]/20">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#3D444C]/10">
              <div>
                <h2 className="text-2xl font-bold text-[#3D444C]">
                  Event Feedback
                </h2>
                <p className="text-sm text-[#3D444C]/60 mt-1">
                  {selectedEvent.eventTitle}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackToDelete([]);
                }}
                className="p-2 hover:bg-[#3D444C]/10 rounded-full transition-colors"
              >
                <FaTimes className="text-[#3D444C]" />
              </button>
            </div>

            {existingFeedback.length === 0 ? (
              <div className="text-center py-10 text-[#3D444C]/50">
                <FaStar className="text-4xl mx-auto mb-3 text-[#D3A16D]/40" />
                <p>No feedback yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingFeedback.map((f, i) => (
                  <FeedbackCard
                    key={f._id || i}
                    feedback={f}
                    onDelete={() => deleteSingleFeedback(f._id)}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#3D444C]/10">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-2 hover:bg-[#3D444C]/10 rounded-full transition-colors"
              >
                <FaTimes className="text-[#3D444C]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE MODAL ============ */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl text-center border border-[#3D444C]/20">
            <div className="w-16 h-16 bg-[#994D35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-[#994D35] text-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#3D444C]">
              Delete Event
            </h2>
            <p className="text-[#3D444C]/70 mb-6">
              Are you sure you want to delete{" "}
              <strong className="text-[#3D444C]">
                {selectedEvent.eventTitle}
              </strong>
              ? The thumbnail and all associated PDFs will be permanently
              removed.
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
      {showPreRegModal && selectedEvent && (
        <PreRegistrationModal
          event={selectedEvent}
          onClose={() => setShowPreRegModal(false)}
          onSaved={() => fetchEvents(1, false)}
        />
      )}

      {showAttendanceModal && selectedEvent && (
        <AttendanceModal
          event={selectedEvent}
          onClose={() => setShowAttendanceModal(false)}
          onSaved={() => fetchEvents(1, false)}
        />
      )}
      {showAchieversModal && selectedEvent && (
        <AchieversModal
          event={selectedEvent}
          onClose={() => setShowAchieversModal(false)}
          onSaved={() => fetchEvents(1, false)}
        />
      )}
    </div>
  );
};

/* ============================================================
   FEEDBACK CARD — full info per entry
   ============================================================ */
const FeedbackCard = ({ feedback: f, onDelete }) => {
  const isGuest = !f.userId;

  // Name resolution
  let displayName = "Anonymous";
  if (f.userId) {
    // Member — try common fields the API might have populated
    displayName = f.userFullName || f.userName || f.memberName || "Member";
  } else if (f.externalName) {
    displayName = f.externalName;
  } else if (f.externalEmail) {
    displayName = f.externalEmail.split("@")[0] || "Guest";
  }

  // Contact info
  const email = f.userEmail || f.externalEmail || "";
  const studentId = f.userStudentId || "";
  const institution =
    f.userDepartment || f.userInstitution || f.externalOrganization || "";
  const phone = f.userPhone || "";

  return (
    <div className="bg-[#E7E3D8]/40 rounded-xl p-4 border border-[#3D444C]/10 relative">
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 text-[#994D35] hover:text-red-700 p-1 rounded hover:bg-red-50"
        title="Delete this feedback"
      >
        <FaTrash size={12} />
      </button>

      {/* Header row: name + role badge + rating */}
      <div className="flex flex-wrap items-center gap-2 mb-3 pr-8">
        <span className="text-sm font-semibold text-[#3D444C]">
          {displayName}
        </span>

        {/* Member / Guest badge */}
        {isGuest ? (
          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
            Guest
          </span>
        ) : (
          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Member
          </span>
        )}

        {/* Rating pill */}
        <span
          className={`ml-auto inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            f.rating >= 4
              ? "bg-green-100 text-green-700"
              : f.rating >= 3
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          <FaStar size={9} /> {f.rating}/5
        </span>
      </div>

      {/* Contact / identity info */}
      {(email || studentId || institution || phone) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-[11px] text-[#3D444C]/60">
          {email && (
            <span className="flex items-center gap-1">
              <span className="text-[#D3A16D]">✉</span>
              <span className="truncate max-w-[180px]">{email}</span>
            </span>
          )}
          {studentId && (
            <span className="flex items-center gap-1">
              <span className="text-[#D3A16D]">🎓</span>
              ID: <span className="font-mono">{studentId}</span>
            </span>
          )}
          {institution && (
            <span className="flex items-center gap-1">
              <span className="text-[#D3A16D]">🏛</span>
              <span className="truncate max-w-[180px]">{institution}</span>
            </span>
          )}
          {phone && (
            <span className="flex items-center gap-1">
              <span className="text-[#D3A16D]">☎</span>
              {phone}
            </span>
          )}
        </div>
      )}

      {/* Comment */}
      {f.comment ? (
        <p className="text-sm text-[#3D444C]/85 bg-white rounded-lg p-3 border border-[#3D444C]/10 whitespace-pre-wrap">
          {f.comment}
        </p>
      ) : (
        <p className="text-xs italic text-[#3D444C]/40">No comment provided.</p>
      )}

      {/* Timestamp */}
      <p className="text-[10px] text-[#3D444C]/40 mt-2">
        Submitted:{" "}
        {f.submittedAt
          ? new Date(f.submittedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "unknown"}
      </p>
    </div>
  );
};

export default EventsClient;
