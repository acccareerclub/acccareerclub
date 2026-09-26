// app/settings/[userId]/SettingsClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaBell,
  FaBriefcase,
  FaNewspaper,
  FaSave,
  FaSpinner,
  FaUserCircle,
  FaEnvelope,
  FaIdCard,
  FaGraduationCap,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import Link from "next/link";

const SettingsClient = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId;
  const { user: authUser, loading: authLoading } = useAuth();

  const [settings, setSettings] = useState({
    noticeMail: true,
    jobMail: true,
    newsletterMail: true,
  });
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Check if user owns this settings page
  useEffect(() => {
    if (!authLoading && authUser) {
      if (authUser.id !== userId) {
        toast.error("You don't have permission to view this page");
        router.push("/");
      }
    }
  }, [authUser, authLoading, userId, router]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/users/settings", {
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setSettings({
            noticeMail: data.data.noticeMail,
            jobMail: data.data.jobMail,
            newsletterMail: data.data.newsletterMail,
          });
          setUserInfo(data.data);
        } else {
          setError(data.message || "Failed to load settings");
          toast.error(data.message || "Failed to load settings");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setError("Failed to load settings. Please try again.");
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    if (authUser && !authLoading) {
      fetchSettings();
    }
  }, [authUser, authLoading]);

  // Handle toggle change
  const handleToggle = (settingName) => {
    setSettings((prev) => ({
      ...prev,
      [settingName]: !prev[settingName],
    }));
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          settings: {
            noticeMail: settings.noticeMail,
            jobMail: settings.jobMail,
            newsletterMail: settings.newsletterMail,
          },
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Settings saved successfully!");
        // Update the user context with new settings
        if (authUser) {
          // You might want to update the auth context here
        }
      } else {
        setError(data.message || "Failed to save settings");
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings. Please try again.");
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (authUser && authUser.id !== userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to view these settings.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#994D35] text-white px-6 py-3 rounded-lg hover:bg-[#3D444C] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#994D35] text-white px-6 py-3 rounded-lg hover:bg-[#3D444C] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/profile/${userId}`}
            className="p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FaArrowLeft className="text-[#3D444C] text-xl" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your account preferences and notifications
            </p>
          </div>
        </div>

        {/* User Info Card */}
        {userInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#3D444C] to-[#994D35] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {userInfo.fullName?.charAt(0) || (
                  <FaUserCircle className="text-3xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[#3D444C] truncate">
                  {userInfo.fullName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <FaEnvelope className="text-[#D3A16D]" />
                    <span className="truncate">{userInfo.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FaIdCard className="text-[#D3A16D]" />
                    <span>{userInfo.studentId}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FaGraduationCap className="text-[#D3A16D]" />
                    <span className="capitalize">{userInfo.role}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#3D444C] to-[#994D35]">
            <h2 className="text-xl font-bold text-white">Email Preferences</h2>
            <p className="text-white/80 text-sm">
              Choose which emails you want to receive
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Notice Mail */}
            {/* Notice Mail */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-200 ${
                settings.noticeMail
                  ? "bg-[#D3A16D]/15 hover:bg-[#D3A16D]/25"
                  : "bg-[#E7E3D8]/20 hover:bg-[#E7E3D8]/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D3A16D]/20 flex items-center justify-center flex-shrink-0">
                  <FaBell className="text-[#994D35] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D444C]">Notice Mail</h3>
                  <p className="text-sm text-gray-600">
                    Receive important notices and announcements
                  </p>
                </div>
              </div>
              <IconToggle
                checked={settings.noticeMail}
                onChange={() => handleToggle("noticeMail")}
                disabled={saving}
              />
            </div>

            {/* Job Mail */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-200 ${
                settings.jobMail
                  ? "bg-[#D3A16D]/15 hover:bg-[#D3A16D]/25"
                  : "bg-[#E7E3D8]/20 hover:bg-[#E7E3D8]/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D3A16D]/20 flex items-center justify-center flex-shrink-0">
                  <FaBriefcase className="text-[#994D35] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D444C]">Job Mail</h3>
                  <p className="text-sm text-gray-600">
                    Get job opportunities and career updates
                  </p>
                </div>
              </div>
              <IconToggle
                checked={settings.jobMail}
                onChange={() => handleToggle("jobMail")}
                disabled={saving}
              />
            </div>

            {/* Newsletter Mail */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl transition-colors duration-200 ${
                settings.newsletterMail
                  ? "bg-[#D3A16D]/15 hover:bg-[#D3A16D]/25"
                  : "bg-[#E7E3D8]/20 hover:bg-[#E7E3D8]/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D3A16D]/20 flex items-center justify-center flex-shrink-0">
                  <FaNewspaper className="text-[#994D35] text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3D444C]">Articles</h3>
                  <p className="text-sm text-gray-600">
                    Stay updated with our articles
                  </p>
                </div>
              </div>
              <IconToggle
                checked={settings.newsletterMail}
                onChange={() => handleToggle("newsletterMail")}
                disabled={saving}
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#994D35] text-white py-3 rounded-xl font-semibold hover:bg-[#3D444C] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-[#D3A16D]/10 rounded-xl p-4 border border-[#D3A16D]/20">
          <div className="flex items-start gap-3">
            <div className="text-[#994D35] text-xl">💡</div>
            <div>
              <p className="text-sm text-[#3D444C]">
                <strong>Note:</strong> Changes to your email preferences will be
                applied immediately. You can change these settings at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon-based Toggle Switch using react-icons/fa
const IconToggle = ({ checked, onChange, disabled }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      aria-label={checked ? "Disable" : "Enable"}
      className={`
        text-4xl transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#D3A16D] focus:ring-offset-2 rounded-full
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:scale-110"
        }
      `}
    >
      {checked ? (
        <FaToggleOn className="text-[#994D35]" />
      ) : (
        <FaToggleOff className="text-gray-400" />
      )}
    </button>
  );
};

export default SettingsClient;
