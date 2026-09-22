// app/components/home/HomeNotice.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaBell,
  FaCalendar,
  FaUserShield,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const HomeNotice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        // CHANGED: Use the new, fast endpoint
        const response = await fetch("/api/users/notice/get-home-notices");
        const data = await response.json();

        if (data.success) {
          setNotices(data.notices);
        } else {
          setError(data.message || "Failed to load notices");
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
        setError("Failed to load notices");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Priority colors for list badges
  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-600",
      medium: "bg-blue-50 text-blue-600 border border-blue-100",
      high: "bg-orange-50 text-orange-600 border border-orange-100",
      urgent: "bg-red-50 text-red-600 border border-red-100 font-bold",
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };
    return labels[priority] || "Medium";
  };

  // Helper to format the schema roles nicely
  const formatRole = (role) => {
    const roles = {
      prefect: "Prefect",
      itsecretary: "IT Secretary",
      modarator: "Moderator", // Spelled as per your schema
    };
    return roles[role] || "System Admin";
  };

  // List View Skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#994D35]/10 rounded-lg">
            <FaBell className="text-[#994D35] text-xl" />
          </div>
          <h3 className="text-xl font-bold text-[#3D444C]">Notice Board</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex-1 w-full">
                <div className="h-5 bg-gray-200 rounded-md w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded-md hidden sm:block"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full max-w-4xl mx-auto text-center">
        <div className="inline-flex p-4 bg-red-50 rounded-full mb-3">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Oops!</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  // Empty State
  if (notices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 w-full max-w-4xl mx-auto text-center">
        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-3">
          <FaBell className="text-gray-400 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">No Notices Yet</h3>
        <p className="text-gray-500">
          Check back later for updates and announcements.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 w-full max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#994D35]/10 rounded-xl">
            <FaBell className="text-[#994D35] text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-[#3D444C]">Notice Board</h3>
              <span className="bg-[#994D35] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {notices.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Stay updated with the latest announcements
            </p>
          </div>
        </div>

        <Link
          href="/all-notice"
          className="group flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#994D35] text-gray-600 hover:text-white text-sm font-medium rounded-lg transition-all duration-300"
        >
          View All
          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* List Layout for Notices */}
      <div className="space-y-3">
        {notices.map((notice) => (
          <Link
            key={notice._id}
            href={`/all-notice/${notice._id}`}
            className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-[#D3A16D]/40 hover:shadow-md transition-all duration-200 relative overflow-hidden ${
              notice.priority === "urgent"
                ? "border-l-4 border-l-red-500 pl-3 sm:pl-4"
                : ""
            }`}
          >
            <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-4">
              <h4 className="text-base font-semibold text-[#3D444C] group-hover:text-[#994D35] transition-colors truncate mb-1">
                {notice.title}
              </h4>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {/* Replaced User Name with Role Badge */}
                <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md font-medium text-gray-600">
                  <FaUserShield className="text-[10px] text-gray-400" />
                  {formatRole(notice.createdByRole)}
                </span>

                <span className="flex items-center gap-1.5">
                  <FaCalendar className="text-[10px] text-gray-400" />
                  {formatDistanceToNow(new Date(notice.createdAt))} ago
                </span>
              </div>
            </div>

            {/* Priority Badge on the right */}
            <div className="flex items-center shrink-0">
              <span
                className={`text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider font-semibold ${getPriorityColor(notice.priority)}`}
              >
                {notice.priority === "urgent" && (
                  <FaExclamationTriangle className="animate-pulse" />
                )}
                {getPriorityLabel(notice.priority)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeNotice;
