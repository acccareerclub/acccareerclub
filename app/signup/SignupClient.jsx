// app/signup/SignupClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserGraduate,
  FaArrowRight,
  FaUser,
  FaUniversity,
  FaPhone,
  FaCheckCircle,
  FaHome,
  FaSignInAlt,
} from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";
import Logo from "../assets/logo/Careerclublogo.png";

const SignupClient = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showSuccessModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSuccessModal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.studentId.trim())
      newErrors.studentId = "Student ID is required";
    if (!formData.department)
      newErrors.department = "Please select your department";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare data for API
      const signupData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId,
        department: formData.department,
        password: formData.password,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success modal instead of redirecting
        setUserEmail(formData.email);
        setUserName(formData.fullName);
        setShowSuccessModal(true);
        toast.success("Registration submitted successfully! Check your email.");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          studentId: "",
          department: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false,
        });
      } else {
        // Error
        toast.error(data.message || "Something went wrong. Please try again.");
        if (data.errors) {
          data.errors.forEach((err) => toast.error(err));
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const departments = [
    "Department of BBA",
    "Department of Accounting",
    "Department of Management",
    "Department of English",
    "Department of Political Science",
    "Department of Economics",
    "Masters",
  ];

  // Success Modal Component (inline) - More Watchable
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <>
        {/* Backdrop - darker for better visibility */}
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => {}}
        />

        {/* Modal - Better positioning and sizing */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-scaleIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border-2 border-[#D3A16D]/20">
            {/* Close button - more prominent */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full z-10"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Success Icon - larger for visibility */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounceIn shadow-lg">
                <FaCheckCircle className="text-green-500 text-4xl sm:text-5xl" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#3D444C] mb-2">
              Registration Submitted! 🎉
            </h2>

            <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
              Dear <strong className="text-[#994D35]">{userName}</strong>, your application has been
              submitted successfully!
            </p>

            {/* Information Box - with better contrast */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <FaEnvelope className="text-blue-600 text-base sm:text-lg" />
                </div>
                <div>
                  <p className="text-sm sm:text-base text-blue-800 font-semibold">
                    Verification Request Sent to Authority!
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 mt-0.5">
                    Please wait for verification
                  </p>
                </div>
              </div>
            </div>

            {/* What happens next - with better visibility */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-yellow-800">
                <strong className="text-yellow-900">What happens next?</strong>
                <br />
                Our team will review your application and verify your account.
                You will receive an email notification once verified. Please
                check your spam folder if you don't see the email.
              </p>
            </div>

            {/* Action Buttons - more prominent */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/");
                }}
                className="w-full bg-[#3D444C] text-[#E7E3D8] py-3.5 sm:py-4 rounded-lg font-semibold hover:bg-[#994D35] transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <FaHome className="text-base sm:text-lg" />
                <span>Go to Home</span>
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/login");
                }}
                className="w-full border-2 border-[#994D35] text-[#994D35] py-3.5 sm:py-4 rounded-lg font-semibold hover:bg-[#994D35] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <FaSignInAlt className="text-base sm:text-lg" />
                <span>Go to Login</span>
              </button>
            </div>

            {/* Optional: Small hint text */}
            <p className="text-center text-xs text-gray-400 mt-3">
              You can close this modal anytime
            </p>
          </div>
        </div>

        {/* Add animation styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out;
          }
          .animate-bounceIn {
            animation: bounceIn 0.6s ease-out;
          }
        `}</style>
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12 lg:py-12 md:py-8 sm:py-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl lg:rounded-2xl shadow-2xl overflow-hidden min-h-[90vh] lg:min-h-0">
          {/* Left Side - Form - Full screen on mobile */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-14 bg-white overflow-y-auto min-h-[90vh] lg:min-h-0 lg:max-h-full">
            {/* Logo and Header */}
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src={Logo}
                  alt="ACC Career Club Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
                  <span className="text-[#994D35]">ACC</span> Career Club
                </h2>
                <p className="text-xs sm:text-sm text-[#3D444C]/70">
                  Adamjee Cantonment College
                </p>
              </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3D444C]">
                Create Account
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                Join the ACC Career Club community and start your journey
              </p>
            </div>

            {/* Progress Steps - Hidden on mobile, visible on larger screens */}
            <div className="hidden sm:flex items-center justify-between mb-4 sm:mb-6 px-0.5">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#994D35] text-white flex items-center justify-center text-xs sm:text-sm font-semibold">
                  1
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#3D444C]">
                  Account
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-[#994D35] mx-1 sm:mx-2"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#D3A16D] text-white flex items-center justify-center text-xs sm:text-sm font-semibold">
                  2
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#3D444C]/60">
                  Verification
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-1 sm:mx-2"></div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-xs sm:text-sm font-semibold">
                  3
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#3D444C]/40">
                  Complete
                </span>
              </div>
            </div>

            {/* Progress Steps - Mobile version (simplified) */}
            <div className="flex sm:hidden items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#994D35] text-white flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium text-[#3D444C]">
                  Account
                </span>
              </div>
              <div className="flex-1 h-0.5 bg-[#994D35] mx-2"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="text-sm font-medium text-[#3D444C]/40">
                  Verify
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-[#D3A16D] text-xs sm:text-sm" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border ${errors.fullName ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30`}
                    placeholder="Md. Student Name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email and Phone - Two columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-[#D3A16D] text-xs sm:text-sm" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30`}
                      placeholder="student@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-[#D3A16D] text-xs sm:text-sm" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30`}
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Student ID and Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="studentId"
                    className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                  >
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUniversity className="text-[#D3A16D] text-xs sm:text-sm" />
                    </div>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border ${errors.studentId ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30`}
                      placeholder="521017.."
                    />
                  </div>
                  {errors.studentId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.studentId}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                  >
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdOutlineSchool className="text-[#D3A16D] text-xs sm:text-sm" />
                    </div>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border ${errors.department ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30 appearance-none`}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.department && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.department}
                    </p>
                  )}
                </div>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-[#D3A16D] text-xs sm:text-sm" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30`}
                      placeholder="Min 8 characters"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3D444C]/50 hover:text-[#3D444C] transition-colors duration-200"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="text-xs sm:text-sm" />
                      ) : (
                        <FaEye className="text-xs sm:text-sm" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs sm:text-sm font-medium text-[#3D444C] mb-1 sm:mb-1.5"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-[#D3A16D] text-xs sm:text-sm" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full text-gray-500 text-sm sm:text-base pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent transition-all duration-200 bg-[#E7E3D8]/30`}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3D444C]/50 hover:text-[#3D444C] transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="text-xs sm:text-sm" />
                      ) : (
                        <FaEye className="text-xs sm:text-sm" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex space-x-1">
                    <div
                      className={`h-1 flex-1 rounded-full ${formData.password.length >= 4 ? "bg-red-400" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full ${formData.password.length >= 6 ? "bg-yellow-400" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? "bg-green-400" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`h-1 flex-1 rounded-full ${formData.password.length >= 10 && /[^A-Za-z0-9]/.test(formData.password) ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                  </div>
                  <p className="text-xs text-[#3D444C]/60">
                    {formData.password.length < 4
                      ? "Weak"
                      : formData.password.length < 6
                        ? "Fair"
                        : formData.password.length < 8
                          ? "Good"
                          : "Strong"}
                  </p>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-1">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#994D35] border-gray-300 rounded focus:ring-[#D3A16D] focus:ring-2 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-[#3D444C]/80">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-[#994D35] hover:text-[#D3A16D] transition-colors duration-200 font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#994D35] hover:text-[#D3A16D] transition-colors duration-200 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-xs">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3D444C] text-[#E7E3D8] py-2.5 sm:py-3.5 rounded-lg font-semibold hover:bg-[#994D35] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FaArrowRight className="text-xs sm:text-sm" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-4 sm:mt-5 text-center">
              <p className="text-xs sm:text-sm text-[#3D444C]/70">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#994D35] font-semibold hover:text-[#D3A16D] transition-colors duration-200"
                >
                  Sign In
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
                  <FaUserGraduate className="text-6xl text-white" />
                </div>
              </div>

              <h2 className="text-4xl font-bold mb-4">Join ACC Career Club</h2>
              <p className="text-lg mb-6 text-white/90">
                Adamjee Cantonment College
              </p>

              <div className="w-20 h-1 bg-[#D3A16D] mx-auto mb-6"></div>

              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                  <FaCheckCircle className="text-[#D3A16D] text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Exclusive Access
                    </p>
                    <p className="text-xs text-white/70">
                      Career counseling & professional development
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                  <FaCheckCircle className="text-[#D3A16D] text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">Networking</p>
                    <p className="text-xs text-white/70">
                      Connect with alumni & industry professionals
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm transition-transform hover:scale-105 duration-300">
                  <FaCheckCircle className="text-[#D3A16D] text-xl mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Career Opportunities
                    </p>
                    <p className="text-xs text-white/70">
                      Internships, jobs, and skill development
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 flex items-center justify-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-xs text-white/70">Active Members</p>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-xs text-white/70">Partner Companies</p>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold">200+</p>
                  <p className="text-xs text-white/70">Job Placements</p>
                </div>
              </div>

              {/* College Badge */}
              <div className="mt-6 flex items-center justify-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
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

      {/* Success Modal */}
      <SuccessModal />
    </>
  );
};

export default SignupClient;