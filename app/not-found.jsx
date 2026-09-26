// app/not-found.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaHome,
  FaArrowLeft,
  FaCompass,
  FaRocket,
  FaSearch,
  FaGhost,
  FaMapSigns,
} from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";

const NotFound = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Floating animation for the 404
  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Glow pulse animation
  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(153, 77, 53, 0.3)",
        "0 0 60px rgba(153, 77, 53, 0.6)",
        "0 0 20px rgba(153, 77, 53, 0.3)",
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Rotating orbit animation
  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D444C] via-[#3D444C] to-[#994D35] relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated Background Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(231, 227, 216, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(231, 227, 216, 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              background:
                i % 3 === 0
                  ? "#D3A16D"
                  : i % 3 === 1
                    ? "#E7E3D8"
                    : "#994D35",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #994D35, transparent)",
          top: "10%",
          left: "10%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #D3A16D, transparent)",
          bottom: "10%",
          right: "10%",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-3xl w-full text-center"
      >
        {/* 404 with Icons */}
        <motion.div variants={itemVariants} className="mb-8 relative">
          {/* Orbiting elements */}
          <motion.div
            variants={orbitVariants}
            animate="animate"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ width: "100%", height: "100%" }}
          >
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <FaRocket className="text-[#D3A16D] text-2xl opacity-60" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <FaCompass className="text-[#E7E3D8] text-2xl opacity-60" />
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2">
                <FaSearch className="text-[#D3A16D] text-xl opacity-60" />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <FaMapSigns className="text-[#E7E3D8] text-xl opacity-60" />
              </div>
            </div>
          </motion.div>

          {/* Main 404 Text */}
          <motion.div
            variants={floatVariants}
            animate="animate"
            className="relative inline-block"
          >
            <motion.h1
              variants={glowVariants}
              animate="animate"
              className="text-[120px] md:text-[180px] lg:text-[220px] font-black leading-none bg-gradient-to-br from-[#E7E3D8] via-[#D3A16D] to-[#994D35] bg-clip-text text-transparent select-none"
              style={{
                textShadow: "0 0 80px rgba(211, 161, 109, 0.3)",
                fontFamily: "'Arial Black', sans-serif",
                letterSpacing: "-0.05em",
              }}
            >
              404
            </motion.h1>

            {/* Ghost icon in the middle of 0 */}
            <motion.div
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <FaGhost className="text-[#3D444C] text-4xl md:text-6xl opacity-80" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#E7E3D8] mb-4"
        >
          Oops! Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-[#E7E3D8]/70 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
        >
          The page you're looking for seems to have wandered off into the
          digital void. Don't worry, it happens to the best of us.
        </motion.p>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D3A16D]/50"></div>
          <div className="w-2 h-2 rounded-full bg-[#D3A16D]"></div>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D3A16D]/50"></div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {/* Go Home Button */}
          <Link href="/" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#994D35] to-[#D3A16D] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform" />
              <span>Back to Home</span>
            </motion.button>
          </Link>

          {/* Go Back Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-[#E7E3D8] px-8 py-4 rounded-xl font-semibold border-2 border-[#E7E3D8]/20 hover:bg-white/20 hover:border-[#D3A16D]/50 transition-all duration-300 group"
          >
            <FaArrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </motion.button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div variants={itemVariants} className="space-y-4">
          <p className="text-[#E7E3D8]/50 text-sm">
            Here are some helpful links instead:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "Jobs", href: "/jobs" },
              { label: "Companies", href: "/companies" },
              { label: "Notices", href: "/all-notice" },
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#D3A16D]/10 backdrop-blur-sm rounded-full text-[#D3A16D] text-sm font-medium border border-[#D3A16D]/30 hover:bg-[#D3A16D]/20 hover:border-[#D3A16D]/50 transition-all duration-300"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer Branding */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex items-center justify-center gap-3 text-[#E7E3D8]/40"
        >
          <MdOutlineSchool className="text-2xl" />
          <div className="text-left">
            <p className="text-xs font-medium">ACC Career Club</p>
            <p className="text-[10px]">Adamjee Cantonment College</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D3A16D] to-transparent opacity-50"></div>
    </div>
  );
};

export default NotFound;