// app/dashboard/companies/AdminCompaniesClient.jsx
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
  FaBuilding,
  FaExclamationTriangle,
  FaFilter,
} from "react-icons/fa";

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------
const STATUS_COLORS = {
  published: "bg-green-100 text-green-700 border-green-300",
  draft: "bg-yellow-100 text-yellow-700 border-yellow-300",
  archived: "bg-gray-200 text-gray-600 border-gray-300",
};

// ------------------------------------------------------------
// Main Admin Component
// ------------------------------------------------------------
const AdminCompaniesClient = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // per-row action state
  const [actionLoading, setActionLoading] = useState({});
  const setCompanyAction = (id, action) =>
    setActionLoading((prev) => ({ ...prev, [id]: action }));
  const clearCompanyAction = (id) =>
    setActionLoading((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  // ---------- Fetch list ----------
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(
        `/api/secure/companies/list?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setCompanies(data.companies || []);
      } else {
        toast.error(data.message || "Failed to load companies");
      }
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // ---------- Open edit ----------
  const openEdit = async (companyId) => {
    if (actionLoading[companyId]) return;
    setCompanyAction(companyId, "edit");
    try {
      const res = await fetch(`/api/secure/companies/${companyId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEditingCompany(data.company);
        setShowModal(true);
      } else {
        toast.error(data.message || "Failed to load company");
      }
    } catch {
      toast.error("Failed to load company");
    } finally {
      clearCompanyAction(companyId);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/secure/companies/${deleteTarget._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Company deleted");
        setCompanies((prev) =>
          prev.filter((c) => c._id !== deleteTarget._id),
        );
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

  // ---------- Toggle publish ----------
  const togglePublish = async (company) => {
    if (actionLoading[company._id]) return;
    const newStatus = company.status === "published" ? "draft" : "published";
    setCompanyAction(company._id, "publish");

    try {
      // Fetch full doc first (PUT needs content)
      const getRes = await fetch(`/api/secure/companies/${company._id}`, {
        credentials: "include",
      });
      const getData = await getRes.json();
      if (!getData.success) {
        toast.error(getData.message || "Failed to load company");
        return;
      }

      const full = getData.company;
      const fd = new FormData();
      fd.append("title", full.title);
      fd.append("content", full.content);
      fd.append("status", newStatus);
      (full.tags || []).forEach((t) => fd.append("tags[]", t));
      // Note: no logo file → existing logo is preserved

      const res = await fetch(`/api/secure/companies/${company._id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          newStatus === "published"
            ? "Company published"
            : "Company moved to drafts",
        );
        fetchCompanies();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      clearCompanyAction(company._id);
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
              Companies Management
            </h1>
            <p className="text-gray-600 mt-1">
              Add, edit and publish company profiles
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCompany(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#3D444C] transition-all duration-300 font-medium shadow-md"
          >
            <FaPlus /> New Company
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
              placeholder="Search by title or tag..."
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
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-[#994D35]" />
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FaBuilding className="text-5xl text-[#3D444C]/20 mx-auto mb-4" />
            <p className="text-gray-500">
              No companies found. Click <strong>New Company</strong> to add
              the first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.map((c) => {
              const currentAction = actionLoading[c._id];
              const isBusy = !!currentAction;
              return (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#3D444C]/10 flex flex-col"
                >
                  {/* Logo / placeholder */}
                  <div className="relative w-full h-44 bg-[#E7E3D8]">
                    {c.companyLogo ? (
                      <Image
                        src={c.companyLogo}
                        alt={c.title}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaBuilding className="text-5xl text-[#3D444C]/15" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                          STATUS_COLORS[c.status] || STATUS_COLORS.draft
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-[#3D444C] text-base leading-snug line-clamp-2 mb-2">
                      {c.title}
                    </h3>

                    {/* Tags */}
                    {c.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C]/70 text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mb-4">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2 pt-3 border-t border-[#3D444C]/10">
                      <button
                        onClick={() => openEdit(c._id)}
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
                        onClick={() => togglePublish(c)}
                        disabled={isBusy}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          c.status === "published" ? "Unpublish" : "Publish"
                        }
                      >
                        {currentAction === "publish" ? (
                          <FaSpinner className="animate-spin" />
                        ) : c.status === "published" ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(c)}
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
        <CompanyModal
          company={editingCompany}
          onClose={() => {
            setShowModal(false);
            setEditingCompany(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingCompany(null);
            fetchCompanies();
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
                  Delete Company?
                </h3>
                <p className="text-sm text-gray-600">
                  This will also delete the logo. Cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-[#E7E3D8]/50 rounded-lg p-3 mb-5">
              <p className="text-sm font-semibold text-[#3D444C] line-clamp-2">
                {deleteTarget.title}
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

export default AdminCompaniesClient;

// =====================================================================
// Company Modal (Create + Edit)
// =====================================================================
const CompanyModal = ({ company, onClose, onSaved }) => {
  const editorRef = useRef(null);
  const isEdit = !!company;

  const [title, setTitle] = useState(company?.title || "");
  const [tagsInput, setTagsInput] = useState((company?.tags || []).join(", "));
  const [status, setStatus] = useState(company?.status || "draft");
  const [initialContent, setInitialContent] = useState(company?.content || "");

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.companyLogo || "");

  const [submitting, setSubmitting] = useState(false);

  // ---------- Handlers ----------
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }
    if (file.size > 3 * 1024 * 1024) {
      return toast.error("Logo must be less than 3MB");
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");

    const html = editorRef.current?.getContent() || "";
    if (!html.trim() || html === "<p></p>") {
      return toast.error("Content is required");
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("content", html);
      fd.append("status", status);

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tags.forEach((t) => fd.append("tags[]", t));

      if (logoFile) fd.append("companyLogo", logoFile);

      const url = isEdit
        ? `/api/secure/companies/${company._id}`
        : "/api/secure/companies/create";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(isEdit ? "Company updated!" : "Company created!");
        onSaved();
      } else {
        toast.error(data.message || "Failed to save company");
      }
    } catch {
      toast.error("Failed to save company");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[#3D444C] text-[#E7E3D8] px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">
              {isEdit ? "Edit Company" : "Create New Company"}
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
                Company Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. bKash Limited"
                maxLength={300}
                required
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Company Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-[#E7E3D8] border border-[#3D444C]/10 flex items-center justify-center shrink-0">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <FaBuilding className="text-4xl text-[#3D444C]/30" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#E7E3D8] border border-[#D3A16D] rounded-lg text-sm font-medium text-[#3D444C] hover:bg-[#D3A16D]/30 transition-colors">
                    <FaImage />{" "}
                    {isEdit && logoPreview ? "Replace Logo" : "Choose Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PNG or JPG, up to 3MB.
                    {isEdit && " Leave unchanged to keep current logo."}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Details / About *
              </label>
              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                onInit={(_evt, editor) => (editorRef.current = editor)}
                initialValue={initialContent}
                init={{
                  height: 450,
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

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-[#3D444C] mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comma separated (e.g. fintech, bank, telecom)"
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
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
                    <FaCheck /> {isEdit ? "Update Company" : "Create Company"}
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