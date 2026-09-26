// app/dashboard/articles/AdminArticles.jsx
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
  FaUser,
  FaBuilding,
  FaSpinner,
  FaCheck,
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaExclamationTriangle,
  FaFilter,
} from "react-icons/fa";

const CATEGORIES = [
  "General",
  "Career",
  "News",
  "Event",
  "Success Story",
  "Tips & Tricks",
  "Interview",
  "Skill Development",
];

const STATUS_COLORS = {
  published: "bg-green-100 text-green-700 border-green-300",
  draft: "bg-yellow-100 text-yellow-700 border-yellow-300",
  archived: "bg-gray-200 text-gray-600 border-gray-300",
};

const AdminArticles = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Track which article + action is currently in flight
  // Map: articleId → "edit" | "publish" | "delete" | null
  const [actionLoading, setActionLoading] = useState({});

  const setArticleAction = (id, action) =>
    setActionLoading((prev) => ({ ...prev, [id]: action }));

  const clearArticleAction = (id) =>
    setActionLoading((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  // ---------- Fetch list ----------
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(
        `/api/secure/articles/list?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles || []);
      } else {
        toast.error(data.message || "Failed to load articles");
      }
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ---------- Open edit ----------
  const openEdit = async (articleId) => {
    if (actionLoading[articleId]) return; // guard against double-click
    setArticleAction(articleId, "edit");
    try {
      const res = await fetch(`/api/secure/articles/${articleId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEditingArticle(data.article);
        setShowModal(true);
      } else {
        toast.error(data.message || "Failed to load article");
      }
    } catch {
      toast.error("Failed to load article");
    } finally {
      clearArticleAction(articleId);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/secure/articles/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Article deleted");
        setArticles((prev) => prev.filter((a) => a._id !== deleteTarget._id));
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

  // ---------- Quick publish toggle ----------
  const togglePublish = async (article) => {
    if (actionLoading[article._id]) return; // guard
    const newStatus = article.status === "published" ? "draft" : "published";
    setArticleAction(article._id, "publish");

    try {
      // 1. Fetch full article (we need the real content, not a placeholder)
      const getRes = await fetch(`/api/secure/articles/${article._id}`, {
        credentials: "include",
      });
      const getData = await getRes.json();
      if (!getData.success) {
        toast.error(getData.message || "Failed to load article");
        return;
      }

      // 2. Send the update with the same content
      const fd = new FormData();
      fd.append("title", getData.article.title);
      fd.append("content", getData.article.content);
      fd.append("category", getData.article.category);
      fd.append("status", newStatus);
      // Preserve tags too
      (getData.article.tags || []).forEach((t) => fd.append("tags[]", t));

      const res = await fetch(`/api/secure/articles/${article._id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === "published"
            ? "Article published"
            : "Article moved to drafts",
        );
        fetchArticles();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      clearArticleAction(article._id);
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
              Articles Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create, edit and publish articles for the club
            </p>
          </div>
          <button
            onClick={() => {
              setEditingArticle(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#3D444C] transition-all duration-300 font-medium shadow-md"
          >
            <FaPlus /> New Article
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              value={searchQuery}
              disabled={loading}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author or tag..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-[#3D444C]/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
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
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-[#994D35]" />
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FaFileAlt className="text-5xl text-[#3D444C]/20 mx-auto mb-4" />
            <p className="text-gray-500">
              No articles found. Click <strong>New Article</strong> to write
              your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-44 bg-[#E7E3D8]">
                  <Image
                    src={a.thumbnail}
                    alt={a.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${STATUS_COLORS[a.status] || STATUS_COLORS.draft}`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-xs text-[#994D35] font-semibold uppercase tracking-wide mb-1">
                    {a.category}
                  </p>
                  <h3 className="font-bold text-[#3D444C] text-base leading-snug line-clamp-2 mb-2">
                    {a.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <FaUser className="text-[#D3A16D]" />
                    <span className="truncate">
                      {a.author?.fullName || "Unknown"}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="capitalize">{a.author?.type}</span>
                  </div>

                  <div className="text-xs text-gray-400 mb-4">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  {/* Actions */}
                  {(() => {
                    const currentAction = actionLoading[a._id];
                    const isBusy = !!currentAction;
                    return (
                      <div className="mt-auto flex gap-2 pt-3 border-t border-[#3D444C]/10">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(a._id)}
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

                        {/* Publish toggle */}
                        <button
                          onClick={() => togglePublish(a)}
                          disabled={isBusy}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            a.status === "published" ? "Unpublish" : "Publish"
                          }
                        >
                          {currentAction === "publish" ? (
                            <FaSpinner className="animate-spin" />
                          ) : a.status === "published" ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>

                        {/* Delete (opens confirm dialog — spinner lives on confirm) */}
                        <button
                          onClick={() => setDeleteTarget(a)}
                          disabled={isBusy}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- Create / Edit Modal ---------- */}
      {showModal && (
        <ArticleModal
          article={editingArticle}
          onClose={() => {
            setShowModal(false);
            setEditingArticle(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingArticle(null);
            fetchArticles();
          }}
        />
      )}

      {/* ---------- Delete Confirmation ---------- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#3D444C]">
                  Delete Article?
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-[#E7E3D8]/50 rounded-lg p-3 mb-5">
              <p className="text-sm font-semibold text-[#3D444C] line-clamp-2">
                {deleteTarget.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                by {deleteTarget.author?.fullName || "Unknown"}
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

export default AdminArticles;

// =====================================================================
// Article Modal (Create + Edit)
// =====================================================================
const ArticleModal = ({ article, onClose, onSaved }) => {
  const editorRef = useRef(null);
  const isEdit = !!article;

  // ---------- form state ----------
  const [title, setTitle] = useState(article?.title || "");
  const [category, setCategory] = useState(article?.category || "General");
  const [tagsInput, setTagsInput] = useState((article?.tags || []).join(", "));
  const [status, setStatus] = useState(article?.status || "draft");
  const [initialContent, setInitialContent] = useState(article?.content || "");

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(
    article?.thumbnail || "",
  );

  const [authorType, setAuthorType] = useState(
    article?.author?.type || "internal",
  );

  // internal
  const [authorLookup, setAuthorLookup] = useState("");
  const [authorMatches, setAuthorMatches] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(
    article?.author?.type === "internal" ? article.author : null,
  );
  const [searchingAuthor, setSearchingAuthor] = useState(false);

  // external
  const [extAuthor, setExtAuthor] = useState({
    fullName:
      article?.author?.type === "external" ? article.author.fullName : "",
    email: article?.author?.type === "external" ? article.author.email : "",
    phone: article?.author?.type === "external" ? article.author.phone : "",
    institution:
      article?.author?.type === "external" ? article.author.institution : "",
    designation:
      article?.author?.type === "external" ? article.author.designation : "",
  });
  const [extAuthorPic, setExtAuthorPic] = useState(null);
  const [extAuthorPicPreview, setExtAuthorPicPreview] = useState(
    article?.author?.type === "external"
      ? article.author.profilePicture || ""
      : "",
  );

  const [submitting, setSubmitting] = useState(false);

  // ---------- Handlers ----------
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image size must be less than 5MB");
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleExtAuthorPicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }
    if (file.size > 3 * 1024 * 1024) {
      return toast.error("Image size must be less than 3MB");
    }
    setExtAuthorPic(file);
    setExtAuthorPicPreview(URL.createObjectURL(file));
  };

  const searchAuthor = async () => {
    const q = authorLookup.trim();
    if (!q) return toast.error("Enter a student ID, membership ID or email");

    setSearchingAuthor(true);
    try {
      const res = await fetch(
        `/api/secure/users/search?q=${encodeURIComponent(q)}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setAuthorMatches(data.users || []);
        if (!data.users?.length) toast.error("No matching member found");
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setSearchingAuthor(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");

    const html = editorRef.current?.getContent() || "";
    if (!html.trim() || html === "<p></p>") {
      return toast.error("Content is required");
    }

    if (authorType === "internal" && !selectedAuthor) {
      return toast.error("Please select an internal author");
    }
    if (authorType === "external" && !extAuthor.fullName.trim()) {
      return toast.error("External author name is required");
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", html);
      fd.append("category", category);
      fd.append("status", status);
      fd.append("authorType", authorType);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tags.forEach((t) => fd.append("tags[]", t));

      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);

      if (authorType === "internal") {
        fd.append("authorLookup", selectedAuthor._id);
      } else {
        fd.append("authorFullName", extAuthor.fullName);
        fd.append("authorEmail", extAuthor.email);
        fd.append("authorPhone", extAuthor.phone);
        fd.append("authorInstitution", extAuthor.institution);
        fd.append("authorDesignation", extAuthor.designation);
        if (extAuthorPic) fd.append("authorProfilePicture", extAuthorPic);
      }

      const url = isEdit
        ? `/api/secure/articles/${article._id}`
        : "/api/secure/articles/create";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          isEdit
            ? "Article updated successfully!"
            : "Article created successfully!",
        );
        onSaved();
      } else {
        toast.error(data.message || "Failed to save article");
      }
    } catch {
      toast.error("Failed to save article");
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
              {isEdit ? "Edit Article" : "Create New Article"}
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
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                maxLength={300}
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
                required
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Thumbnail
              </label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 rounded-lg overflow-hidden bg-[#E7E3D8] border border-[#3D444C]/10 flex items-center justify-center">
                  {thumbnailPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaImage className="text-3xl text-[#3D444C]/30" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#E7E3D8] border border-[#D3A16D] rounded-lg text-sm font-medium text-[#3D444C] hover:bg-[#D3A16D]/30 transition-colors">
                    <FaImage /> Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    {isEdit
                      ? "Leave unchanged to keep the current thumbnail."
                      : "Optional — a default image will be used if none is uploaded."}
                  </p>
                </div>
              </div>
            </div>

            {/* Category + Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Comma separated (e.g. career, tips)"
                  className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
                />
              </div>
            </div>

            {/* Editor */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Content *
              </label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={initialContent}
                init={{
                  height: 500,
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

            {/* Author */}
            <div className="border border-[#3D444C]/10 rounded-xl p-4 bg-[#E7E3D8]/30">
              <label className="block text-sm font-semibold text-[#3D444C] mb-3">
                Author
              </label>

              <div className="inline-flex rounded-lg overflow-hidden border border-[#3D444C]/20 mb-4">
                <button
                  type="button"
                  onClick={() => setAuthorType("internal")}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                    authorType === "internal"
                      ? "bg-[#994D35] text-white"
                      : "bg-white text-[#3D444C]"
                  }`}
                >
                  <FaUser /> Internal
                </button>
                <button
                  type="button"
                  onClick={() => setAuthorType("external")}
                  className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                    authorType === "external"
                      ? "bg-[#994D35] text-white"
                      : "bg-white text-[#3D444C]"
                  }`}
                >
                  <FaBuilding /> External
                </button>
              </div>

              {authorType === "internal" ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={authorLookup}
                      onChange={(e) => setAuthorLookup(e.target.value)}
                      placeholder="Student ID, Membership ID or Email"
                      className="flex-1 px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                    <button
                      type="button"
                      onClick={searchAuthor}
                      disabled={searchingAuthor}
                      className="px-5 py-2.5 bg-[#3D444C] text-white rounded-lg hover:bg-[#994D35] transition-colors flex items-center gap-2 disabled:opacity-60"
                    >
                      {searchingAuthor ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaSearch />
                      )}
                      Search
                    </button>
                  </div>

                  {authorMatches.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {authorMatches.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setSelectedAuthor(u);
                            setAuthorMatches([]);
                            setAuthorLookup("");
                          }}
                          className="text-left p-3 rounded-lg border-2 bg-white border-[#3D444C]/10 hover:border-[#D3A16D] transition-colors flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#994D35] text-white flex items-center justify-center font-bold shrink-0">
                            {u.fullName?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {u.fullName}
                            </p>
                            <p className="text-xs opacity-80 truncate">
                              {u.studentId} • {u.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedAuthor && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-300 flex items-center gap-3">
                      <FaCheck className="text-green-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-[#3D444C]">
                          {selectedAuthor.fullName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {selectedAuthor.studentId} • {selectedAuthor.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAuthor(null)}
                        className="ml-auto text-red-600 hover:text-red-800 text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={extAuthor.fullName}
                      onChange={(e) =>
                        setExtAuthor({
                          ...extAuthor,
                          fullName: e.target.value,
                        })
                      }
                      className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={extAuthor.email}
                      onChange={(e) =>
                        setExtAuthor({ ...extAuthor, email: e.target.value })
                      }
                      className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={extAuthor.phone}
                      onChange={(e) =>
                        setExtAuthor({ ...extAuthor, phone: e.target.value })
                      }
                      className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      value={extAuthor.institution}
                      onChange={(e) =>
                        setExtAuthor({
                          ...extAuthor,
                          institution: e.target.value,
                        })
                      }
                      className="px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Designation (e.g. Guest Speaker)"
                      value={extAuthor.designation}
                      onChange={(e) =>
                        setExtAuthor({
                          ...extAuthor,
                          designation: e.target.value,
                        })
                      }
                      className="md:col-span-2 px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-[#3D444C]/20 flex items-center justify-center shrink-0">
                      {extAuthorPicPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={extAuthorPicPreview}
                          alt="Author"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-[#3D444C]/30" />
                      )}
                    </div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#D3A16D] rounded-lg text-sm font-medium text-[#3D444C] hover:bg-[#D3A16D]/20 transition-colors">
                      <FaImage />{" "}
                      {isEdit && extAuthorPicPreview
                        ? "Replace Photo"
                        : "Author Photo (optional)"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleExtAuthorPicChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] bg-white"
              >
                <option value="draft">Save as Draft</option>
                <option value="published">Publish Now</option>
                <option value="archived">Archive</option>
              </select>
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
                    <FaCheck /> {isEdit ? "Update Article" : "Create Article"}
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
