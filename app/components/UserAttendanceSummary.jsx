// app/components/UserAttendanceSummary.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaChalkboardTeacher,
  FaChartPie,
  FaAward,
  FaInfoCircle,
} from "react-icons/fa";

// ==========================================
// COLOR HELPERS — tiered by rate
// ==========================================
const getRateStyle = (rate) => {
  if (rate >= 80)
    return {
      stroke: "#16A34A", // green-600
      bg: "#DCFCE7", // green-100
      text: "#166534", // green-800
      label: "Excellent",
    };
  if (rate >= 50)
    return {
      stroke: "#D97706", // amber-600
      bg: "#FEF3C7", // amber-100
      text: "#92400E", // amber-800
      label: "Good",
    };
  if (rate > 0)
    return {
      stroke: "#DC2626", // red-600
      bg: "#FEE2E2", // red-100
      text: "#991B1B", // red-800
      label: "Low",
    };
  return {
    stroke: "#6B7280", // gray-500
    bg: "#F3F4F6", // gray-100
    text: "#4B5563", // gray-600
    label: "None",
  };
};

// ==========================================
// CIRCULAR PROGRESS
// ==========================================
const CircleProgress = ({
  value = 0,
  size = 100,
  strokeWidth = 8,
  icon: Icon,
  label,
  sub,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const style = getRateStyle(value);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          style={{ display: "block" }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={style.bg}
            strokeWidth={strokeWidth}
          />
          {/* Value ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={style.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.8s ease-out",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon className="text-lg mb-0.5" style={{ color: style.stroke }} />}
          <p className="text-2xl font-extrabold leading-none" style={{ color: style.text }}>
            {value}
            <span className="text-sm font-semibold">%</span>
          </p>
        </div>
      </div>

      <p className="text-sm font-bold text-[#3D444C] mt-2">{label}</p>
      {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const UserAttendanceSummary = ({ userId }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${userId}/attendance-report`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && data.success) {
          setReport(data.report);
        }
      } catch (err) {
        console.error("Attendance report fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ---------- Skeleton ----------
  if (loading || !report) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#3D444C]/10 animate-pulse" />
          <div className="h-6 w-48 bg-[#3D444C]/10 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-[100px] h-[100px] rounded-full bg-[#3D444C]/10 animate-pulse" />
              <div className="h-4 w-20 bg-[#3D444C]/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { events, sessions, overall } = report;
  const overallStyle = getRateStyle(overall.rate);

  // Message based on overall performance
  const message = (() => {
    if (overall.total === 0)
      return {
        text: "No attendance records yet. Attend events and sessions to build your profile.",
        color: "#4B5563",
        bg: "#F3F4F6",
        border: "#D1D5DB",
      };
    if (overall.rate >= 80)
      return {
        text: "Outstanding attendance! You're on track to earn a Certificate of Participation.",
        color: "#166534",
        bg: "#DCFCE7",
        border: "#86EFAC",
      };
    if (overall.rate >= 50)
      return {
        text: "Good attendance! Keep participating to qualify for a Certificate of Participation.",
        color: "#92400E",
        bg: "#FEF3C7",
        border: "#FCD34D",
      };
    return {
      text: "Low attendance. Attend more events and sessions to be eligible for a Certificate of Participation.",
      color: "#991B1B",
      bg: "#FEE2E2",
      border: "#FCA5A5",
    };
  })();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${overallStyle.stroke}15` }}
        >
          <FaChartPie
            className="text-lg"
            style={{ color: overallStyle.stroke }}
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#3D444C]">
            Attendance Summary
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Based on events & Sessions after joining in the community.
          </p>
        </div>
      </div>

      {/* Circles grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        <CircleProgress
          value={events.rate}
          size={100}
          strokeWidth={8}
          icon={FaCalendarCheck}
          label="Events"
          sub={`${events.attended}/${events.total}`}
        />
        <CircleProgress
          value={sessions.rate}
          size={100}
          strokeWidth={8}
          icon={FaChalkboardTeacher}
          label="Sessions"
          sub={`${sessions.attended}/${sessions.total}`}
        />
        <CircleProgress
          value={overall.rate}
          size={100}
          strokeWidth={8}
          icon={FaAward}
          label="Average"
          sub={`${overall.attended}/${overall.total}`}
        />
      </div>

      {/* Certificate hint */}
      <div
        className="rounded-xl p-4 border flex items-start gap-3"
        style={{
          background: message.bg,
          borderColor: message.border,
        }}
      >
        <FaInfoCircle
          className="flex-shrink-0 mt-0.5"
          style={{ color: message.color }}
          size={16}
        />
        <div className="text-xs leading-relaxed" style={{ color: message.color }}>
          <p className="font-semibold">
            Good attendance can earn you a Certificate of Participation.
          </p>
          <p className="mt-0.5 opacity-90">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default UserAttendanceSummary;