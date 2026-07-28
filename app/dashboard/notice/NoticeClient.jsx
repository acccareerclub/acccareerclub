// app/dashboard/notice/NoticeClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCalendar,
  FaUser,
  FaTag,
  FaImage,
  FaTimes,
  FaSpinner,
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
  FaBullhorn,
  FaGraduationCap,
  FaBriefcase,
  FaStar,
} from "react-icons/fa";
import toast from "react-hot-toast";
import DashboardMenu from "../../components/layout/DashboardMenu";
import Image from "next/image";
import Link from "next/link";

// Category options
const CATEGORIES = [
  { value: "general", label: "General", icon: FaInfoCircle, color: "blue" },
  {
    value: "academic",
    label: "Academic",
    icon: FaGraduationCap,
    color: "green",
  },
  { value: "event", label: "Event", icon: FaCalendar, color: "purple" },
  { value: "career", label: "Career", icon: FaBriefcase, color: "orange" },
  {
    value: "important",
    label: "Important",
    icon: FaExclamationTriangle,
    color: "red",
  },
  { value: "club", label: "Club", icon: FaBullhorn, color: "pink" },
];

// Priority options
const PRIORITIES = [
  { value: "low", label: "Low", color: "gray" },
  { value: "medium", label: "Medium", color: "blue" },
  { value: "high", label: "High", color: "orange" },
  { value: "urgent", label: "Urgent", color: "red" },
];

const NoticeClient = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotices, setTotalNotices] = useState(0);
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    priority: "medium",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!authLoading && isAuthenticated) {
      const allowedRoles = ["prefect", "itsecretary", "modarator"];
      if (!allowedRoles.includes(authUser?.role)) {
        router.push("/");
      }
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  // Fetch notices
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const url = `/api/secure/notice/get-notices?page=${currentPage}&limit=100&search=${encodeURIComponent(searchTerm)}${filterCategory !== "all" ? `&category=${filterCategory}` : ""}`;
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();

      if (data.success) {
        setNotices(data.notices);
        setTotalPages(data.pagination.pages);
        setTotalNotices(data.pagination.total);
        setCategories(data.categories || []);
      } else {
        toast.error(data.message || "Failed to fetch notices");
      }
    } catch (error) {
      console.error("Fetch notices error:", error);
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [currentPage, searchTerm, filterCategory]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // Image handling
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed");
    }

    setImages([...images, ...validFiles]);

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = (publicId) => {
    setImagesToDelete([...imagesToDelete, publicId]);
    setExistingImages(
      existingImages.filter((img) => img.publicId !== publicId),
    );
  };

  // Create notice - FIXED
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const formDataObj = new FormData(); // ✅ Changed variable name
      formDataObj.append("title", formData.title); // ✅ Uses state variable
      formDataObj.append("content", formData.content);
      formDataObj.append("category", formData.category);
      formDataObj.append("priority", formData.priority);
      images.forEach((img) => formDataObj.append("images", img));

      const response = await fetch("/api/secure/notice/create-notice", {
        method: "POST",
        body: formDataObj,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Notice created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchNotices();
      } else {
        toast.error(data.message || "Failed to create notice");
      }
    } catch (error) {
      console.error("Create notice error:", error);
      toast.error("Failed to create notice");
    } finally {
      setIsProcessing(false);
    }
  };
  // Edit notice
  const handleEditNotice = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("noticeId", selectedNotice._id);
      formDataObj.append("title", formData.title);
      formDataObj.append("content", formData.content);
      formDataObj.append("category", formData.category);
      formDataObj.append("priority", formData.priority);
      formDataObj.append("imagesToDelete", JSON.stringify(imagesToDelete));
      images.forEach((img) => formDataObj.append("newImages", img));

      const response = await fetch("/api/secure/notice/edit-notice", {
        method: "PUT",
        body: formDataObj,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Notice updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchNotices();
      } else {
        toast.error(data.message || "Failed to update notice");
      }
    } catch (error) {
      console.error("Edit notice error:", error);
      toast.error("Failed to update notice");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete notice
  const handleDeleteNotice = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(
        `/api/secure/notice/delete-notice?noticeId=${selectedNotice._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Notice deleted successfully!");
        setShowDeleteModal(false);
        setSelectedNotice(null);
        fetchNotices();
      } else {
        toast.error(data.message || "Failed to delete notice");
      }
    } catch (error) {
      console.error("Delete notice error:", error);
      toast.error("Failed to delete notice");
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "general",
      priority: "medium",
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
  };

  // Open edit modal
  const openEditModal = (notice) => {
    setSelectedNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority,
    });
    setExistingImages(notice.images || []);
    setImages([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return CATEGORIES.find((c) => c.value === categoryValue) || CATEGORIES[0];
  };

  // Get priority info
  const getPriorityInfo = (priorityValue) => {
    return PRIORITIES.find((p) => p.value === priorityValue) || PRIORITIES[0];
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority] || colors.medium;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const allowedRoles = ["prefect", "itsecretary", "modarator"];
  if (!allowedRoles.includes(authUser?.role)) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Notice Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and publish notices for club members
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-3 rounded-lg hover:bg-[#D3A16D] transition-all duration-300 hover:scale-105 shadow-lg mt-4 sm:mt-0"
          >
            <FaPlus />
            <span>New Notice</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBell className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Notices</p>
                <p className="text-2xl font-bold text-[#3D444C]">
                  {totalNotices}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-full">
                <FaTag className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-bold text-[#3D444C]">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaStar className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold text-[#3D444C]">
                  {
                    notices.filter(
                      (n) => n.priority === "high" || n.priority === "urgent",
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaCalendar className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-[#3D444C]">
                  {
                    notices.filter((n) => {
                      const date = new Date(n.createdAt);
                      const now = new Date();
                      return (
                        date.getMonth() === now.getMonth() &&
                        date.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notices by title or content..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
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

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-bold text-[#3D444C] mb-2">
                No Notices Found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first notice to get started"}
              </p>
            </div>
          ) : (
            notices.map((notice) => {
              const category = getCategoryInfo(notice.category);
              const priority = getPriorityInfo(notice.priority);
              const CategoryIcon = category.icon;

              return (
                <div
                  key={notice._id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Priority Bar */}
                  <div
                    className={`h-1 ${
                      notice.priority === "urgent"
                        ? "bg-red-500"
                        : notice.priority === "high"
                          ? "bg-orange-500"
                          : notice.priority === "medium"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                    }`}
                  />

                  {/* Images */}
                  {notice.images && notice.images.length > 0 && (
                    <div className="relative h-48 bg-gray-100">
                      <Image
                        src={notice.images[0].url}
                        alt={notice.title}
                        fill
                        className="object-cover"
                      />
                      {notice.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <FaImage className="text-xs" />+
                          {notice.images.length - 1}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            notice.priority === "urgent"
                              ? "bg-red-100 text-red-700"
                              : notice.priority === "high"
                                ? "bg-orange-100 text-orange-700"
                                : notice.priority === "medium"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {priority.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <CategoryIcon className="text-xs" />
                          {category.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-[#3D444C] mb-2 line-clamp-2">
                      {notice.title}
                    </h3>

                    {/* Content */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {notice.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaUser className="text-xs" />
                        <span>{notice.createdByName}</span>
                        <span className="text-gray-300">•</span>
                        <span>
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openViewModal(notice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(notice)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNotice(notice);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * 100 + 1} -{" "}
              {Math.min(currentPage * 100, totalNotices)} of {totalNotices}{" "}
              notices
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <span className="px-3 py-2 text-sm font-medium text-[#3D444C]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#3D444C]">
                Create New Notice
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images (max 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Create Notice"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#3D444C]">Edit Notice</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditNotice} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Images
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image
                          src={img.url}
                          alt={`Notice image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.publicId)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Images (max 10 total)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image
                          src={preview}
                          alt={`New preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Update Notice"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
                Delete Notice
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "
                <strong>{selectedNotice.title}</strong>"?
                {selectedNotice.images && selectedNotice.images.length > 0 && (
                  <span className="block text-sm text-red-500 mt-2">
                    ⚠️ This will also delete {selectedNotice.images.length}{" "}
                    associated image(s).
                  </span>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedNotice(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteNotice}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Notice Modal */}
      {showViewModal && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#3D444C]">
                Notice Details
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedNotice(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              {/* Meta info */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotice.priority)}`}
                >
                  {getPriorityInfo(selectedNotice.priority).label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {getCategoryInfo(selectedNotice.category).label}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FaUser className="text-xs" />
                  {selectedNotice.createdByName}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FaCalendar className="text-xs" />
                  {new Date(selectedNotice.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#3D444C]">
                {selectedNotice.title}
              </h3>

              {/* Images */}
              {selectedNotice.images && selectedNotice.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedNotice.images.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img.url}
                        alt={`Notice image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedNotice.content}
                </p>
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                <p>
                  Created: {new Date(selectedNotice.createdAt).toLocaleString()}
                </p>
                <p>
                  Last Updated:{" "}
                  {new Date(selectedNotice.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeClient;
