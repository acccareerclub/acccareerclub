// app/dashboard/events/PreRegistrationModal.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaSearch,
  FaSpinner,
  FaCheck,
  FaUserPlus,
  FaUserCheck,
  FaSave,
  FaTrash,
  FaUsers,
  FaBuilding,
  FaUserCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";

// Reusable avatar: profile picture if valid, otherwise a React user icon
const UserAvatar = ({ src, alt = "User", size = 48, className = "" }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = src && !imgFailed;

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-[#E7E3D8] flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${size}px`}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <FaUserCircle
          className="text-[#994D35]"
          style={{ fontSize: size * 0.82 }}
        />
      )}
    </div>
  );
};

const PreRegistrationModal = ({ event, onClose, onSaved }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialIds, setInitialIds] = useState([]);

  // External (manual) entries
  const [externalUsers, setExternalUsers] = useState([]);
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [externalForm, setExternalForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    identificationNo: "",
  });

  // ---------- Fetch ----------
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/secure/events/pre-registration?eventId=${event._id}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);

        const preselected = [];
        const preExternal = [];

        (data.event.preRegistrationUsers || []).forEach((u) => {
          if (u.userId) {
            preselected.push(u.userId.toString());
          } else {
            preExternal.push({
              name: u.name || "",
              email: u.email || "",
              phone: u.phone || "",
              institution: u.institution || "",
              identificationNo: u.identificationNo || "",
            });
          }
        });

        setSelectedIds(preselected);
        setInitialIds(preselected);
        setExternalUsers(preExternal);
      } else {
        toast.error(data.message || "Failed to load data");
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Helpers ----------
  const userMap = useMemo(() => {
    const m = new Map();
    users.forEach((u) => m.set(u._id.toString(), u));
    return m;
  }, [users]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const term = searchTerm.toLowerCase().trim();
  const isSearching = term.length >= 2;

  // Filter matches — searched by name / email / studentId / membershipId / phone / department
  const searchMatches = useMemo(() => {
    if (!isSearching) return [];
    return users.filter((u) => {
      return (
        u.fullName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.studentId?.toLowerCase().includes(term) ||
        u.membershipId?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term) ||
        u.department?.toLowerCase().includes(term)
      );
    });
  }, [users, term, isSearching]);

  // ✅ Default list = only those currently selected (pre-registered)
  //    When searching, show matching users instead
  const displayList = useMemo(() => {
    if (isSearching) {
      // sort: unselected first, then selected (keeps "add candidates" at top)
      return [...searchMatches].sort((a, b) => {
        const aSel = selectedIds.includes(a._id.toString());
        const bSel = selectedIds.includes(b._id.toString());
        if (aSel === bSel) return 0;
        return aSel ? 1 : -1;
      });
    }
    // No search → pre-registered only (map IDs to full user objects)
    return selectedIds
      .map((id) => userMap.get(id))
      .filter(Boolean);
  }, [isSearching, searchMatches, selectedIds, userMap]);

  // ---------- External add ----------
  const addExternalUser = () => {
    if (!externalForm.name.trim()) {
      return toast.error("Name is required for external participants");
    }
    const digitsOnly = externalForm.phone.replace(/\D/g, "");
    if (digitsOnly && digitsOnly.length > 11) {
      return toast.error("Phone number cannot exceed 11 digits");
    }
    setExternalUsers((prev) => [
      ...prev,
      {
        name: externalForm.name.trim(),
        email: externalForm.email.trim(),
        phone: digitsOnly,
        institution: externalForm.institution.trim(),
        identificationNo: externalForm.identificationNo.trim(),
      },
    ]);
    setExternalForm({
      name: "",
      email: "",
      phone: "",
      institution: "",
      identificationNo: "",
    });
    setShowExternalForm(false);
  };

  const removeExternalUser = (index) => {
    setExternalUsers((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Save ----------
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const preRegistrationUsers = [
        ...selectedIds.map((id) => {
          const u = userMap.get(id);
          return {
            userId: id,
            name: u?.fullName || "",
            email: u?.email || "",
            phone: u?.phone || "",
            institution: u?.department || "",
            identificationNo: u?.studentId || "",
          };
        }),
        ...externalUsers.map((e) => ({
          name: e.name,
          email: e.email,
          phone: e.phone || "",
          institution: e.institution,
          identificationNo: e.identificationNo,
        })),
      ];

      const res = await fetch("/api/secure/events/pre-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          preRegistrationUsers,
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
      toast.error("Failed to save pre-registration");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSelected = selectedIds.length + externalUsers.length;

  return (
    <div className="fixed inset-0 z-[100] bg-[#E7E3D8] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#3D444C] text-[#E7E3D8] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#D3A16D] flex items-center justify-center shrink-0">
              <FaUserPlus className="text-[#3D444C]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                Pre-Registration
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
              placeholder="Search by name, email, student ID, membership ID, phone…"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[#E7E3D8] text-[#3D444C]/60 hover:text-[#3D444C]"
                title="Clear search"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowExternalForm(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-[#994D35] text-[#994D35] rounded-lg hover:bg-[#3D444C] hover:text-white transition-colors font-medium text-sm"
          >
            <FaUserPlus /> Add External
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Stats */}
        <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 flex flex-wrap items-center gap-4 justify-between shadow-sm">
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="flex items-center gap-2 text-[#994D35]">
              <FaUserCheck />
              <span className="font-semibold">{selectedIds.length}</span>
              members pre-registered
            </span>
            <span className="text-[#3D444C]/20 hidden sm:block">|</span>
            <span className="flex items-center gap-2 text-purple-600">
              <FaBuilding />
              <span className="font-semibold">{externalUsers.length}</span>
              external
            </span>
            {isSearching && (
              <>
                <span className="text-[#3D444C]/20 hidden sm:block">|</span>
                <span className="text-[#3D444C]/70">
                  <span className="font-semibold">{searchMatches.length}</span>{" "}
                  matching the search
                </span>
              </>
            )}
          </div>
          {totalSelected > 0 && (
            <button
              onClick={() => {
                setSelectedIds([]);
                setExternalUsers([]);
              }}
              className="text-sm text-[#994D35] hover:text-[#3D444C] font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* External Users List */}
        {externalUsers.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
              <FaBuilding className="text-purple-600" /> External Participants (
              {externalUsers.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {externalUsers.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {e.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3D444C] truncate">
                      {e.name}
                    </p>
                    <p className="text-xs text-[#3D444C]/60 truncate">
                      {e.phone ? `📞 ${e.phone} • ` : ""}
                      {e.institution ||
                        e.email ||
                        e.identificationNo ||
                        "External"}
                    </p>
                  </div>
                  <button
                    onClick={() => removeExternalUser(i)}
                    className="text-[#994D35] hover:text-red-700 p-1"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-4xl text-[#3D444C]" />
          </div>
        ) : (
          <>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-[#3D444C]">
                {isSearching
                  ? `Search results (${displayList.length})`
                  : `Pre-registered Members (${displayList.length})`}
              </h3>
              {isSearching && displayList.length > 0 && (
                <span className="text-[11px] text-[#3D444C]/50 font-normal">
                  click a user to add / remove
                </span>
              )}
            </div>

            {displayList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#3D444C]/10">
                <FaUsers className="text-4xl text-[#3D444C]/30 mx-auto mb-3" />
                <p className="text-[#3D444C]/60 text-sm">
                  {isSearching
                    ? `No users match "${searchTerm}"`
                    : "No one is pre-registered yet. Use the search bar above to find and add members."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayList.map((u) => {
                  const idStr = u._id.toString();
                  const isSelected = selectedIds.includes(idStr);
                  const wasSelected = initialIds.includes(idStr);
                  return (
                    <button
                      key={u._id}
                      onClick={() => toggleUser(idStr)}
                      className={`text-left p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 relative ${
                        isSelected && wasSelected
                          ? "bg-green-500 text-white border-green-600 shadow-md"
                          : isSelected
                            ? "bg-[#3D444C] text-[#E7E3D8] border-[#3D444C] shadow-md"
                            : "bg-white text-[#3D444C] border-[#3D444C]/10 hover:border-[#D3A16D] hover:shadow-sm"
                      }`}
                    >
                      {wasSelected && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-white/25 text-[8px] font-bold tracking-wide">
                          PRE
                        </span>
                      )}

                      <div className="relative shrink-0">
                        <UserAvatar
                          src={u.personalInfo?.profilePicture}
                          alt={u.fullName}
                          size={48}
                          className={`border-2 ${
                            isSelected && wasSelected
                              ? "border-white"
                              : isSelected
                                ? "border-[#D3A16D]"
                                : "border-[#3D444C]/10"
                          }`}
                        />
                        {isSelected && (
                          <div
                            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                              wasSelected ? "bg-white" : "bg-[#D3A16D]"
                            }`}
                          >
                            <FaCheck
                              className={`text-[10px] ${
                                wasSelected
                                  ? "text-green-600"
                                  : "text-[#3D444C]"
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={`font-semibold text-sm truncate ${
                              isSelected ? "text-white" : "text-[#3D444C]"
                            }`}
                          >
                            {u.fullName}
                          </p>
                          {u.membershipId && (
                            <span
                              className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-[#D3A16D]/20 text-[#994D35] border border-[#D3A16D]/40"
                              }`}
                            >
                              {u.membershipId}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate ${
                            isSelected ? "text-white/80" : "text-[#3D444C]/60"
                          }`}
                        >
                          ID: {u.studentId || "N/A"}
                        </p>
                        {u.phone && (
                          <p
                            className={`text-[10px] truncate ${
                              isSelected
                                ? "text-white/70"
                                : "text-[#3D444C]/50"
                            }`}
                          >
                            📞 {u.phone}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* External User Form Modal */}
      {showExternalForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#3D444C] mb-4 flex items-center gap-2">
              <FaBuilding className="text-purple-600" /> Add External
              Participant
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name *"
                value={externalForm.name}
                onChange={(e) =>
                  setExternalForm({ ...externalForm, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
              <input
                type="text"
                placeholder="Institution (e.g., BRAC University, Notre Dame College)"
                value={externalForm.institution}
                onChange={(e) =>
                  setExternalForm({
                    ...externalForm,
                    institution: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
              <input
                type="email"
                placeholder="Email"
                value={externalForm.email}
                onChange={(e) =>
                  setExternalForm({ ...externalForm, email: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="Phone (11 digits max)"
                value={externalForm.phone}
                onChange={(e) =>
                  setExternalForm({
                    ...externalForm,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                  })
                }
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
              <input
                type="text"
                placeholder="Identification No."
                value={externalForm.identificationNo}
                onChange={(e) =>
                  setExternalForm({
                    ...externalForm,
                    identificationNo: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowExternalForm(false);
                  setExternalForm({
                    name: "",
                    email: "",
                    phone: "",
                    institution: "",
                    identificationNo: "",
                  });
                }}
                className="flex-1 px-4 py-2.5 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={addExternalUser}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#3D444C] border-t border-[#D3A16D]/30 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-[#E7E3D8] text-sm">
            <span className="font-bold text-[#D3A16D]">{totalSelected}</span>{" "}
            pre-registered
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-2 md:px-6 py-2 md:py-2.5 border border-[#E7E3D8]/30 text-[#E7E3D8] rounded-lg hover:bg-white/10 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-2 md:px-6 py-2 md:py-2.5 bg-[#D3A16D] text-[#3D444C] rounded-lg hover:bg-[#994D35] hover:text-white font-bold text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreRegistrationModal;