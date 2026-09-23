// app/dashboard/events/AttendanceModal.jsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaTimes,
  FaSearch,
  FaSpinner,
  FaCheck,
  FaUserCheck,
  FaSave,
  FaUsers,
  FaInfoCircle,
  FaUserPlus,
  FaTrash,
  FaBuilding,
  FaCamera,
  FaBarcode,
  FaHistory,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const AVATAR_FALLBACK =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/default-avatar.png";

// Stable key for an external attendee (name + email or ID)
const extKey = (e) =>
  `${(e.name || "").trim().toLowerCase()}|${(
    e.email || e.identificationNo || ""
  )
    .trim()
    .toLowerCase()}`;

const AttendanceModal = ({ event, onClose, onSaved }) => {
  const [users, setUsers] = useState([]);
  const [preRegistered, setPreRegistered] = useState([]);
  const [externalPreReg, setExternalPreReg] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [initialIds, setInitialIds] = useState([]);

  // External attendees state
  const [externalAttendees, setExternalAttendees] = useState([]);
  const [initialExternalKeys, setInitialExternalKeys] = useState([]);

  // Mode: show pre-registered only vs all members
  const [showAllUsers, setShowAllUsers] = useState(
    !event.preRegistrationRequired,
  );

  // Manual external add form
  const [showExternalForm, setShowExternalForm] = useState(false);
  const [externalForm, setExternalForm] = useState({
    name: "",
    email: "",
    institution: "",
    identificationNo: "",
  });

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const selectedIdsRef = useRef(selectedIds);

  // Keep a ref in sync so scanner callback sees latest selection
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  // ============ FETCH ============
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/secure/events/attendance?eventId=${event._id}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);

        // Pre-registered members
        const preRegIds = (data.event.preRegistrationUsers || [])
          .filter((u) => u.userId)
          .map((u) => u.userId.toString());
        setPreRegistered(preRegIds);

        // Pre-registered externals
        const preRegExternal = (data.event.preRegistrationUsers || [])
          .filter((u) => !u.userId)
          .map((u) => ({
            name: u.name || "",
            email: u.email || "",
            institution: u.institution || "",
            identificationNo: u.identificationNo || "",
          }));
        setExternalPreReg(preRegExternal);

        // Existing member attendance
        const existingMembers = (data.event.eventAttendees || []).map((a) =>
          typeof a === "string" ? a : a._id?.toString(),
        );
        setSelectedIds(existingMembers.filter(Boolean));
        setInitialIds(existingMembers.filter(Boolean));

        // Existing external attendees
        const existingExternal = (data.event.externalAttendees || []).map(
          (e) => ({
            name: e.name,
            email: e.email || "",
            institution: e.institution || "",
            identificationNo: e.identificationNo || "",
            addedAt: e.addedAt,
          }),
        );
        setExternalAttendees(existingExternal);
        setInitialExternalKeys(existingExternal.map(extKey));
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

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ============ MEMBER TOGGLE ============
  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ============ EXTERNAL ATTENDEE HELPERS ============
  const isExternalSelected = (ext) =>
    externalAttendees.some((a) => extKey(a) === extKey(ext));

  const toggleExternal = (ext) => {
    setExternalAttendees((prev) => {
      const exists = prev.some((a) => extKey(a) === extKey(ext));
      if (exists) {
        return prev.filter((a) => extKey(a) !== extKey(ext));
      }
      return [...prev, { ...ext, addedAt: new Date() }];
    });
  };

  const addCustomExternalUser = () => {
    // ⚠️ If pre-registration required, block manual external entries
    if (event.preRegistrationRequired) {
      return toast.error(
        "Pre-registration was required. Only pre-registered externals can be marked.",
      );
    }
    if (!externalForm.name.trim()) {
      return toast.error("Name is required");
    }
    const newExt = {
      name: externalForm.name.trim(),
      email: externalForm.email.trim(),
      institution: externalForm.institution.trim(),
      identificationNo: externalForm.identificationNo.trim(),
      addedAt: new Date(),
    };
    if (isExternalSelected(newExt)) {
      return toast.error("This external attendee is already added");
    }
    setExternalAttendees((prev) => [...prev, newExt]);
    setExternalForm({
      name: "",
      email: "",
      institution: "",
      identificationNo: "",
    });
    setShowExternalForm(false);
  };

  const removeExternalUser = (index) => {
    setExternalAttendees((prev) => prev.filter((_, i) => i !== index));
  };

  // ============ FILTERS ============
  const visibleUsers = showAllUsers
    ? users
    : users.filter((u) => preRegistered.includes(u._id.toString()));

  const filteredUsers = visibleUsers.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.studentId?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  const filteredExternals = externalPreReg.filter((e) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      e.name?.toLowerCase().includes(term) ||
      e.institution?.toLowerCase().includes(term) ||
      e.email?.toLowerCase().includes(term) ||
      e.identificationNo?.toLowerCase().includes(term)
    );
  });

  const preRegKeys = new Set(externalPreReg.map(extKey));
  const manualExternalAttendees = externalAttendees.filter(
    (a) => !preRegKeys.has(extKey(a)),
  );

  // ============ BARCODE SCANNER ============
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch (e) {
      // silent
    }
  };

  const startScanning = useCallback(async () => {
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      html5QrCodeRef.current = new Html5Qrcode("event-attendance-scanner");

      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.AZTEC,
        ],
      };

      const onSuccess = (decodedText) => {
        if (isScanningRef.current) return;
        isScanningRef.current = true;
        setIsScanning(true);
        playBeep();

        const scanned = decodedText.trim();

        // Match against eligible users (respect current mode)
        const matched = visibleUsers.find(
          (u) =>
            u.studentId === scanned ||
            u.email?.toLowerCase() === scanned.toLowerCase() ||
            u.fullName?.toLowerCase() === scanned.toLowerCase(),
        );

        if (matched) {
          const id = matched._id.toString();
          if (!selectedIdsRef.current.includes(id)) {
            setSelectedIds((prev) => [...prev, id]);
            toast.success(`${matched.fullName} marked present ✓`);
          } else {
            toast(`${matched.fullName} is already marked`, { icon: "ℹ️" });
          }
        } else {
          toast.error(`No eligible member found for "${scanned}"`);
        }

        setTimeout(() => {
          setIsScanning(false);
          isScanningRef.current = false;
        }, 800);
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        onSuccess,
        () => {},
      );
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Could not start scanner. Check camera permissions.");
      setShowScanner(false);
    }
  }, [visibleUsers]);

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (showScanner) {
      setTimeout(() => startScanning(), 400);
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [showScanner, startScanning, stopScanning]);

  // ============ SAVE ============
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/secure/events/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          attendeeIds: selectedIds,
          externalAttendees: externalAttendees,
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
      toast.error("Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyMarkedCount = selectedIds.filter((id) =>
    initialIds.includes(id),
  ).length;
  const newlySelectedCount = selectedIds.length - alreadyMarkedCount;
  const totalMarked = selectedIds.length + externalAttendees.length;

  return (
    <div className="fixed inset-0 z-[100] bg-[#E7E3D8] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#3D444C] text-[#E7E3D8] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#D3A16D] flex items-center justify-center shrink-0">
              <FaUserCheck className="text-[#3D444C]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                Mark Attendance
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

      {/* Info Banner */}
      {event.preRegistrationRequired && (
        <div className="bg-blue-50 border-b border-blue-200 py-2 px-4 text-sm text-blue-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
            <FaInfoCircle className="shrink-0" />
            <span>
              Pre-registration was required. Only pre-registered participants
              can be marked.{" "}
              {showAllUsers ? (
                <button
                  onClick={() => setShowAllUsers(false)}
                  className="underline font-semibold hover:text-blue-900"
                >
                  Show pre-registered members only
                </button>
              ) : (
                <button
                  onClick={() => setShowAllUsers(true)}
                  className="underline font-semibold hover:text-blue-900"
                >
                  Show all members
                </button>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="sticky top-[72px] z-10 bg-[#E7E3D8] border-b border-[#3D444C]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or institution..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
          </div>

          {/* Scan button */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors font-medium text-sm"
          >
            <FaCamera /> Scan ID
          </button>

          {/* Add external — only if pre-registration NOT required */}
          {!event.preRegistrationRequired && (
            <button
              onClick={() => setShowExternalForm(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <FaUserPlus /> Add External
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Stats */}
        <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-2 text-[#3D444C]/70">
                <FaUsers className="text-[#D3A16D]" />
                <span className="font-semibold text-[#3D444C]">
                  {visibleUsers.length}
                </span>
                eligible members
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaHistory />
                <span className="font-semibold">{alreadyMarkedCount}</span>
                previously marked
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-[#3D444C]">
                <FaCheck className="text-[#D3A16D]" />
                <span className="font-semibold">{newlySelectedCount}</span>
                newly selected
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-purple-600">
                <FaBuilding />
                <span className="font-semibold">
                  {externalAttendees.length}
                </span>
                external
              </span>
            </div>
            {(selectedIds.length > 0 || externalAttendees.length > 0) && (
              <button
                onClick={() => {
                  setSelectedIds([]);
                  setExternalAttendees([]);
                }}
                className="text-sm text-[#994D35] hover:text-[#3D444C] font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 pt-3 border-t border-[#3D444C]/10 flex flex-wrap gap-4 text-xs text-[#3D444C]/70">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#3D444C] border-2 border-[#3D444C]"></div>
              Newly selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-600"></div>
              Already marked
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500 border-2 border-purple-600"></div>
              External
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-[#3D444C]/20"></div>
              Not selected
            </div>
          </div>
        </div>

        {/* ==================== PRE-REGISTERED EXTERNALS ==================== */}
        {externalPreReg.length > 0 && (
          <div className="bg-white rounded-2xl border border-purple-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold text-[#3D444C] flex items-center gap-2">
                <FaBuilding className="text-purple-600" /> Pre-Registered
                Externals
                <span className="text-[#3D444C]/50 font-normal">
                  (click each to mark attendance)
                </span>
              </h3>
              <span className="text-xs text-[#3D444C]/60">
                {externalAttendees.filter((a) => preRegKeys.has(extKey(a)))
                  .length}{" "}
                / {externalPreReg.length} selected
              </span>
            </div>

            {filteredExternals.length === 0 ? (
              <p className="text-sm text-[#3D444C]/50 italic py-4 text-center">
                No pre-registered externals match your search
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredExternals.map((ext, i) => {
                  const isSelected = isExternalSelected(ext);
                  const wasSelected = initialExternalKeys.includes(
                    extKey(ext),
                  );
                  return (
                    <button
                      key={`${extKey(ext)}-${i}`}
                      onClick={() => toggleExternal(ext)}
                      className={`text-left p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 relative ${
                        isSelected && wasSelected
                          ? "bg-green-500 text-white border-green-600 shadow-md"
                          : isSelected
                            ? "bg-purple-600 text-white border-purple-700 shadow-md"
                            : "bg-purple-50/50 text-[#3D444C] border-purple-200 hover:border-purple-400 hover:shadow-sm"
                      }`}
                    >
                      {wasSelected && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-white/30 text-[8px] font-bold">
                          MARKED
                        </span>
                      )}
                      <div className="relative shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                            isSelected
                              ? "bg-white/20 border-white/50 text-white"
                              : "bg-purple-500 border-purple-600 text-white"
                          }`}
                        >
                          {ext.name?.[0]?.toUpperCase() || "?"}
                        </div>
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
                        <p
                          className={`font-semibold text-sm truncate ${
                            isSelected ? "text-white" : "text-[#3D444C]"
                          }`}
                        >
                          {ext.name}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isSelected ? "text-white/80" : "text-[#3D444C]/60"
                          }`}
                        >
                          {ext.institution || "External"}
                        </p>
                        {ext.identificationNo && (
                          <p
                            className={`text-[10px] truncate ${
                              isSelected
                                ? "text-white/60"
                                : "text-[#3D444C]/40"
                            }`}
                          >
                            ID: {ext.identificationNo}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================== MANUAL EXTERNALS ==================== */}
        {manualExternalAttendees.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
              <FaUserPlus className="text-purple-600" /> Manually Added
              Externals ({manualExternalAttendees.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {manualExternalAttendees.map((e, i) => {
                const actualIndex = externalAttendees.findIndex(
                  (a) => extKey(a) === extKey(e),
                );
                return (
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
                        {e.institution ||
                          e.email ||
                          e.identificationNo ||
                          "External"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeExternalUser(actualIndex)}
                      className="text-[#994D35] hover:text-red-700 p-1"
                    >
                      <FaTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== MEMBERS ==================== */}
        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-4xl text-[#3D444C]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#3D444C]/10">
            <FaUsers className="text-4xl text-[#3D444C]/30 mx-auto mb-3" />
            <p className="text-[#3D444C]/60">
              {showAllUsers ? "No users found" : "No pre-registered members"}
            </p>
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
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-white/25 text-[8px] font-bold flex items-center gap-1">
                      <FaHistory className="text-[8px]" /> PRE
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
                    {u.department && (
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? "text-white/70" : "text-[#3D444C]/50"
                        }`}
                      >
                        {u.department}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* External User Form Modal */}
      {showExternalForm && !event.preRegistrationRequired && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#3D444C] mb-4 flex items-center gap-2">
              <FaUserPlus className="text-purple-600" /> Add External Attendee
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
                placeholder="Institution (e.g., BRAC University)"
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
                placeholder="Email (optional)"
                value={externalForm.email}
                onChange={(e) =>
                  setExternalForm({ ...externalForm, email: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C]"
              />
              <input
                type="text"
                placeholder="Identification No. (optional)"
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
                onClick={addCustomExternalUser}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCANNER MODAL ==================== */}
      {showScanner && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#3D444C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-[#E7E3D8] font-bold flex items-center gap-2">
                <FaBarcode className="text-[#D3A16D]" /> Scan ID Barcode
              </h3>
              <button
                onClick={() => setShowScanner(false)}
                className="p-2 text-[#E7E3D8] hover:bg-white/10 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="relative bg-black aspect-square">
              <div id="event-attendance-scanner" className="w-full h-full" />
              {isScanning && (
                <div className="absolute inset-0 bg-[#994D35]/30 flex items-center justify-center">
                  <div className="bg-white rounded-lg px-4 py-2 text-[#3D444C] font-bold shadow-lg animate-pulse">
                    Scanned!
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 text-center">
              <p className="text-[#E7E3D8]/80 text-sm">
                Point the camera at the barcode on the ID card
              </p>
              <p className="text-[#D3A16D] text-xs mt-1">
                {event.preRegistrationRequired
                  ? "Only pre-registered members will be marked"
                  : "Eligible members will be marked present automatically"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#3D444C] border-t border-[#D3A16D]/30 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-[#E7E3D8] text-sm">
            <span className="font-bold text-[#D3A16D]">{totalMarked}</span>{" "}
            total marked
            {externalAttendees.length > 0 && (
              <span className="text-[#E7E3D8]/60 text-xs ml-2">
                ({selectedIds.length} members + {externalAttendees.length}{" "}
                externals)
              </span>
            )}
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
                  <FaSave /> Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;