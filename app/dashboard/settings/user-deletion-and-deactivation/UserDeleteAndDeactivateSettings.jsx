// app/dashboard/settings/user-deletion-and-deactivation/UserDeletionClient.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import DashboardMenu from "@/app/components/layout/DashboardMenu";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaUserCircle,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEnvelope,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";

const ALLOWED_ROLES = [
  "prefect",
  "itsecretary",
  "modarator",
  "assistant_prefect",
];

// ---------- Reusable avatar ----------
// Renders the profile picture if present, otherwise a large user icon.
const UserAvatar = ({ src, alt = "User", size = 44, className = "" }) => {
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

const UserDeleteAndDeactivateSettings = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // ---- Search ----
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // ---- Action flow ----
  const [action, setAction] = useState(null); // "delete" | "activate" | "deactivate"
  const [reason, setReason] = useState("");
  const [stage, setStage] = useState("idle"); // idle | otp-sent
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const searchAbortRef = useRef(null);

  // ---------- Auth guard ----------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
    if (!authLoading && isAuthenticated) {
      if (!ALLOWED_ROLES.includes(authUser?.role)) router.push("/");
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  // ---------- Debounced search ----------
  const runSearch = useCallback(async (q) => {
    if (searchAbortRef.current) searchAbortRef.current.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/secure/account-deactive-delete?q=${encodeURIComponent(q.trim())}`,
        { credentials: "include", signal: controller.signal },
      );
      const data = await res.json();
      if (controller.signal.aborted) return;
      if (data.success) {
        setResults(data.users || []);
      } else {
        toast.error(data.message || "Search failed");
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      toast.error("Search failed");
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 350);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  // ---------- Reset ----------
  const resetAction = () => {
    setAction(null);
    setReason("");
    setStage("idle");
    setOtp("");
    setMaskedEmail("");
  };

  const pickUser = (u) => {
    setSelectedUser(u);
    resetAction();
  };

  const clearAll = () => {
    setSelectedUser(null);
    setQuery("");
    setResults([]);
    resetAction();
  };

  // ---------- Send OTP ----------
  const handleSendOtp = async (chosenAction) => {
    if (!selectedUser) return;
    if (chosenAction === "delete") {
      const ok = window.confirm(
        `You are about to DELETE "${selectedUser.fullName}". This is permanent. Continue to OTP verification?`,
      );
      if (!ok) return;
    }

    setSendingOtp(true);
    setAction(chosenAction);
    try {
      const res = await fetch("/api/secure/account-deactive-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: chosenAction,
          targetUserId: selectedUser._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`OTP sent to ${data.maskedEmail || "your email"}`);
        setMaskedEmail(data.maskedEmail || "");
        setStage("otp-sent");
      } else {
        toast.error(data.message || "Failed to send OTP");
        setAction(null);
      }
    } catch {
      toast.error("Failed to send OTP");
      setAction(null);
    } finally {
      setSendingOtp(false);
    }
  };

  // ---------- Verify & perform ----------
  const handleVerifyAndPerform = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error("Enter the OTP");
    if (!action) return toast.error("No action selected");

    setVerifying(true);
    try {
      const res = await fetch("/api/secure/account-deactive-delete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          targetUserId: selectedUser._id,
          otp: otp.trim(),
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Action completed");
        clearAll();
      } else {
        toast.error(data.message || "Failed to complete action");
      }
    } catch {
      toast.error("Failed to complete action");
    } finally {
      setVerifying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !ALLOWED_ROLES.includes(authUser?.role)) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="mt-8 mb-6 flex items-start gap-4">
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="p-2.5 rounded-lg bg-white shadow hover:bg-[#E7E3D8] transition-colors text-[#3D444C] shrink-0"
            title="Back to settings"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3D444C]">
              User Deletion & Deactivation
            </h1>
            <p className="text-sm text-[#3D444C]/60 mt-1">
              Search for a user, then choose an action. A one-time code will be
              sent to your email before anything happens.
            </p>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mb-6 rounded-2xl bg-[#FEF3C7] border border-[#FCD34D] p-4 flex items-start gap-3">
          <FaExclamationTriangle className="text-[#92400E] mt-0.5 shrink-0" />
          <div className="text-sm text-[#856404] leading-relaxed">
            <strong className="text-[#92400E]">Careful.</strong> Deletion is
            permanent and cannot be undone. Every action requires OTP
            verification sent to <strong>your own email</strong>, so no
            accidental or rapid-fire changes.
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <label className="block text-sm font-bold text-[#3D444C] mb-2">
            Search user
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type name, email, student ID, membership ID, or phone…"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
            {searching && (
              <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
            )}
          </div>

          {/* Results */}
          {results.length > 0 && !selectedUser && (
            <div className="mt-4 border-t border-gray-100 pt-4 max-h-80 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">
                {results.length} match{results.length !== 1 ? "es" : ""} —
                click to select
              </p>
              <div className="space-y-2">
                {results.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => pickUser(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#D3A16D] hover:bg-[#FAF8F3] text-left transition-colors"
                  >
                    <UserAvatar
                      src={u.profilePicture}
                      alt={u.fullName}
                      size={44}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[#3D444C] truncate">
                          {u.fullName}
                        </p>
                        {u.membershipId && (
                          <span className="font-mono text-[10px] bg-[#D3A16D]/20 text-[#994D35] border border-[#D3A16D]/40 px-1.5 py-0.5 rounded font-bold">
                            {u.membershipId}
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            u.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600 capitalize">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {u.email} · {u.studentId}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length >= 2 &&
            !searching &&
            results.length === 0 &&
            !selectedUser && (
              <p className="text-sm text-gray-400 text-center py-6">
                No users found matching "{query}"
              </p>
            )}
        </div>

        {/* Selected user + action panel */}
        {selectedUser && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Selected user info */}
            <div className="p-5 border-b border-gray-100 flex items-center gap-4">
              <UserAvatar
                src={selectedUser.profilePicture}
                alt={selectedUser.fullName}
                size={64}
                className="ring-2 ring-[#D3A16D]/40"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[#3D444C] text-lg truncate">
                    {selectedUser.fullName}
                  </h3>
                  {selectedUser.membershipId && (
                    <span className="font-mono text-[11px] bg-[#D3A16D]/20 text-[#994D35] border border-[#D3A16D]/40 px-2 py-0.5 rounded font-bold tracking-wider">
                      {selectedUser.membershipId}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#3D444C]/70 truncate">
                  {selectedUser.email} · {selectedUser.studentId}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      selectedUser.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600 capitalize">
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={clearAll}
                className="text-sm text-[#994D35] hover:text-[#3D444C] font-medium shrink-0"
              >
                Change
              </button>
            </div>

            {/* Action choice */}
            {stage === "idle" && (
              <div className="p-5">
                <h4 className="text-sm font-bold text-[#3D444C] mb-3">
                  Choose an action
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Deactivate / Activate toggle button */}
                  {selectedUser.isActive ? (
                    <button
                      onClick={() => handleSendOtp("deactivate")}
                      disabled={sendingOtp}
                      className="p-4 rounded-xl border-2 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FaToggleOff className="text-orange-600" />
                        <span className="font-bold text-orange-800 text-sm">
                          Deactivate
                        </span>
                      </div>
                      <p className="text-xs text-orange-700/80">
                        Freeze the account. Reversible later.
                      </p>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendOtp("activate")}
                      disabled={sendingOtp}
                      className="p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-left disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FaToggleOn className="text-green-600" />
                        <span className="font-bold text-green-800 text-sm">
                          Activate
                        </span>
                      </div>
                      <p className="text-xs text-green-700/80">
                        Restore access for this user.
                      </p>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleSendOtp("delete")}
                    disabled={sendingOtp}
                    className="p-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors text-left disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaTrash className="text-red-600" />
                      <span className="font-bold text-red-800 text-sm">
                        Delete
                      </span>
                    </div>
                    <p className="text-xs text-red-700/80">
                      Permanent. Cannot be undone.
                    </p>
                  </button>

                  {/* Info tile */}
                  <div className="p-4 rounded-xl bg-[#FAF8F3] border border-dashed border-[#3D444C]/15 flex items-start gap-2">
                    <FaInfoCircle className="text-[#994D35] text-sm mt-0.5 shrink-0" />
                    <p className="text-[11px] text-[#3D444C]/70 leading-relaxed">
                      Each action requires a one-time code (OTP) sent to{" "}
                      <strong>your email</strong>. Nothing happens until you
                      enter it.
                    </p>
                  </div>
                </div>

                {sendingOtp && (
                  <p className="text-xs text-[#3D444C]/60 mt-3 flex items-center gap-2">
                    <FaSpinner className="animate-spin" /> Sending OTP…
                  </p>
                )}
              </div>
            )}

            {/* OTP entry */}
            {stage === "otp-sent" && (
              <form onSubmit={handleVerifyAndPerform} className="p-5">
                <div className="flex items-start gap-3 mb-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <FaEnvelope className="text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold">OTP sent to your email</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Check <strong>{maskedEmail}</strong> for the 6-digit code.
                      It expires in 10 minutes.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {action === "delete" ? (
                      <FaTrash className="text-red-600" />
                    ) : action === "activate" ? (
                      <FaToggleOn className="text-green-600" />
                    ) : (
                      <FaToggleOff className="text-orange-600" />
                    )}
                    <span className="text-sm font-bold text-[#3D444C] capitalize">
                      {action} — {selectedUser.fullName}
                    </span>
                  </div>
                </div>

                <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 border-2 border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#994D35]"
                />

                {(action === "delete" || action === "deactivate") && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-[#3D444C] mb-2">
                      Reason (optional — will be emailed to the user)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows="3"
                      placeholder="Explain briefly why…"
                      className="w-full px-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm resize-none"
                    />
                  </div>
                )}

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStage("idle");
                      setOtp("");
                    }}
                    className="flex-1 px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || otp.length !== 6}
                    className={`flex-1 px-5 py-3 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      action === "delete"
                        ? "bg-red-600 hover:bg-red-700"
                        : action === "activate"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-orange-600 hover:bg-orange-700"
                    }`}
                  >
                    {verifying ? (
                      <>
                        <FaSpinner className="animate-spin" /> Verifying…
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Confirm {action}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDeleteAndDeactivateSettings;