// app/components/home/CarosolSectors.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaBriefcase,
  FaBuilding,
  FaBell,
  FaFileAlt,
  FaArrowRight,
  FaRocket,
  FaUsers,
  FaChartLine,
  FaCrown,
  FaShieldAlt,
} from "react-icons/fa";
import { motion, useAnimation, useInView } from "framer-motion";

const CarosolSectors = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const controls = useAnimation();

  // Sector data with icons and links
  const sectors = [
    {
      id: "jobs",
      title: "Jobs",
      description: "Find your dream career opportunity",
      icon: FaBriefcase,
      color: "#FF6B6B",
      gradient: "from-[#FF6B6B] to-[#EE5A24]",
      link: "/jobs",
      stats: "1,200+ Openings",
      badge: "Hot",
    },
    {
      id: "companies",
      title: "Companies",
      description: "Connect with top organizations",
      icon: FaBuilding,
      color: "#4ECDC4",
      gradient: "from-[#4ECDC4] to-[#0ABDE3]",
      link: "/companies",
      stats: "500+ Partners",
      badge: "New",
    },
    {
      id: "notice",
      title: "Notices",
      description: "Stay updated with announcements",
      icon: FaBell,
      color: "#FFD93D",
      gradient: "from-[#FFD93D] to-[#F6B93B]",
      link: "/all-notice",
      stats: "15 New",
      badge: "Urgent",
    },
    {
      id: "cv",
      title: "CV Builder",
      description: "Create professional resumes",
      icon: FaFileAlt,
      color: "#A29BFE",
      gradient: "from-[#A29BFE] to-[#6C5CE7]",
      link: "/cv-builder",
      stats: "Build Now",
      badge: "Free",
    },
  ];

  // Auto-rotate carousel
  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % sectors.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isHovering, sectors.length]);

  // Animate when in view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatVariants = {
    float: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const glowVariants = {
    glow: {
      boxShadow: [
        "0 0 20px rgba(153, 77, 53, 0.3)",
        "0 0 40px rgba(153, 77, 53, 0.6)",
        "0 0 20px rgba(153, 77, 53, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div ref={sectionRef} className="w-full py-8 md:py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3D444C] via-[#994D35]/90 to-[#3D444C]"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header with Glowing Effect */}
        <motion.div
          variants={cardVariants}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            animate={floatVariants.float}
            className="inline-block"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                animate={glowVariants.glow}
                className="w-12 h-12 rounded-full bg-[#994D35]/20 backdrop-blur-sm border border-[#D3A16D]/30 flex items-center justify-center"
              >
                <FaRocket className="text-2xl text-[#D3A16D]" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Career <span className="text-[#D3A16D]">Sectors</span>
              </h2>
            </div>
          </motion.div>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto mt-2">
            Explore opportunities, connect with companies, and build your future
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#D3A16D] to-[#994D35] mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {/* Cards Grid - 4 in a row, 2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sectors.map((sector, index) => {
            const IconComponent = sector.icon;
            const isActive = index === activeIndex;

            return (
              <motion.div
                key={sector.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Link href={sector.link} className="block h-full">
                  <div className={`
                    relative h-full rounded-2xl p-5 md:p-6 backdrop-blur-sm
                    transition-all duration-500 overflow-hidden
                    ${isActive ? 'ring-2 ring-[#D3A16D] ring-offset-2 ring-offset-[#994D35]/20' : ''}
                    bg-gradient-to-br from-white/10 to-white/5
                    border border-white/20 hover:border-[#D3A16D]/50
                    shadow-lg hover:shadow-2xl
                  `}>
                    {/* Glow effect on hover */}
                    <div className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-br ${sector.gradient}
                      rounded-2xl blur-2xl
                    `} style={{ opacity: 0.15 }}></div>

                    {/* Animated border glow */}
                    <div className={`
                      absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      ${isActive ? 'opacity-100' : ''}
                    `}>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D3A16D] via-[#994D35] to-[#D3A16D] p-[2px]">
                        <div className="w-full h-full rounded-2xl bg-[#3D444C]"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Icon with floating animation */}
                      <motion.div
                        animate={{
                          y: isActive ? [-4, 4, -4] : 0,
                          scale: isActive ? 1.1 : 1,
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className={`
                          w-14 h-14 md:w-16 md:h-16 rounded-xl
                          flex items-center justify-center mb-4
                          transition-all duration-500
                          ${isActive ? 'bg-[#D3A16D]/30 scale-110' : 'bg-white/10 group-hover:bg-[#D3A16D]/20'}
                        `}
                        style={{ color: sector.color }}
                      >
                        <IconComponent className="text-2xl md:text-3xl" />
                      </motion.div>

                      {/* Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`
                          text-[10px] font-bold px-2 py-1 rounded-full
                          ${sector.id === 'jobs' ? 'bg-red-500/80 text-white' :
                            sector.id === 'companies' ? 'bg-blue-500/80 text-white' :
                            sector.id === 'notice' ? 'bg-orange-500/80 text-white' :
                            'bg-purple-500/80 text-white'}
                          backdrop-blur-sm border border-white/20
                          animate-pulse
                        `}>
                          {sector.badge}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                        {sector.title}
                      </h3>

                      {/* Description */}
                      <p className="text-white/60 text-xs md:text-sm flex-1">
                        {sector.description}
                      </p>

                      {/* Stats */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-white/40 text-xs">
                          {sector.stats}
                        </span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          className="text-[#D3A16D] text-sm opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <FaArrowRight />
                        </motion.div>
                      </div>
                    </div>

                    {/* Progress bar for active card */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D3A16D] to-[#994D35]"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4, ease: "linear" }}
                      />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Indicators */}
        <motion.div
          variants={cardVariants}
          className="flex items-center justify-center gap-3 mt-8"
        >
          {sectors.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`
                transition-all duration-500 rounded-full
                ${index === activeIndex
                  ? 'w-10 h-2.5 bg-[#D3A16D] shadow-lg shadow-[#D3A16D]/30'
                  : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
                }
              `}
            />
          ))}
        </motion.div>

        {/* Bottom Decorative Line */}
        <motion.div
          variants={cardVariants}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D3A16D]/30"></div>
          <div className="flex items-center gap-2 text-white/20 text-xs">
            <FaCrown className="text-[#D3A16D]/30" />
            <span>Powered by ACC Career Club</span>
          </div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D3A16D]/30"></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CarosolSectors;