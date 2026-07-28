// app/components/ChangePasswordModal.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaEye, FaEyeSlash, FaKey, FaEnvelope, FaIdCard, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ChangePasswordModal = ({ isOpen, onClose, userEmail, userId }) => {
  const [step, setStep] = useState(1); // 1: College ID/Email, 2: OTP Verification, 3: New Password
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [userFullEmail, setUserFullEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep(1);
    setCollegeId('');
    setEmail('');
    setMaskedEmail('');
    setUserFullEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsLoading(false);
    setError('');
    setOtpTimer(0);
    setCanResend(false);
  };

  // Handle sending OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const identifier = collegeId.trim() || email.trim();
    
    if (!identifier) {
      setError('Please enter your College ID or Email');
      toast.error('Please enter your College ID or Email');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          collegeId: identifier,
          userId: userId 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMaskedEmail(data.maskedEmail);
        setUserFullEmail(data.email);
        setStep(2);
        setOtpTimer(120);
        setCanResend(false);
        toast.success('OTP sent to your email!');
      } else {
        setError(data.message || 'Failed to send OTP');
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      toast.error('Please enter a valid 6-digit OTP');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userFullEmail, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
        toast.success('OTP verified successfully!');
      } else {
        setError(data.message || 'Invalid OTP');
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError('Failed to verify OTP. Please try again.');
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userFullEmail, 
          newPassword, 
          confirmPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully!');
        onClose();
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.message || 'Failed to change password');
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to change password. Please try again.');
      toast.error('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          collegeId: collegeId.trim() || email.trim(),
          userId: userId 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpTimer(120);
        setCanResend(false);
        toast.success('OTP resent successfully!');
      } else {
        setError(data.message || 'Failed to resend OTP');
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-4 rounded-t-2xl flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Change Password</h2>
            <p className="text-white/80 text-sm">
              {step === 1 && "Verify your identity"}
              {step === 2 && "Enter the verification code"}
              {step === 3 && "Set your new password"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Step 1: College ID or Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-[#3D444C] mb-2"
                >
                  College ID or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-[#D3A16D] text-sm" />
                  </div>
                  <input
                    type="text"
                    id="identifier"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                    placeholder="Enter your College ID or Email"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enter the College ID or Email associated with your account
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#994D35] text-white py-3 rounded-lg font-semibold hover:bg-[#3D444C] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending OTP...</span>
                  </span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <FaEnvelope className="text-sm" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="bg-[#E7E3D8]/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-[#3D444C] text-center">
                  We've sent a verification code to:
                </p>
                <p className="text-center font-semibold text-[#994D35] mt-1">
                  {maskedEmail}
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-[#3D444C] mb-2"
                >
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-[#D3A16D] text-sm" />
                  </div>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    canResend && !isLoading
                      ? 'text-[#994D35] hover:text-[#D3A16D] cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {otpTimer > 0 
                    ? `Resend in ${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}`
                    : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#994D35] text-white py-3 rounded-lg font-semibold hover:bg-[#3D444C] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <FaCheckCircle className="text-sm" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#3D444C] mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-[#D3A16D] text-sm" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-gray-500 pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                    placeholder="Enter new password (min 8 characters)"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3D444C]/50 hover:text-[#3D444C] transition-colors duration-200"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#3D444C] mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaKey className="text-[#D3A16D] text-sm" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-gray-500 pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                    placeholder="Confirm your new password"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3D444C]/50 hover:text-[#3D444C] transition-colors duration-200"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#994D35] text-white py-3 rounded-lg font-semibold hover:bg-[#3D444C] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Changing Password...</span>
                  </span>
                ) : (
                  <>
                    <span>Change Password</span>
                    <FaCheckCircle className="text-sm" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;