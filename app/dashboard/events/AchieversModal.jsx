// app/dashboard/events/AchieversModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaSpinner,
  FaSave,
  FaTrophy,
  FaMedal,
  FaUserPlus,
  FaTrash,
  FaCheck,
  FaSearch,
  FaBuilding,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";

const AVATAR_FALLBACK =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/default-avatar.png";

const POSITION_OPTIONS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "Champion",
  "Runner-up",
  "Finalist",
  "Special Mention",
  "Honorable Mention",
];

const AchieversModal = ({ event, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [externals, setExternals] = useState([]);

  // Currently selected achievers
  const [achievers, setAchievers] = useState([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/secure/events/achievers?eventId=${event._id}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success) {
        setEventData(data.event);
        setAttendees(data.event.eventAttendees || []);
        setExternals(data.event.externalAttendees || []);
        setAchievers(
          (data.event.achievers || []).map((a) => ({
            userId: a.userId || null,
            position: a.position || "",
            name: a.name || "",
            email: a.email || "",
            institution: a.institution || "",
            identificationNo: a.identificationNo || "",
          })),
        );
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Helpers ----------
  const achieverKey = (a) =>
    `${(a.name || "").trim().toLowerCase()}|${(
      a.email ||
      a.identificationNo ||
      ""
    )
      .trim()
      .toLowerCase()}`;

  const isAchiever = (person) =>
    achievers.some((a) => achieverKey(a) === achieverKey(person));

  const toggleAchiever = (person, defaultPosition = "1st") => {
    setAchievers((prev) => {
      const exists = prev.some((a) => achieverKey(a) === achieverKey(person));
      if (exists) {
        return prev.filter((a) => achieverKey(a) !== achieverKey(person));
      }
      return [
        ...prev,
        {
          userId: person.userId || person._id || null,
          position: defaultPosition,
          name: person.name || person.fullName || "",
          email: person.email || "",
          institution: person.institution || person.department || "",
          identificationNo: person.identificationNo || person.studentId || "",
        },
      ];
    });
  };

  const updateAchieverPosition = (key, position) => {
    setAchievers((prev) =>
      prev.map((a) => (achieverKey(a) === key ? { ...a, position } : a)),
    );
  };

  const removeAchiever = (key) => {
    setAchievers((prev) => prev.filter((a) => achieverKey(a) !== key));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/secure/events/achievers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          achievers,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onSaved?.();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to save achievers");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Filters ----------
  const filterFn = (p) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (p.fullName || p.name || "").toLowerCase().includes(term) ||
      (p.studentId || p.identificationNo || "")
        .toLowerCase()
        .includes(term) ||
      (p.email || "").toLowerCase().includes(term) ||
      (p.institution || p.department || "").toLowerCase().includes(term)
    );
  };

  const filteredAttendees = attendees.filter(filterFn);
  const filteredExternals = externals.filter(filterFn);

  // Position badge colors
  const positionColor = (pos) => {
    const p = (pos || "").toLowerCase();
    if (p.includes("1st") || p.includes("champion"))
      return "bg-[#D3A16D] text-[#3D444C]";
    if (p.includes("2nd") || p.includes("runner"))
      return "bg-[#994D35] text-white";
    if (p.includes("3rd")) return "bg-[#3D444C] text-[#E7E3D8]";
    return "bg-purple-500 text-white";
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-[100] bg-[#3D444C]/60 backdrop-blur-sm flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-[#D3A16D]" />
      </div>
    );

  return (
    <div className="fixed inset-0 z-[100] bg-[#E7E3D8] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#3D444C] text-[#E7E3D8] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#D3A16D] flex items-center justify-center shrink-0">
              <FaTrophy className="text-[#3D444C]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                Set Achievers
              </h1>
              <p className="text-xs sm:text-sm text-[#E7E3D8]/70 truncate">
                {event.eventTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-[#994D35] transition-colors shrink-0"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[72px] z-10 bg-[#E7E3D8] border-b border-[#3D444C]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search attendees & externals..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Stats */}
        <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-[#D3A16D]">
              <FaTrophy />
              <span className="font-semibold text-[#3D444C]">
                {achievers.length}
              </span>
              achiever{achievers.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        </div>

        {/* ===== Selected Achievers ===== */}
        {achievers.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#D3A16D]/40 p-4 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
              <FaTrophy className="text-[#D3A16D]" /> Selected Achievers (
              {achievers.length})
            </h3>
            <div className="space-y-2">
              {achievers.map((a) => {
                const key = achieverKey(a);
                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#F9F8F5] border border-[#D3A16D]/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#3D444C] text-[#E7E3D8] flex items-center justify-center font-bold text-sm shrink-0">
                        {a.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#3D444C] truncate">
                          {a.name}
                        </p>
                        <p className="text-xs text-[#3D444C]/60 truncate">
                          {a.institution ||
                            a.email ||
                            a.identificationNo ||
                            "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={a.position}
                        onChange={(e) =>
                          updateAchieverPosition(key, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs border-2 focus:outline-none cursor-pointer ${positionColor(
                          a.position,
                        )}`}
                      >
                        {POSITION_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeAchiever(key)}
                        className="p-2 text-[#994D35] hover:bg-red-50 rounded-lg"
                        title="Remove"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Attendees Section ===== */}
        <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
            <FaCheck className="text-green-600" /> Attendees
            <span className="text-[#3D444C]/50 font-normal">
              ({filteredAttendees.length})
            </span>
          </h3>

          {filteredAttendees.length === 0 ? (
            <p className="text-sm text-[#3D444C]/50 italic py-4 text-center">
              No attendees match your search
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {filteredAttendees.map((u) => {
                const selected = isAchiever({
                  name: u.fullName,
                  email: u.email,
                  identificationNo: u.studentId,
                });
                return (
                  <button
                    key={u._id}
                    onClick={() =>
                      toggleAchiever(
                        {
                          _id: u._id,
                          userId: u._id,
                          name: u.fullName,
                          email: u.email,
                          institution: u.department,
                          identificationNo: u.studentId,
                        },
                        "1st",
                      )
                    }
                    className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      selected
                        ? "bg-[#3D444C] text-[#E7E3D8] border-[#3D444C]"
                        : "bg-white text-[#3D444C] border-[#3D444C]/10 hover:border-[#D3A16D]"
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#D3A16D]/40 shrink-0">
                      <Image
                        src={u.personalInfo?.profilePicture || AVATAR_FALLBACK}
                        alt={u.fullName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {u.fullName}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          selected ? "text-[#E7E3D8]/70" : "text-[#3D444C]/60"
                        }`}
                      >
                        ID: {u.studentId || "N/A"}
                      </p>
                    </div>
                    {selected && <FaCheck className="text-[#D3A16D]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Externals Section ===== */}
        {externals.length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-200 p-4 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
              <FaBuilding className="text-purple-600" /> External Attendees
              <span className="text-[#3D444C]/50 font-normal">
                ({filteredExternals.length})
              </span>
            </h3>

            {filteredExternals.length === 0 ? (
              <p className="text-sm text-[#3D444C]/50 italic py-4 text-center">
                No externals match your search
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredExternals.map((e, idx) => {
                  const selected = isAchiever(e);
                  return (
                    <button
                      key={`${e.name}-${idx}`}
                      onClick={() => toggleAchiever(e, "1st")}
                      className={`text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        selected
                          ? "bg-purple-600 text-white border-purple-700"
                          : "bg-purple-50/50 text-[#3D444C] border-purple-200 hover:border-purple-400"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold shrink-0">
                        {e.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {e.name}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            selected ? "text-white/80" : "text-[#3D444C]/60"
                          }`}
                        >
                          {e.institution || "External"}
                        </p>
                      </div>
                      {selected && <FaCheck />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#3D444C] border-t border-[#D3A16D]/30 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-[#E7E3D8] text-sm">
            <span className="font-bold text-[#D3A16D]">
              {achievers.length}
            </span>{" "}
            achiever{achievers.length !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E7E3D8]/30 text-[#E7E3D8] rounded-lg hover:bg-white/10 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#D3A16D] text-[#3D444C] rounded-lg hover:bg-[#994D35] hover:text-white font-bold text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Achievers
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchieversModal;