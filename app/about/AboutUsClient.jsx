// app/about/AboutUsClient.jsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  FaGraduationCap,
  FaUsers,
  FaBullseye,
  FaEye,
  FaHeart,
  FaHandshake,
  FaRocket,
  FaLightbulb,
  FaTrophy,
  FaBriefcase,
  FaNetworkWired,
  FaChartLine,
  FaCheckCircle,
  FaQuoteLeft,
  FaArrowRight,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaLinkedin,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaStar,
  FaAward,
  FaBookOpen,
  FaUserTie,
} from "react-icons/fa";
import { MdOutlineSchool, MdOutlineEmojiEvents } from "react-icons/md";
import Logo from "../assets/logo/Careerclublogo.png";

// Stats data
const STATS = [
  { icon: FaUsers, label: "Active Members", value: "500+", color: "#994D35" },
  { icon: FaBriefcase, label: "Jobs Posted", value: "1200+", color: "#D3A16D" },
  { icon: FaBuilding, label: "Partner Companies", value: "50+", color: "#3D444C" },
  { icon: MdOutlineEmojiEvents, label: "Events Hosted", value: "30+", color: "#994D35" },
];

// Values data
const VALUES = [
  {
    icon: FaBullseye,
    title: "Our Mission",
    description:
      "To empower every student of Adamjee Cantonment College with the skills, resources, and connections needed to build successful careers in their chosen fields.",
    color: "#994D35",
  },
  {
    icon: FaEye,
    title: "Our Vision",
    description:
      "To be the leading career development platform in Bangladesh, bridging the gap between talented students and world-class opportunities.",
    color: "#D3A16D",
  },
  {
    icon: FaHeart,
    title: "Our Values",
    description:
      "Excellence, integrity, inclusivity, and continuous learning. We believe in fostering a community where every member can thrive and grow.",
    color: "#3D444C",
  },
];

// What we offer
const SERVICES = [
  {
    icon: FaBriefcase,
    title: "Career Opportunities",
    description:
      "Access curated job listings, internships, and career opportunities from top companies across Bangladesh.",
  },
  {
    icon: FaNetworkWired,
    title: "Professional Networking",
    description:
      "Connect with alumni, industry professionals, and like-minded peers to expand your professional network.",
  },
  {
    icon: FaLightbulb,
    title: "Skill Development",
    description:
      "Participate in workshops, seminars, and training sessions to develop essential career skills.",
  },
  {
    icon: FaChartLine,
    title: "Career Guidance",
    description:
      "Get personalized career counseling and guidance from experienced mentors and industry experts.",
  },
  {
    icon: FaBookOpen,
    title: "Resources & Tools",
    description:
      "Access CV builders, interview prep materials, and other tools to help you succeed in your career journey.",
  },
  {
    icon: FaHandshake,
    title: "Industry Connections",
    description:
      "Build relationships with leading organizations through our extensive partner network.",
  },
];

// Team members
const TEAM = [
  {
    name: "Md. Rafiqul Islam",
    role: "Club Advisor",
    bio: "Faculty advisor with 15+ years of experience in student development.",
    avatar: "RI",
  },
  {
    name: "Ahmed Hassan",
    role: "President",
    bio: "Leading the club with passion and vision for student success.",
    avatar: "AH",
  },
  {
    name: "Fatima Khan",
    role: "Vice President",
    bio: "Coordinating activities and ensuring smooth club operations.",
    avatar: "FK",
  },
  {
    name: "Tanvir Ahmed",
    role: "IT Secretary",
    bio: "Managing our digital platform and technological initiatives.",
    avatar: "TA",
  },
];

// Timeline/Milestones
const TIMELINE = [
  {
    year: "2020",
    title: "Club Founded",
    description: "ACC Career Club was established with a vision to bridge academia and industry.",
  },
  {
    year: "2021",
    title: "First Major Event",
    description: "Successfully organized our first career fair with 20+ companies.",
  },
  {
    year: "2022",
    title: "Digital Platform Launch",
    description: "Launched our online platform connecting students with opportunities.",
  },
  {
    year: "2023",
    title: "1000+ Members",
    description: "Reached a milestone of over 1000 active members in our community.",
  },
  {
    year: "2024",
    title: "Going National",
    description: "Expanded our reach and partnerships across Bangladesh.",
  },
];

// Container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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

// Section Component
const Section = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Need FaBuilding import
import { FaBuilding } from "react-icons/fa";

const AboutUsClient = () => {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20">
      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#3D444C] via-[#3D444C] to-[#994D35] py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(231, 227, 216, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(231, 227, 216, 0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #D3A16D, transparent)",
            top: "-10%",
            right: "-5%",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #994D35, transparent)",
            bottom: "-10%",
            left: "-5%",
          }}
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={heroInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-6 flex justify-center"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 relative bg-white/10 backdrop-blur-sm rounded-3xl p-3 border border-[#D3A16D]/30">
              <div className="relative w-full h-full">
                <Image
                  src={Logo}
                  alt="ACC Career Club Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#D3A16D]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D3A16D]/30 mb-6"
          >
            <FaStar className="text-[#D3A16D] text-sm" />
            <span className="text-[#E7E3D8] text-sm font-medium">
              Adamjee Cantonment College
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#E7E3D8] mb-4"
          >
            About <span className="text-[#D3A16D]">Us</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-[#E7E3D8]/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Empowering students of Adamjee Cantonment College to achieve their
            career dreams through guidance, connections, and opportunities.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={heroInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="w-24 h-1 bg-gradient-to-r from-[#D3A16D] to-[#994D35] mx-auto mt-8 rounded-full"
          />
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <Section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 md:p-6 text-center border-2 border-[#D3A16D]/10"
                >
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="text-2xl md:text-3xl" style={{ color: stat.color }} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-[#3D444C] mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ================= OUR STORY SECTION ================= */}
      <Section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 bg-[#994D35]/10 px-4 py-2 rounded-full mb-4">
                <MdOutlineSchool className="text-[#994D35]" />
                <span className="text-[#994D35] text-sm font-semibold">
                  Our Story
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D444C] mb-6">
                Building Careers,{" "}
                <span className="text-[#994D35]">Shaping Futures</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  ACC Career Club was founded in 2020 with a simple yet powerful
                  vision: to bridge the gap between academic learning and
                  professional success. What started as a small initiative by a
                  group of passionate students has now grown into one of the
                  most active career development communities at Adamjee
                  Cantonment College.
                </p>
                <p>
                  Our club serves as a platform where students can explore
                  career opportunities, develop essential skills, and connect
                  with industry professionals. We believe that every student
                  deserves access to quality career guidance and resources,
                  regardless of their background or field of study.
                </p>
                <p>
                  Today, we're proud to serve over 500 active members and have
                  helped countless students land their dream jobs and
                  internships at leading companies across Bangladesh and beyond.
                </p>
              </div>

              {/* Key Points */}
              <div className="mt-8 space-y-3">
                {[
                  "Dedicated career guidance and mentorship",
                  "Strong industry partnerships and networks",
                  "Comprehensive skill development programs",
                  "Supportive and inclusive community",
                ].map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <FaCheckCircle className="text-[#994D35] flex-shrink-0" />
                    <span className="text-gray-700">{point}</span>
                  </motion.div>
                ))}
              </div>

              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 inline-flex items-center gap-2 bg-[#994D35] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-[#3D444C] transition-all duration-300 group"
                >
                  <span>Join Our Community</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Right - Timeline */}
            <motion.div variants={itemVariants} className="relative">
              <div className="relative pl-8">
                {/* Vertical Line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D3A16D] via-[#994D35] to-transparent"></div>

                {TIMELINE.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative mb-8 last:mb-0"
                  >
                    {/* Dot */}
                    <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white border-4 border-[#994D35] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#D3A16D]"></div>
                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-[#D3A16D]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#994D35] text-white px-3 py-1 rounded-full text-sm font-bold">
                          {item.year}
                        </span>
                        <h4 className="text-lg font-bold text-[#3D444C]">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ================= MISSION/VISION/VALUES ================= */}
      <Section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[#D3A16D]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D444C] mb-4">
              What <span className="text-[#994D35]">Drives Us</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our mission, vision, and values guide everything we do
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D3A16D] to-[#994D35] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4"
                  style={{ borderColor: value.color }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${value.color}15` }}
                  >
                    <Icon className="text-3xl" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-[#3D444C] mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ================= WHAT WE OFFER ================= */}
      <Section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#D3A16D]/10 px-4 py-2 rounded-full mb-4">
              <FaRocket className="text-[#994D35]" />
              <span className="text-[#994D35] text-sm font-semibold">
                What We Offer
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D444C] mb-4">
              Services & <span className="text-[#994D35]">Programs</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive support for your career development journey
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D3A16D] to-[#994D35] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#994D35]/5 to-[#D3A16D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#994D35] to-[#D3A16D] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Icon className="text-white text-xl" />
                    </div>
                    <h3 className="text-lg font-bold text-[#3D444C] mb-2 group-hover:text-[#994D35] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ================= TEAM SECTION ================= */}
      <Section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#D3A16D]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#994D35]/10 px-4 py-2 rounded-full mb-4">
              <FaUserTie className="text-[#994D35]" />
              <span className="text-[#994D35] text-sm font-semibold">
                Our Leadership
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D444C] mb-4">
              Meet The <span className="text-[#994D35]">Team</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate individuals dedicated to your success
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#D3A16D] to-[#994D35] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#3D444C] to-[#994D35] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">
                    {member.avatar}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#3D444C] mb-1">
                  {member.name}
                </h3>
                <p className="text-[#994D35] text-sm font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================= TESTIMONIAL/QUOTE SECTION ================= */}
      <Section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-[#3D444C] to-[#994D35] rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D3A16D] rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 text-center">
              <FaQuoteLeft className="text-[#D3A16D] text-4xl md:text-5xl mx-auto mb-6 opacity-50" />
              <p className="text-[#E7E3D8] text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed mb-8 italic">
                "The best way to predict your future is to create it. At ACC
                Career Club, we help you create a future you'll be proud of."
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D3A16D] flex items-center justify-center">
                  <FaAward className="text-[#3D444C] text-xl" />
                </div>
                <div className="text-left">
                  <p className="text-[#E7E3D8] font-bold">ACC Career Club</p>
                  <p className="text-[#D3A16D] text-sm">
                    Empowering Students Since 2020
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ================= CTA SECTION ================= */}
      <Section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D444C] mb-4">
              Ready to Start Your{" "}
              <span className="text-[#994D35]">Career Journey?</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of students who are already building their careers
              with ACC Career Club. Your future starts here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#994D35] to-[#D3A16D] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 group"
                >
                  <FaRocket className="group-hover:scale-110 transition-transform" />
                  <span>Get Started</span>
                </motion.button>
              </Link>

              <Link href="/all-notice" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#3D444C] px-8 py-4 rounded-xl font-semibold shadow-lg border-2 border-[#D3A16D]/30 hover:border-[#994D35] transition-all duration-300 group"
                >
                  <span>View Notices</span>
                  <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ================= CONTACT INFO ================= */}
      <Section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-[#D3A16D]/10">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-[#3D444C] mb-2">
              Get In Touch
            </h3>
            <p className="text-gray-600">
              Have questions? We'd love to hear from you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FaMapMarkerAlt,
                title: "Location",
                value: "Adamjee Cantonment College, Dhaka",
              },
              {
                icon: FaEnvelope,
                title: "Email",
                value: "contact@ccacc.club",
              },
              {
                icon: FaPhone,
                title: "Phone",
                value: "+880 1XXX-XXXXXX",
              },
            ].map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#994D35]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-[#994D35] text-xl" />
                  </div>
                  <h4 className="font-bold text-[#3D444C] mb-1">
                    {contact.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{contact.value}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Social Media */}
          <motion.div variants={itemVariants} className="mt-10 text-center">
            <p className="text-gray-500 text-sm mb-4">Follow us on social media</p>
            <div className="flex items-center justify-center gap-4">
              {[
                { icon: FaFacebook, href: "#", color: "#1877F2" },
                { icon: FaLinkedin, href: "#", color: "#0A66C2" },
                { icon: FaTwitter, href: "#", color: "#1DA1F2" },
                { icon: FaInstagram, href: "#", color: "#E4405F" },
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 hover:shadow-xl"
                    style={{ color: social.color }}
                  >
                    <Icon className="text-xl" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
};

export default AboutUsClient;