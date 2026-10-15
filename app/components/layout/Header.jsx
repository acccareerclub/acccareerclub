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
  FaInfoCircle,
  FaPhone,
  FaBell,
  FaHome,
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiCertificate2Fill } from "react-icons/ri";
import {
  MdLogin,
  MdWork,
  MdEvent,
  MdArticle,
  MdBusiness,
  MdMoreHoriz,
} from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";

/* ---------- Reusable Avatar ---------- */
const Avatar = ({ user, size = "md", className = "" }) => {
  const pic =
    user?.profilePicture || user?.personalInfo?.profilePicture || null;

  // Size map — keep them consistent across header/panels
  const sizeMap = {
    sm: "w-8 h-8 text-lg",
    md: "w-10 h-10 text-2xl",
    lg: "w-12 h-12 text-3xl",
  };
  const dim = sizeMap[size] || sizeMap.md;

  if (pic) {
    return (
      <div
        className={`relative ${dim} rounded-full overflow-hidden bg-[#E7E3D8] border border-[#3D444C]/10 shrink-0 ${className}`}
      >
        <Image
          src={pic}
          alt={user?.fullName || "User"}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <FaUserCircle className={`${dim} text-[#994D35] shrink-0 ${className}`} />
  );
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDesktopServicesOpen, setIsDesktopServicesOpen] = useState(false);
  const [openMethod, setOpenMethod] = useState(null);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);

  const dropdownRef = useRef(null);
  const servicesRef = useRef(null);
  const mobileMoreRef = useRef(null);
  const mobileAccountRef = useRef(null);

  const { user, logout } = useAuth();

  const closeAll = () => {
    setIsMobileMoreOpen(false);
    setIsMobileAccountOpen(false);
    setIsDesktopServicesOpen(false);
    setOpenMethod(null);
  };

  const handleLogOut = () => {
    logout();
    setIsDropdownOpen(false);
    closeAll();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsDesktopServicesOpen(false);
        setOpenMethod(null);
      }
      if (
        mobileMoreRef.current &&
        !mobileMoreRef.current.contains(event.target)
      ) {
        setIsMobileMoreOpen(false);
      }
      if (
        mobileAccountRef.current &&
        !mobileAccountRef.current.contains(event.target)
      ) {
        setIsMobileAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleServicesMouseEnter = () => {
    if (openMethod !== "click") {
      setIsDesktopServicesOpen(true);
      setOpenMethod("hover");
    }
  };

  const handleServicesMouseLeave = () => {
    if (openMethod === "hover") {
      setIsDesktopServicesOpen(false);
      setOpenMethod(null);
    }
  };

  const handleServicesClick = () => {
    if (isDesktopServicesOpen && openMethod === "click") {
      setIsDesktopServicesOpen(false);
      setOpenMethod(null);
    } else {
      setIsDesktopServicesOpen(true);
      setOpenMethod("click");
    }
  };

  const toggleMobileMore = () => {
    setIsMobileMoreOpen(!isMobileMoreOpen);
    if (isMobileAccountOpen) setIsMobileAccountOpen(false);
  };

  const toggleMobileAccount = () => {
    setIsMobileAccountOpen(!isMobileAccountOpen);
    if (isMobileMoreOpen) setIsMobileMoreOpen(false);
  };

  const DASHBOARD_ROLES = [
    "itsecretary",
    "modarator",
    "prefect",
    "assistant_prefect",
  ];
  const canAccessDashboard = user?.role && DASHBOARD_ROLES.includes(user.role);

  const servicesList = [
    {
      name: "All Notice",
      href: "/all-notice",
      icon: <FaBell className="text-sm" />,
    },
    {
      name: "Sessions",
      href: "/sessions",
      icon: <MdEvent className="text-sm" />,
    },
    { name: "Events", href: "/events", icon: <MdEvent className="text-sm" /> },
    {
      name: "Articles",
      href: "/articles",
      icon: <MdArticle className="text-sm" />,
    },
    { name: "Jobs", href: "/jobs", icon: <MdWork className="text-sm" /> },
    {
      name: "Companies",
      href: "/companies",
      icon: <MdBusiness className="text-sm" />,
    },
  ];

  return (
    <>
      {/* ===== TOP HEADER (scrolls normally, NOT fixed) ===== */}
      <header className="w-full px-4 sm:px-2 py-4 sm:py-2 bg-[#E7E3D8] shadow-md relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 group"
          >
            <div className="relative w-10 h-8 sm:w-12 sm:h-6 md:w-16 md:h-16">
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-[#3D444C] font-medium uppercase font-saira">
            <Link
              href="/"
              className="hover:text-[#D3A16D] transition-colors duration-200"
            >
              Home
            </Link>

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

              <div
                className={`absolute top-full left-0 w-48 transition-all duration-300 origin-top ${
                  isDesktopServicesOpen
                    ? "opacity-100 scale-y-100 pointer-events-auto pt-2"
                    : "opacity-0 scale-y-95 pointer-events-none pt-0"
                }`}
              >
                <div className="bg-white rounded-xl shadow-xl overflow-hidden p-2 flex flex-col">
                  {servicesList.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="px-4 py-2 text-sm text-[#3D444C] hover:bg-[#E7E3D8] hover:text-[#994D35] rounded-lg transition-colors flex items-center gap-2"
                    >
                      {service.icon}
                      {service.name}
                    </Link>
                  ))}
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

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-white rounded-2xl px-3 py-2 cursor-pointer hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative">
                    {/* ✅ Profile picture or fallback icon */}
                    <Avatar user={user} size="sm" />
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
                    className={`text-[#994D35] text-xl transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <div
                  className={`absolute right-0 w-72 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-right ${
                    isDropdownOpen
                      ? "opacity-100 scale-100 pointer-events-auto"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                        {/* ✅ Header avatar (lg) */}
                        {user?.profilePicture ||
                        user?.personalInfo?.profilePicture ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={
                                user.profilePicture ||
                                user.personalInfo.profilePicture
                              }
                              alt={user?.fullName || "User"}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <FaUserGraduate className="text-white text-xl" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-white/80 text-xs truncate">
                          {user?.email}
                        </p>
                        <p className="text-[#D3A16D] text-xs capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                  </div>

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

                    {canAccessDashboard && (
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

          {/* Mobile Top Right Icons */}
          <div className="md:hidden flex items-center gap-1">
            {user ? (
              <button
                onClick={toggleMobileAccount}
                className="flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-full bg-[#3D444C] text-[#E7E3D8] hover:bg-[#994D35] transition-colors"
                aria-label="Account menu"
                aria-expanded={isMobileAccountOpen}
              >
                {/* Avatar or fallback icon */}
                {user?.profilePicture || user?.personalInfo?.profilePicture ? (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src={
                        user.profilePicture || user.personalInfo.profilePicture
                      }
                      alt={user?.fullName || "User"}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <FaUserCircle className="text-xl" />
                )}

                {/* ✅ Dropdown indicator — rotates when panel is open */}
                <IoMdArrowDropdown
                  className={`text-[#E7E3D8] text-lg transition-transform duration-300 ${
                    isMobileAccountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <Link
                href="/login"
                className="border border-[#3D444C] flex bg-[#3D444C] rounded py-1 px-2"
              >
                <span className="flex items-center gap-1 text-white text-xs font-semibold">
                  <MdLogin /> SIGN IN
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== Overlay (z-40, below panels) ===== */}
      {(isMobileMoreOpen || isMobileAccountOpen) && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setIsMobileMoreOpen(false);
            setIsMobileAccountOpen(false);
          }}
        />
      )}

      {/* ===== Mobile Account Panel ===== */}
      {isMobileAccountOpen && user && (
        <div
          ref={mobileAccountRef}
          className="md:hidden fixed top-[72px] right-2 z-[60] bg-white shadow-2xl rounded-2xl overflow-hidden w-64 border border-[#E7E3D8]"
        >
          <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {/* ✅ Mobile panel avatar with fallback */}
                {user?.profilePicture || user?.personalInfo?.profilePicture ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={
                        user.profilePicture || user.personalInfo.profilePicture
                      }
                      alt={user?.fullName || "User"}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <FaUserGraduate className="text-white text-lg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {user?.fullName}
                </p>
                <p className="text-white/70 text-xs truncate">{user?.email}</p>
                <p className="text-[#D3A16D] text-xs capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-all duration-200 group"
              onClick={() => setIsMobileAccountOpen(false)}
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
              onClick={() => setIsMobileAccountOpen(false)}
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
              onClick={() => setIsMobileAccountOpen(false)}
            >
              <FaCog className="text-[#994D35] text-sm" />
              <span className="text-sm text-[#3D444C] group-hover:text-[#994D35] transition-colors">
                Settings
              </span>
              <FaArrowRight className="text-[#994D35] text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {canAccessDashboard && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-all duration-200 group"
                  onClick={() => setIsMobileAccountOpen(false)}
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
      )}

      {/* ===== STICKY BOTTOM BAR ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#E7E3D8] border-t border-[#3D444C]/15 shadow-[0_-2px_12px_rgba(0,0,0,0.12)]">
        <div className="flex items-stretch justify-around h-14">
          <Link
            href="/"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#3D444C] active:text-[#994D35] transition-colors"
          >
            <FaHome size={20} />
            <span className="text-[10px] font-medium leading-none">Home</span>
          </Link>

          <Link
            href="/about"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#3D444C] active:text-[#994D35] transition-colors"
          >
            <FaInfoCircle size={20} />
            <span className="text-[10px] font-medium leading-none">About</span>
          </Link>

          <Link
            href="/contact"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#3D444C] active:text-[#994D35] transition-colors"
          >
            <FaPhone size={20} />
            <span className="text-[10px] font-medium leading-none">
              Contact
            </span>
          </Link>

          <button
            onClick={toggleMobileMore}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[#3D444C] active:text-[#994D35] transition-colors relative"
          >
            <CgDetailsMore size={22} />
            <span className="text-[10px] font-medium leading-none">More</span>
            {isMobileMoreOpen && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#994D35] rounded-full" />
            )}
          </button>
        </div>
      </nav>

      {/* ===== Mobile More Panel ===== */}
      {isMobileMoreOpen && (
        <div
          ref={mobileMoreRef}
          className="md:hidden fixed bottom-14 left-0 right-0 z-[60] bg-white shadow-2xl rounded-t-2xl overflow-hidden border-t border-[#E7E3D8]"
        >
          <div className="p-3">
            <h3 className="text-sm font-semibold text-[#3D444C] mb-2 px-2">
              Services
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {servicesList.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] hover:text-[#994D35] transition-colors"
                  onClick={() => setIsMobileMoreOpen(false)}
                >
                  <span className="text-[#994D35]">{service.icon}</span>
                  <span className="text-sm">{service.name}</span>
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-2 pt-2">
              <Link
                href="/about"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] hover:text-[#994D35] transition-colors"
                onClick={() => setIsMobileMoreOpen(false)}
              >
                <FaInfoCircle className="text-[#994D35]" />
                <span className="text-sm">About</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] hover:text-[#994D35] transition-colors"
                onClick={() => setIsMobileMoreOpen(false)}
              >
                <FaPhone className="text-[#994D35]" />
                <span className="text-sm">Contact</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
