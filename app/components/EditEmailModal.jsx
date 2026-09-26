// app/components/EditEmailModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { FaTimes, FaEnvelope, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const EditEmailModal = ({ isOpen, onClose, currentEmail, userId }) => {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setNewEmail("");
      setConfirmEmail("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!newEmail || !confirmEmail) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (newEmail === currentEmail) {
      setError("New email is the same as current email");
      toast.error("New email is the same as current email");
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newEmail)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (newEmail !== confirmEmail) {
      setError("Emails do not match");
      toast.error("Emails do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users/update-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newEmail: newEmail.toLowerCase().trim(),
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        if (userId === user?.id) {
          toast.success(
            "Email updated successfully! You will be redirected to login.",
          );
          setTimeout(() => {
            window.location.href = "/login?emailChanged=true";
          }, 1500);
        } else {
          onClose();
          toast.success("Email updated successfully!");
        }
      } else {
        setError(data.message || "Failed to update email");
        toast.error(data.message || "Failed to update email");
      }
    } catch (error) {
      console.error("Update email error:", error);
      setError("Failed to update email. Please try again.");
      toast.error("Failed to update email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Change Email</h2>
            <p className="text-white/80 text-sm">Update your email address</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Current Email
            </label>
            <div className="bg-[#E7E3D8]/30 rounded-lg px-4 py-3 text-[#3D444C] font-medium">
              {currentEmail}
            </div>
          </div>

          <div>
            <label
              htmlFor="newEmail"
              className="block text-sm font-medium text-[#3D444C] mb-2"
            >
              New Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-[#D3A16D] text-sm" />
              </div>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                placeholder="Enter new email address"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmEmail"
              className="block text-sm font-medium text-[#3D444C] mb-2"
            >
              Confirm New Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-[#D3A16D] text-sm" />
              </div>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                placeholder="Confirm new email address"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {user?.id === userId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Changing your email will require you to login again with your
                new email address.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#994D35] text-white py-3 rounded-lg font-semibold hover:bg-[#3D444C] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <FaSpinner className="animate-spin" />
                <span>Updating Email...</span>
              </span>
            ) : (
              <>
                <span>Update Email</span>
                <FaCheckCircle className="text-sm" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEmailModal;
