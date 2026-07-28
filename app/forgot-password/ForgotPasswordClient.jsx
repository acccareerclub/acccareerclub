// app/forgot-password/ForgotPasswordClient.jsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaEnvelope, FaIdCard, FaKey, FaCheckCircle, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Logo from '../assets/logo/Careerclublogo.png';

const ForgotPasswordContent = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // If user is logged in, redirect to home
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // States for different steps
  const [step, setStep] = useState(1); // 1: College ID, 2: OTP Verification, 3: New Password
  const [collegeId, setCollegeId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  // Handle sending OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!collegeId.trim()) {
      setError('Please enter your College ID');
      toast.error('Please enter your College ID');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeId: collegeId.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setMaskedEmail(data.maskedEmail);
        setUserEmail(data.email);
        setStep(2);
        setOtpTimer(120); // 2 minutes countdown
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
      const response = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail, otp }),
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
      const response = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail, 
          newPassword, 
          confirmPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to reset password. Please try again.');
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collegeId: collegeId.trim() }),
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

  // If loading or user is logged in, show loading
  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src={Logo}
                  alt="ACC Career Club Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Forgot Password
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {step === 1 && "Enter your College ID to reset password"}
              {step === 2 && `OTP sent to ${maskedEmail}`}
              {step === 3 && "Set your new password"}
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Step 1: College ID */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label
                    htmlFor="collegeId"
                    className="block text-sm font-medium text-[#3D444C] mb-2"
                  >
                    College ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="text-[#D3A16D] text-sm" />
                    </div>
                    <input
                      type="text"
                      id="collegeId"
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                      placeholder="Enter your student ID (e.g., 521017)"
                      required
                      disabled={isLoading}
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter the College ID you used during registration
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
                      autoComplete="off"
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
                      <FaLock className="text-[#D3A16D] text-sm" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                      placeholder="Enter new password (min 8 characters)"
                      required
                      minLength={8}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
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
                      <FaLock className="text-[#D3A16D] text-sm" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                      placeholder="Confirm your new password"
                      required
                      minLength={8}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
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
                      <span>Resetting Password...</span>
                    </span>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <FaCheckCircle className="text-sm" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-[#3D444C]/70 hover:text-[#994D35] transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FaArrowLeft className="text-xs" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#3D444C]/50">
            <span className="font-medium">ACC Career Club</span> &bull; Adamjee Cantonment College &bull; Est. 1960
          </p>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const ForgotPasswordClient = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4">Loading...</p>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPasswordClient;