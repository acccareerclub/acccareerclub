// app/components/ComingSoon.jsx

"use client";
import React from "react";
import Link from "next/link";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-[#3D444C] flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Decorative background shapes */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D3A16D] opacity-10 blur-3xl -top-32 -left-32 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#994D35] opacity-10 blur-3xl -bottom-24 -right-24 animate-pulse" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#E7E3D8] opacity-5 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full border-2 border-[#D3A16D] flex items-center justify-center shadow-lg shadow-[#D3A16D]/20">
            <FaEnvelope className="text-[#E7E3D8] text-3xl" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#E7E3D8] text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-2">
          Coming
        </h1>
        <h1 className="text-[#D3A16D] text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 relative">
          Soon
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-[3px] bg-gradient-to-r from-transparent via-[#994D35] to-transparent rounded-full" />
        </h1>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#994D35]" />
          <span className="w-16 h-px bg-[#E7E3D8]/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#994D35]" />
        </div>

        {/* Description */}
        <p className="text-[#E7E3D8]/70 text-base md:text-lg leading-relaxed mb-10 max-w-md">
          We&apos;re crafting something extraordinary. This page will be
          available soon — check back later.
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-[#994D35] hover:bg-[#D3A16D] text-[#E7E3D8] font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-sm whitespace-nowrap"
        >
          <FaArrowLeft className="text-xs" />
          Back to Home
        </Link>

        {/* Footer */}
        <p className="mt-12 text-[#E7E3D8]/30 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} — All rights reserved
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;