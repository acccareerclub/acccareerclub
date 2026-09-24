// app/dashboard/events/PreRegistrationModal.jsx
"use client";

import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";

const AVATAR_FALLBACK =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/default-avatar.png";

const PreRegistrationModal = ({ event, onClose, onSaved }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialIds, setInitialIds] = useState([]);

  // External (manual) entries — not from User collection
  const [externalUsers, setExternalUsers] = useState([]);
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [externalForm, setExternalForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    identificationNo: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/secure/events/pre-registration?eventId=${event._id}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);

        // Pre-select users already in pre-registration
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
              institution: u.institution || "", // ✅ include institution
              identificationNo: u.identificationNo || "",
            });
          }
        });

        setSelectedIds(preselected);
        setInitialIds(preselected);
        setExternalUsers(preExternal);
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

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.studentId?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.department?.toLowerCase().includes(term)
    );
  });

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

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const preRegistrationUsers = [
        // Selected internal users
        ...selectedIds.map((id) => {
          const u = users.find((x) => x._id.toString() === id);
          return {
            userId: id,
            name: u?.fullName || "",
            email: u?.email || "",
            phone: u?.phone || "",
            institution: u?.department || "", // internal: use department as institution
            identificationNo: u?.studentId || "",
          };
        }),
        // External manual users
        ...externalUsers.map((e) => ({
          name: e.name,
          email: e.email,
          phone: e.phone || "",
          institution: e.institution, // ✅ include institution
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
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
          </div>
          <button
            onClick={() => setShowExternalForm(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors font-medium text-sm"
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
            <span className="flex items-center gap-2 text-[#3D444C]/70">
              <FaUsers className="text-[#D3A16D]" />
              <span className="font-semibold text-[#3D444C]">
                {users.length}
              </span>
              eligible
            </span>
            <span className="text-[#3D444C]/20 hidden sm:block">|</span>
            <span className="flex items-center gap-2 text-[#994D35]">
              <FaUserCheck />
              <span className="font-semibold">{selectedIds.length}</span>
              members
            </span>
            <span className="text-[#3D444C]/20 hidden sm:block">|</span>
            <span className="flex items-center gap-2 text-purple-600">
              <FaBuilding />
              <span className="font-semibold">{externalUsers.length}</span>
              external
            </span>
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

        {/* Internal Users List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-4xl text-[#3D444C]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#3D444C]/10">
            <FaUsers className="text-4xl text-[#3D444C]/30 mx-auto mb-3" />
            <p className="text-[#3D444C]/60">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredUsers.map((u) => {
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
                    <div
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${
                        isSelected && wasSelected
                          ? "border-white"
                          : isSelected
                            ? "border-[#D3A16D]"
                            : "border-[#3D444C]/10"
                      }`}
                    >
                      <Image
                        src={u.personalInfo?.profilePicture || AVATAR_FALLBACK}
                        alt={u.fullName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    {isSelected && (
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                          wasSelected ? "bg-white" : "bg-[#D3A16D]"
                        }`}
                      >
                        <FaCheck
                          className={`text-[10px] ${
                            wasSelected ? "text-green-600" : "text-[#3D444C]"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${
                        isSelected ? "text-white" : "text-[#3D444C]"
                      }`}
                    >
                      {u.fullName}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        isSelected ? "text-white/80" : "text-[#3D444C]/60"
                      }`}
                    >
                      ID: {u.studentId || "N/A"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
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
                  <FaSave /> Save Pre-Registration
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
