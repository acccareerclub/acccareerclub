// app/dashboard/sessions/SessionAttendance.jsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaTimes, FaSearch, FaCamera, FaSpinner, FaCheck,
  FaUserCheck, FaBarcode, FaUsers, FaSave, FaCheckCircle,
  FaHistory,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const AVATAR_FALLBACK =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/default-avatar.png";

const SessionAttendance = ({ session, onClose, onSaved }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  // ✅ Track the original attendees fetched on mount
  const [initialAttendees, setInitialAttendees] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);

  // ---------- Fetch Users ----------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/secure/sessions/session-attendance", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        // Pre-select users already marked in this session
        if (session?.sessionAttendees?.length > 0) {
          const attendeeIds = session.sessionAttendees.map((id) =>
            id.toString()
          );
          setSelectedIds(attendeeIds);
          // ✅ Save the initial attendees for comparison later
          setInitialAttendees(attendeeIds);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ---------- Toggle Selection ----------
  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // ---------- Filtered Users ----------
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

  // ---------- Play Beep Sound ----------
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

  // ---------- Start Scanning ----------
  const startScanning = useCallback(async () => {
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      html5QrCodeRef.current = new Html5Qrcode("attendance-scanner");

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
        const matched = users.find(
          (u) =>
            u.studentId === scanned ||
            u.email?.toLowerCase() === scanned.toLowerCase() ||
            u.fullName?.toLowerCase() === scanned.toLowerCase()
        );

        if (matched) {
          const id = matched._id.toString();
          if (!selectedIds.includes(id)) {
            setSelectedIds((prev) => [...prev, id]);
            toast.success(`${matched.fullName} marked present ✓`);
          } else {
            toast(`${matched.fullName} is already marked`, { icon: "ℹ️" });
          }
        } else {
          toast.error(`No user found for "${scanned}"`);
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
        () => {}
      );
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Could not start scanner. Check camera permissions.");
      setShowScanner(false);
    }
  }, [users, selectedIds]);

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

  // ---------- Save Attendance ----------
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/secure/sessions/session-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session._id,
          attendeeIds: selectedIds,
          markAsAttended: true,
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

  // ✅ Counts for display
  const alreadyMarkedCount = selectedIds.filter((id) =>
    initialAttendees.includes(id)
  ).length;
  const newlySelectedCount = selectedIds.length - alreadyMarkedCount;

  return (
    <div className="fixed inset-0 z-[100] bg-[#E7E3D8] overflow-y-auto">
      {/* ============== HEADER ============== */}
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
                {session.sessionTitle}
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

      {/* ============== TOOLBAR ============== */}
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
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors font-medium text-sm"
          >
            <FaCamera /> Scan ID Card
          </button>
        </div>
      </div>

      {/* ============== BODY ============== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Stats + Legend */}
        <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-2 text-[#3D444C]/70">
                <FaUsers className="text-[#D3A16D]" />
                <span className="font-semibold text-[#3D444C]">
                  {users.length}
                </span>
                eligible
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaHistory />
                <span className="font-semibold">{alreadyMarkedCount}</span>
                already marked
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-[#3D444C]">
                <FaCheckCircle className="text-[#D3A16D]" />
                <span className="font-semibold">{newlySelectedCount}</span>
                newly selected
              </span>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-[#994D35] hover:text-[#3D444C] font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* ✅ Color Legend */}
          <div className="mt-3 pt-3 border-t border-[#3D444C]/10 flex flex-wrap gap-4 text-xs text-[#3D444C]/70">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#3D444C] border-2 border-[#3D444C]"></div>
              Newly selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-600"></div>
              Already in attendance
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-[#3D444C]/20"></div>
              Not selected
            </div>
          </div>
        </div>

        {/* Users List */}
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
              // ✅ Check if user was already marked BEFORE this session
              const wasAlreadyMarked = initialAttendees.includes(idStr);

              return (
                <button
                  key={u._id}
                  onClick={() => toggleUser(idStr)}
                  className={`text-left p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 relative ${
                    isSelected && wasAlreadyMarked
                      ? // 🟢 Already marked previously — GREEN
                        "bg-green-500 text-white border-green-600 shadow-md"
                      : isSelected
                        ? // ⚫ Newly selected in this session — SLATE
                          "bg-[#3D444C] text-[#E7E3D8] border-[#3D444C] shadow-md"
                        : // ⚪ Not selected — WHITE
                          "bg-white text-[#3D444C] border-[#3D444C]/10 hover:border-[#D3A16D] hover:shadow-sm"
                  }`}
                >
                  {/* Small badge for pre-existing attendance */}
                  {wasAlreadyMarked && (
                    <span className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/25 text-[8px] font-bold tracking-wide">
                      <FaHistory className="text-[8px]" /> PRE
                    </span>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${
                        isSelected && wasAlreadyMarked
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
                          wasAlreadyMarked ? "bg-white" : "bg-[#D3A16D]"
                        }`}
                      >
                        <FaCheck
                          className={`text-[10px] ${
                            wasAlreadyMarked ? "text-green-600" : "text-[#3D444C]"
                          }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
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
                        isSelected
                          ? "text-white/80"
                          : "text-[#3D444C]/60"
                      }`}
                    >
                      ID: {u.studentId || "N/A"}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isSelected
                          ? "text-white/70"
                          : "text-[#3D444C]/50"
                      }`}
                    >
                      {u.department || "N/A"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ============== STICKY FOOTER ============== */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#3D444C] border-t border-[#D3A16D]/30 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-[#E7E3D8] text-sm flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-bold text-[#D3A16D]">
                {selectedIds.length}
              </span>{" "}
              total selected
            </span>
            {initialAttendees.length > 0 && (
              <>
                <span className="hidden sm:inline text-[#E7E3D8]/30">|</span>
                <span className="text-green-400">
                  {alreadyMarkedCount} previously marked
                </span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E7E3D8]/30 text-[#E7E3D8] rounded-lg hover:bg-white/10 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#D3A16D] text-[#3D444C] rounded-lg hover:bg-[#994D35] hover:text-white transition-colors font-bold text-sm disabled:opacity-60 flex items-center gap-2"
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

      {/* ============== SCANNER MODAL ============== */}
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
              <div id="attendance-scanner" className="w-full h-full" />
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
                Users will be automatically marked present
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionAttendance;