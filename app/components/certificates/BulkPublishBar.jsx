// app/components/certificates/BulkPublishBar.jsx
"use client";

import React, { useState } from "react";
import { FaSpinner, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const BulkPublishBar = ({ selectedIds, onClear, onDone }) => {
  const [loading, setLoading] = useState(null); // "publish" | "unpublish" | null

  const run = async (published) => {
    if (!selectedIds.length) return;
    setLoading(published ? "publish" : "unpublish");
    try {
      const res = await fetch("/api/secure/certificates/publish", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          certificateIds: selectedIds,
          published,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onDone?.(selectedIds, published);
        onClear?.();
      } else {
        toast.error(data.message || "Failed");
      }
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="sticky top-2 z-30 mb-4 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-[#3D444C] text-[#E7E3D8] shadow-lg border border-[#D3A16D]/30">
      <span className="text-sm font-semibold">
        <span className="text-[#D3A16D] font-bold">{selectedIds.length}</span>{" "}
        selected
      </span>

      <div className="flex-1" />

      <button
        onClick={() => run(true)}
        disabled={!!loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {loading === "publish" ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaEye />
        )}
        Publish
      </button>

      <button
        onClick={() => run(false)}
        disabled={!!loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-[#E7E3D8] text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-60"
      >
        {loading === "unpublish" ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaEyeSlash />
        )}
        Unpublish
      </button>

      <button
        onClick={onClear}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        title="Clear selection"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default BulkPublishBar;