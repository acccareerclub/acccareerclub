// app/components/layout/Header.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../assets/logo/Careerclublogo.png";
import { useAuth } from "@/app/context/AuthContext";
import {
  FaUserCircle,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaUserGraduate,
  FaClipboardList,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiCertificate2Fill } from "react-icons/ri";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // State for Services Dropdowns
  const [isDesktopServicesOpen, setIsDesktopServicesOpen] = useState(false);
  // Tracks if the menu was opened via click ('click') or hover ('hover')
  const [openMethod, setOpenMethod] = useState(null);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(true);

  const dropdownRef = useRef(null);
  const servicesRef = useRef(null);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsMobileServicesOpen(false);
    // Reset desktop services when mobile menu closes
    setIsDesktopServicesOpen(false);
    setOpenMethod(null);
  };

  const handleLogOut = () => {
    logout();
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsDesktopServicesOpen(false);
        setOpenMethod(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileServices = () => {
    setIsMobileServicesOpen(!isMobileServicesOpen);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  // --- Desktop Services Handlers ---

  const handleServicesMouseEnter = () => {
    // If it was opened via click, don't change state on hover
    if (openMethod !== "click") {
      setIsDesktopServicesOpen(true);
      setOpenMethod("hover");
    }
  };

  const handleServicesMouseLeave = () => {
    // Only close on mouse leave if it was opened via hover
    if (openMethod === "hover") {
      setIsDesktopServicesOpen(false);
      setOpenMethod(null);
    }
  };

  const handleServicesClick = () => {
    if (isDesktopServicesOpen && openMethod === "click") {
      // If it's already open via click, clicking again closes it
      setIsDesktopServicesOpen(false);
      setOpenMethod(null);
    } else {
      // Otherwise, open it via click
      setIsDesktopServicesOpen(true);
      setOpenMethod("click");
    }
  };

  return (
    <header className="w-full px-4 sm:px-6 py-4 bg-[#E7E3D8] shadow-md relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section with Link */}
        <Link
          href="/"
          className="flex items-center space-x-2 sm:space-x-3 group"
        >
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
            <Image
              src={Logo}
              alt="Career Club Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg md:text-3xl font-bold text-[#3D444C] tracking-tight group-hover:text-[#994D35] transition-colors duration-300">
            <span className="text-[#994D35]">ACC</span>
            Career<span className="text-[#994D35]">Club</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[#3D444C] font-medium uppercase font-saira">
          <Link
            href="/"
            className="hover:text-[#D3A16D] font-saira transition-colors duration-200"
          >
            Home
          </Link>

          {/* Desktop Services Dropdown */}
          <div
            className="relative"
            ref={servicesRef}
            onMouseEnter={handleServicesMouseEnter}
            onMouseLeave={handleServicesMouseLeave}
          >
            <button
              className="hover:text-[#D3A16D] flex items-center gap-1 transition-colors uppercase duration-200 focus:outline-none"
              onClick={handleServicesClick}
            >
              Services
              {isDesktopServicesOpen ? (
                <FaChevronUp className="text-xs" />
              ) : (
                <FaChevronDown className="text-xs" />
              )}
            </button>

            {/* Desktop Dropdown Menu */}
            {/* 
               KEY FIX 1: We use a wrapper with 'pt-2' (padding-top) instead of 'mt-2' (margin-top).
               The padding is part of the element, so moving the mouse over the gap
               doesn't trigger onMouseLeave. 
            */}
            <div
              className={`absolute top-full left-0 w-48 transition-all duration-300 origin-top ${
                isDesktopServicesOpen
                  ? "opacity-100 scale-y-100 pointer-events-auto pt-2"
                  : "opacity-0 scale-y-95 pointer-events-none pt-0"
              }`}
            >
              {/* Inner container for the actual visual box and shadow */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden p-2 flex flex-col">
                <Link
                  href="/all-notice"
                  className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors"
                >
                  All Notice
                </Link>
                <Link
                  href="/sessions"
                  className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors"
                >
                  Sessions
                </Link>
                <Link
                  href="/events"
                  className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/articles"
                  className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors"
                >
                  Articles
                </Link>
                <Link
                  href="/jobs"
                  className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors"
                >
                  Jobs
                </Link>
                <Link
                  href="/companies"
                  className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors"
                >
                  Companies
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/about"
            className="hover:text-[#D3A16D] transition-colors duration-200"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#D3A16D] transition-colors duration-200"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden sm:flex items-center">
          {user ? (
            // User Dropdown
            <div
              className="relative"
              ref={dropdownRef}
              onMouseLeave={handleMouseLeave}
            >
              {/* User Avatar Button */}
              <div
                onClick={toggleDropdown}
                onMouseEnter={() => setIsDropdownOpen(true)}
                className="flex items-center space-x-2 bg-white rounded-2xl px-3 py-2 cursor-pointer hover:shadow-md transition-all duration-300 group"
              >
                <div className="relative">
                  <FaUserCircle className="text-[#994D35] text-2xl group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-[#3D444C] max-w-[50px] truncate">
                    {user?.fullName || "User"}
                  </span>
                  <span className="text-xs text-[#3D444C]/60 capitalize">
                    {user?.role || "Student"}
                  </span>
                </div>
                <IoMdArrowDropdown
                  className={`text-[#994D35] text-xl transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* Dropdown Menu */}
              <div
                className={`absolute right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-right ${
                  isDropdownOpen
                    ? "opacity-100 scale-100 pointer-events-auto"
                    : "opacity-0 scale-95 pointer-events-none"
                }`}
              >
                {/* User Info Header */}
                <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <FaUserGraduate className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {user?.fullName}
                      </p>
                      <p className="text-white/80 text-xs">{user?.email}</p>
                      <p className="text-[#D3A16D] text-xs capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    href={`/profile/${user?.id}`}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-all duration-200 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaUser className="text-[#994D35] text-sm" />
                    <span className="text-sm text-[#3D444C] group-hover:text-[#994D35] transition-colors">
                      My Profile
                    </span>
                    <FaArrowRight className="text-[#994D35] text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  
                  <Link
                    href={`/certificates/${user?.id}`}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-all duration-200 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <RiCertificate2Fill className="text-[#994D35] text-sm" />
                    <span className="text-sm text-[#3D444C] group-hover:text-[#994D35] transition-colors">
                      My Certificates
                    </span>
                    <FaArrowRight className="text-[#994D35] text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link
                    href={`/settings/${user?.id}`}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-all duration-200 group"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FaCog className="text-[#994D35] text-sm" />
                    <span className="text-sm text-[#3D444C] group-hover:text-[#994D35] transition-colors">
                      Settings
                    </span>
                    <FaArrowRight className="text-[#994D35] text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  {/* For IT Secretary */}
                  {user?.role === "itsecretary" && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-all duration-200 group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaClipboardList className="text-[#994D35] text-sm" />
                        <span className="text-sm text-[#3D444C] group-hover:text-[#994D35] transition-colors">
                          Dashboard
                        </span>
                        <FaArrowRight className="text-[#994D35] text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogOut}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-all duration-200 group"
                  >
                    <FaSignOutAlt className="text-red-500 text-sm" />
                    <span className="text-sm text-red-500 group-hover:text-red-600 transition-colors">
                      Sign Out
                    </span>
                    <FaArrowRight className="text-red-500 text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Sign In Button
            <Link
              href="/login"
              className="group relative px-4 py-2.5 sm:px-5 sm:py-2.5 md:px-7 md:py-3 bg-[#3D444C] text-[#E7E3D8] rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10 flex flex-col items-center leading-tight">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider">
                  SIGN IN
                </span>
                <span className="text-[8px] sm:text-[10px] md:text-xs opacity-80">
                  or Sign up
                </span>
              </span>
              <span className="absolute inset-0 bg-[#994D35] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-[#3D444C]/10 transition-colors duration-200 focus:outline-none font-saira"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-[#3D444C] transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-[#3D444C] transition-all duration-300 my-1.5 ${isMenuOpen ? "opacity-0" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-[#3D444C] transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Menu Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-80 bg-[#E7E3D8] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#3D444C]/10">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={closeMenu}
            >
              <div className="relative w-10 h-10">
                <Image
                  src={Logo}
                  alt="Career Club Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-[#3D444C]">
                Career<span className="text-[#994D35]">Club</span>
              </span>
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-[#3D444C]/10 transition-colors duration-200"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 text-[#3D444C]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link
              href="/"
              className="block px-4 py-1 text-[#3D444C] font-medium rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
              onClick={closeMenu}
            >
              Home
            </Link>

            {/* Mobile Services Dropdown */}
            <div>
              <button
                onClick={toggleMobileServices}
                className="w-full flex items-center justify-between px-4 py-1 text-[#3D444C] font-medium rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
              >
                Services
                {isMobileServicesOpen ? (
                  <FaChevronUp className="text-sm" />
                ) : (
                  <FaChevronDown className="text-sm" />
                )}
              </button>

              {/* Mobile Dropdown Menu */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isMobileServicesOpen
                    ? "max-h-40 opacity-100 mt-1"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col pl-6 space-y-1">
                  <Link
                    href="/all-notice"
                    className="block px-4 py-1 text-sm text-[#3D444C] rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
                    onClick={closeMenu}
                  >
                    All Notice
                  </Link>
                  <Link
                    href="/sessions"
                    className="block px-4 py-1 text-sm text-[#3D444C] rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
                    onClick={closeMenu}
                  >
                    Sessions
                  </Link>
                  <Link
                    href="/events"
                    className="block px-4 py-1 text-sm text-[#3D444C] rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
                    onClick={closeMenu}
                  >
                    Events
                  </Link>
                  <Link
                    href="/articles"
                    className="block px-4 py-1 text-sm text-[#3D444C] rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
                    onClick={closeMenu}
                  >
                    Articles
                  </Link>
                  <Link
                    href="/jobs"
                    className="block px-4 py-1 text-sm text-[#3D444C] rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
                    onClick={closeMenu}
                  >
                    Jobs
                  </Link>
                  <Link
                    href="/companies"
                    className="block px-4 py-1 text-sm text-[#3D444C] rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
                    onClick={closeMenu}
                  >
                    Companies
                  </Link>
                </div>
              </div>
            </div>

            <Link
              href="/about"
              className="block px-4 py-1 text-[#3D444C] font-medium rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
              onClick={closeMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-1 text-[#3D444C] font-medium rounded-lg hover:bg-[#D3A16D]/20 hover:text-[#994D35] transition-all duration-200"
              onClick={closeMenu}
            >
              Contact
            </Link>

            {user && (
              <div className="mt-4 p-4 bg-white rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <FaUserCircle className="text-[#994D35] text-3xl" />
                  <div>
                    <p className="text-sm font-semibold text-[#3D444C]">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-[#3D444C]/60">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href={`/profile/${user?.id}`}
                    className="block px-3 py-1 text-sm text-[#3D444C] hover:bg-[#E7E3D8] rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <Link
                    href={`/certificates/${user?.id}`}
                    className="block px-3 py-1 text-sm text-[#3D444C] hover:bg-[#E7E3D8] rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    My Certificates
                  </Link>
                  <Link
                    href={`/settings/${user?.id}`}
                    className="block px-3 py-1 text-sm text-[#3D444C] hover:bg-[#E7E3D8] rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    Settings
                  </Link>
                  {/* Mobile Menu For It Secretary */}
                  {user?.role === "itsecretary" && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <Link
                        href="/dashboard"
                        className="block px-3 py-1 text-sm text-[#3D444C] hover:bg-[#E7E3D8] rounded-lg transition-colors"
                        onClick={closeMenu}
                      >
                        Dashboard
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </nav>

          {/* Mobile Menu Auth Button */}
          <div className="p-4 border-t border-[#3D444C]/10">
            {user ? (
              <button
                onClick={() => {
                  handleLogOut();
                  closeMenu();
                }}
                className="w-full px-6 py-3 bg-[#994D35] text-white rounded-lg font-semibold hover:bg-[#D3A16D] transition-all duration-300"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full group relative px-6 py-3 bg-[#3D444C] text-[#E7E3D8] rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg block text-center"
                onClick={closeMenu}
              >
                <span className="relative z-10 flex flex-col items-center leading-tight">
                  <span className="text-sm font-semibold tracking-wider">
                    SIGN IN
                  </span>
                  <span className="text-xs opacity-80">or Sign Up</span>
                </span>
                <span className="absolute inset-0 bg-[#994D35] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
