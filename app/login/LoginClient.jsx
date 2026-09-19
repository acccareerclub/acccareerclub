// app/login/LoginClient.jsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaArrowRight,
  FaIdCard,
  FaUserCircle,
  FaHome,
  FaSignOutAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";
import toast from "react-hot-toast";
import Logo from "../assets/logo/Careerclublogo.png";

// Create a separate component that uses useSearchParams
const LoginContent = () => {
  const router = useRouter();
  const { user, login, loading, logout } = useAuth();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Determine if input looks like an email or student ID
  const isEmail = identifier.includes("@") && identifier.includes(".");
  const inputType = isEmail ? "Email" : "Student ID";

  useEffect(() => {
    if (sessionExpired) {
      toast.error("Your session has expired. Please login again.");
    }
  }, [sessionExpired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate inputs
      if (!identifier || !password) {
        setError("Please fill in all fields");
        toast.error("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      // Validate identifier format
      if (identifier.trim().length < 2) {
        setError("Please enter a valid email or student ID");
        toast.error("Please enter a valid email or student ID");
        setIsLoading(false);
        return;
      }

      console.log(
        `🔑 Attempting login with: ${identifier} (${isEmail ? "Email" : "Student ID"})`,
      );

      // Call login from AuthContext with identifier
      const result = await login(identifier, password);

      if (result.success) {
        toast.success("Welcome back! 🎉");
        router.push("/");
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  // If user is already logged in, show the logged in card
  if (user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-8 text-center">
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaCheckCircle className="text-4xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">
                Already Logged In
              </h2>
              <p className="text-white/80 text-sm mt-1">
                You are currently signed in to your account
              </p>
            </div>

            {/* User Info */}
            <div className="px-6 py-6">
              <div className="bg-[#E7E3D8]/30 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-[#994D35] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {user?.fullName?.[0] || (
                      <FaUserCircle className="text-3xl" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#3D444C] font-semibold text-lg truncate">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {user?.email || "No email"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {user?.role || "Member"}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {user?.studentId || "No ID"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full bg-[#3D444C] text-white py-3 rounded-lg font-semibold hover:bg-[#994D35] transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.02] hover:shadow-lg"
                >
                  <FaHome />
                  <span>Go to Home</span>
                </Link>

                <Link
                  href={`/profile/${user?.id}`}
                  className="w-full border-2 border-[#994D35] text-[#994D35] py-3 rounded-lg font-semibold hover:bg-[#994D35] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.02] hover:shadow-lg"
                >
                  <FaUserCircle />
                  <span>View Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-[1.02] hover:shadow-lg"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>

              {/* Info Text */}
              <p className="text-center text-xs text-gray-400 mt-4">
                You can also logout from the menu in the header
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show the login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Form */}
        <div className="p-8 sm:p-12 lg:p-14 bg-white">
          {/* Logo and Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="relative w-12 h-12">
              <Image
                src={Logo}
                alt="ACC Career Club Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#3D444C]">
                <span className="text-[#994D35]">ACC</span> Career Club
              </h2>
              <p className="text-sm text-[#3D444C]/70">
                Adamjee Cantonment College
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#3D444C]">Welcome Back!</h1>
            <p className="text-gray-600 mt-2">
              Sign in with your email or student ID
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier Field (Email or Student ID) */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-[#3D444C] mb-2"
              >
                Email or Student ID{" "}
                <span className="text-xs text-gray-400">(both accepted)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isEmail ? (
                    <FaEnvelope className="text-[#D3A16D] text-sm" />
                  ) : (
                    <FaIdCard className="text-[#D3A16D] text-sm" />
                  )}
                </div>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                  placeholder="student@example.com or 521017"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {identifier
                  ? `Logging in with: ${inputType}`
                  : "Enter your email or student ID"}
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#3D444C]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#994D35] hover:text-[#D3A16D] transition-colors duration-200 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-[#D3A16D] text-sm" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-gray-500 pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3D444C]/50 hover:text-[#3D444C] transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#994D35] border-gray-300 rounded focus:ring-[#D3A16D] focus:ring-2"
                />
                <span className="text-sm text-[#3D444C]/80">Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3D444C] text-[#E7E3D8] py-3.5 rounded-lg font-semibold hover:bg-[#994D35] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#3D444C]/70">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#994D35] font-semibold hover:text-[#D3A16D] transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Hero/Branding */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-[#3D444C] to-[#994D35] text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D3A16D] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <MdOutlineSchool className="text-6xl text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-4">ACC Career Club</h2>
            <p className="text-lg mb-6 text-white/90">
              Adamjee Cantonment College
            </p>

            <div className="w-20 h-1 bg-[#D3A16D] mx-auto mb-6"></div>

            <div className="space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <FaUserGraduate className="text-[#D3A16D] text-xl mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/90">
                  Access career counseling and professional development
                  resources
                </p>
              </div>
              <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <FaUserGraduate className="text-[#D3A16D] text-xl mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/90">
                  Connect with alumni and industry professionals
                </p>
              </div>
              <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <FaUserGraduate className="text-[#D3A16D] text-xl mt-0.5 flex-shrink-0" />
                <p className="text-sm text-white/90">
                  Discover internships and job opportunities
                </p>
              </div>
            </div>

            {/* College Badge */}
            <div className="mt-8 flex items-center justify-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <span className="text-xs font-medium text-white/80">
                Adamjee Cantonment College
              </span>
              <span className="w-1 h-1 bg-[#D3A16D] rounded-full"></span>
              <span className="text-xs font-medium text-white/80">
                Est. 1960
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component with Suspense boundary
const LoginClient = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent mx-auto"></div>
          <p className="text-[#3D444C] mt-4">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
};

export default LoginClient;