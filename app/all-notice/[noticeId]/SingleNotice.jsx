// app/all-notice/[noticeId]/SingleNotice.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowLeft,
  FaCalendar,
  FaUser,
  FaImage,
  FaEye,
  FaClock,
  FaBell,
} from "react-icons/fa";
import { format, formatDistanceToNow } from "date-fns";

const SingleNotice = () => {
  const params = useParams();
  const noticeId = params?.noticeId;

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      if (!noticeId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/users/notice/get-single-notice?noticeId=${noticeId}`,
        );
        const data = await response.json();

        if (data.success) {
          setNotice(data.notice);
        } else {
          setError(data.message || "Notice not found");
        }
      } catch (error) {
        console.error("Error fetching notice:", error);
        setError("Failed to load notice");
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  // Priority configs
  const getPriorityConfig = (priority) => {
    const configs = {
      low: {
        bg: "bg-gray-100",
        text: "text-gray-600",
        label: "Low",
        border: "border-gray-300",
      },
      medium: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        label: "Medium",
        border: "border-blue-300",
      },
      high: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        label: "High",
        border: "border-orange-300",
      },
      urgent: {
        bg: "bg-red-100",
        text: "text-red-600",
        label: "Urgent",
        border: "border-red-300",
      },
    };
    return configs[priority] || configs.medium;
  };

  const getCategoryLabel = (value) => {
    const categories = {
      general: "General",
      academic: "Academic",
      event: "Event",
      career: "Career",
      important: "Important",
      club: "Club",
    };
    return categories[value] || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4 font-medium">Loading notice...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Notice Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The notice you're looking for doesn't exist."}
          </p>
          <Link
            href="/all-notice"
            className="inline-flex items-center gap-2 bg-[#994D35] text-white px-6 py-3 rounded-lg hover:bg-[#3D444C] transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            Back to Notices
          </Link>
        </div>
      </div>
    );
  }

  const priority = getPriorityConfig(notice.priority);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          href="/all-notice"
          className="inline-flex items-center gap-2 text-[#3D444C] hover:text-[#994D35] transition-colors mb-6"
        >
          <FaArrowLeft className="text-sm" />
          Back to Notices
        </Link>

        {/* Notice Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${priority.bg} ${priority.text}`}
              >
                {priority.label}
              </span>
              <span className="text-xs bg-[#E7E3D8] text-[#3D444C] px-3 py-1 rounded-full">
                {getCategoryLabel(notice.category)}
              </span>
              {notice.images && notice.images.length > 0 && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaImage className="text-xs" />
                  {notice.images.length} image(s)
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3D444C] mb-4">
              {notice.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <span className="flex items-center gap-1">
                <FaUser className="text-[#D3A16D]" />
                <span className="font-medium text-[#3D444C]">
                  {notice.createdByName || "Unknown"}
                </span>
                {notice.createdBy?.role && (
                  <span className="text-xs bg-[#E7E3D8] px-2 py-0.5 rounded-full text-[#3D444C]">
                    {notice.createdBy.role}
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1">
                <FaCalendar className="text-[#D3A16D]" />
                {format(new Date(notice.createdAt), "MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="text-[#D3A16D]" />
                {formatDistanceToNow(new Date(notice.createdAt), {
                  addSuffix: true,
                })}
              </span>
              {notice.views > 0 && (
                <span className="flex items-center gap-1">
                  <FaEye className="text-[#D3A16D]" />
                  {notice.views} view{notice.views !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Text Content */}
            <div
              className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>

          {/* Images Section - Full Width, placed after text */}
          {notice.images && notice.images.length > 0 && (
            <div className="w-full flex flex-col mt-4">
              {notice.images.map((img, index) => (
                <div key={index} className="relative w-full bg-gray-50">
                  <Image
                    src={img.url}
                    alt={`Notice image ${index + 1}`}
                    className="w-full h-auto object-cover block"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="p-6 sm:p-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaBell className="text-[#D3A16D]" />
                <span>
                  Published:{" "}
                  {format(new Date(notice.publishedAt), "PPP 'at' p")}
                </span>
              </div>
              <Link
                href="/all-notice"
                className="inline-flex items-center gap-2 text-[#994D35] hover:text-[#3D444C] transition-colors font-medium"
              >
                View All Notices
                <FaArrowLeft className="text-sm rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleNotice;
