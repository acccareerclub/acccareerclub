// app/components/certificates/PublishButton.jsx
"use client";

import React, { useState } from "react";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const PublishButton = ({ certificate, onToggled, size = "sm" }) => {
  const [loading, setLoading] = useState(false);

  const isPublished = !!certificate.published;

  const handleToggle = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/secure/certificates/publish", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          certificateIds: [certificate._id],
          published: !isPublished,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isPublished ? "Unpublished" : "Published ✓");
        onToggled?.(certificate._id, !isPublished);
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const base =
    size === "xs"
      ? "px-2 py-1 text-[10px] gap-1"
      : "px-3 py-1.5 text-xs gap-1.5";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isPublished ? "Unpublish" : "Publish"}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all disabled:opacity-60 ${base} ${
        isPublished
          ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
          : "bg-[#3D444C] text-[#E7E3D8] hover:bg-[#994D35]"
      }`}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin text-[10px]" />
          <span>...</span>
        </>
      ) : isPublished ? (
        <>
          <FaEye className="text-[10px]" />
          <span>Published</span>
        </>
      ) : (
        <>
          <FaEyeSlash className="text-[10px]" />
          <span>Publish</span>
        </>
      )}
    </button>
  );
};

export default PublishButton;