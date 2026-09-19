// app/dashboard/settings/alumni/CreateAlumniModal.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FaTimes,
  FaSearch,
  FaSpinner,
  FaUserGraduate,
  FaBriefcase,
  FaBuilding,
  FaPhone,
  FaGraduationCap,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCheck,
  FaLayerGroup,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const CreateAlumniModal = ({ isOpen, onClose, onCreated }) => {
  const [step, setStep] = useState(1); // 1: Search & Select, 2: Fill Alumni Info

  // Step 1: Search
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Step 2: Alumni Info
  const [alumniForm, setAlumniForm] = useState({
    batch: "",
    passedYear: "",
    currentJobCompany: "",
    currentDesignation: "",
    isUnemployed: false,
    contactPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ==================== SEARCH USERS ====================
  const searchUsers = useCallback(async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment && { department: filterDepartment }),
        limit: 30,
      });

      const res = await fetch(`/api/secure/alumni/create?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setDepartments(data.departments || []);
      } else {
        toast.error(data.message || "Failed to search users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  }, [searchTerm, filterDepartment]);

  useEffect(() => {
    if (isOpen) {
      searchUsers();
    }
  }, [isOpen, searchUsers]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSearchInput("");
      setSearchTerm("");
      setFilterDepartment("");
      setUsers([]);
      setSelectedUser(null);
      setAlumniForm({
        batch: "",
        passedYear: "",
        currentJobCompany: "",
        currentDesignation: "",
        isUnemployed: false,
        contactPhone: "",
      });
      setError("");
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setAlumniForm({
      batch: "",
      passedYear: "",
      currentJobCompany: "",
      currentDesignation: "",
      isUnemployed: false,
      contactPhone: user.phone || "",
    });
    setStep(2);
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async () => {
    if (!selectedUser) return;

    // Validation
    if (
      !alumniForm.isUnemployed &&
      (!alumniForm.currentJobCompany || !alumniForm.currentDesignation)
    ) {
      setError(
        "Please fill in company and designation, or mark as unemployed",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/secure/alumni/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: selectedUser._id,
          alumniInfo: alumniForm,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        if (onCreated) onCreated();
        onClose();
      } else {
        setError(data.message || "Failed to create alumni");
        toast.error(data.message || "Failed to create alumni");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create alumni");
      toast.error("Failed to create alumni");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#E7E3D8] flex items-center gap-2">
              <FaUserGraduate /> Create Alumni
            </h2>
            <p className="text-[#D3A16D] text-xs mt-0.5">
              {step === 1
                ? "Search and select a user to convert to alumni"
                : "Fill in the alumni information"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ==================== STEP 1: SEARCH & SELECT ==================== */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Search bar + Department filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <form
                  onSubmit={handleSearch}
                  className="flex gap-2 md:col-span-2"
                >
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by College ID, name, mobile..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors text-sm font-medium"
                  >
                    Search
                  </button>
                </form>

                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info banner */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex items-start gap-2">
                <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                <span>
                  Selecting a user will convert them to <strong>alumni</strong>{" "}
                  and <strong>deactivate</strong> their account. They will no
                  longer be able to log in.
                </span>
              </div>

              {/* User list */}
              {searching ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-[#994D35] text-3xl" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">👥</div>
                  <p className="text-gray-500 text-sm">
                    {searchTerm || filterDepartment
                      ? "No users found matching your search"
                      : "Search for a user above to begin"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {users.map((user) => {
                    const profilePic = user?.personalInfo?.profilePicture;
                    const initial = user.fullName?.[0]?.toUpperCase() || "?";

                    return (
                      <button
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-[#D3A16D] hover:bg-[#E7E3D8]/30 transition-all text-left"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3D444C] to-[#994D35] text-white font-bold border-2 border-[#D3A16D]/40">
                          {profilePic ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={profilePic}
                                alt={user.fullName}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            initial
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#3D444C] truncate">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {user.studentId}
                            </span>
                            <span className="text-[10px] bg-[#E7E3D8] text-[#3D444C] px-1.5 py-0.5 rounded font-medium">
                              {user.department}
                            </span>
                            {user.phone && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <FaPhone className="text-[8px]" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Select arrow */}
                        <div className="text-[#994D35] text-sm flex-shrink-0">
                          <FaUserCheck />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== STEP 2: ALUMNI INFO ==================== */}
          {step === 2 && selectedUser && (
            <div className="space-y-4">
              {/* Selected user preview */}
              <div className="bg-[#E7E3D8]/40 border border-[#D3A16D]/40 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3D444C] to-[#994D35] text-white font-bold text-2xl border-2 border-[#D3A16D]/40">
                  {selectedUser?.personalInfo?.profilePicture ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={selectedUser.personalInfo.profilePicture}
                        alt={selectedUser.fullName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    selectedUser.fullName?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#3D444C] text-lg truncate">
                    {selectedUser.fullName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {selectedUser.email}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded">
                      {selectedUser.studentId}
                    </span>
                    <span className="text-[10px] bg-white text-[#3D444C] px-1.5 py-0.5 rounded font-medium">
                      {selectedUser.department}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#994D35] hover:underline font-medium flex-shrink-0"
                >
                  Change
                </button>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                <span>
                  This user's account will be <strong>deactivated</strong> after
                  being converted to alumni. They will not be able to log in.
                </span>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaLayerGroup className="text-[#994D35]" /> Batch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 18"
                    value={alumniForm.batch}
                    onChange={(e) =>
                      setAlumniForm({ ...alumniForm, batch: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaGraduationCap className="text-[#994D35]" /> Passing Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={alumniForm.passedYear}
                    onChange={(e) =>
                      setAlumniForm({
                        ...alumniForm,
                        passedYear: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Unemployed checkbox */}
              <label className="flex items-center gap-3 p-3 bg-[#E7E3D8]/40 rounded-lg cursor-pointer hover:bg-[#E7E3D8]/60 transition-colors">
                <input
                  type="checkbox"
                  checked={alumniForm.isUnemployed}
                  onChange={(e) =>
                    setAlumniForm({
                      ...alumniForm,
                      isUnemployed: e.target.checked,
                      ...(e.target.checked
                        ? {
                            currentJobCompany: "",
                            currentDesignation: "",
                          }
                        : {}),
                    })
                  }
                  className="w-5 h-5 text-[#994D35] rounded focus:ring-[#D3A16D]"
                />
                <div>
                  <p className="font-semibold text-[#3D444C]">
                    Currently Unemployed
                  </p>
                  <p className="text-xs text-gray-500">
                    Check this if the alumni is not currently employed
                  </p>
                </div>
              </label>

              {/* Company + Designation (only if employed) */}
              {!alumniForm.isUnemployed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FaBuilding className="text-[#994D35]" /> Current Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pran RFL Group"
                      value={alumniForm.currentJobCompany}
                      onChange={(e) =>
                        setAlumniForm({
                          ...alumniForm,
                          currentJobCompany: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <FaBriefcase className="text-[#994D35]" /> Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Marketing Officer"
                      value={alumniForm.currentDesignation}
                      onChange={(e) =>
                        setAlumniForm({
                          ...alumniForm,
                          currentDesignation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Contact phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FaPhone className="text-[#994D35]" /> Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. +880 1XXX-XXXXXX"
                  value={alumniForm.contactPhone}
                  onChange={(e) =>
                    setAlumniForm({
                      ...alumniForm,
                      contactPhone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-start gap-2">
                  <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
          {step === 1 && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors text-sm font-medium disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Confirm & Create Alumni
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAlumniModal;