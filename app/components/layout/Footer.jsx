// app/components/layout/Footer.jsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHeart,
} from "react-icons/fa";
import Logo from "../../assets/logo/Careerclublogo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Facebook",
      icon: <FaFacebookF />,
      url: "https://www.facebook.com/ACC.CareerClub",
      color: "hover:bg-[#1877f2]",
    },
  ];

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "Sessions", href: "/sessions" },
    { name: "Events", href: "/events" },
    { name: "Articles", href: "/articles" },
    { name: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <footer className="bg-[#3D444C] text-white/90">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 - Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                <Image
                  src={Logo}
                  alt="ACC Career Club Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#E7E3D8]">
                  <span className="text-[#D3A16D]">ACC</span> Career Club
                </h2>
                <p className="text-xs text-white/60">
                  Adamjee Cantonment College
                </p>
              </div>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed">
              Empowering students and alumni with career opportunities,
              professional development, and networking resources.
            </p>

            {/* Social Links - Using Link for external links (next/link doesn't support external, so using <a> is correct) */}
            <div className="flex space-x-2 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 ${social.color} hover:scale-110 hover:shadow-lg`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-[#E7E3D8] mb-4 relative">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[#D3A16D]"></span>
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-[#D3A16D] transition-all duration-200 flex items-center group"
                  >
                    <FaArrowRight className="text-[#D3A16D] text-xs mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-all duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h3 className="text-lg font-semibold text-[#E7E3D8] mb-4 relative">
              Support
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[#D3A16D]"></span>
            </h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-[#D3A16D] transition-all duration-200 flex items-center group"
                  >
                    <FaArrowRight className="text-[#D3A16D] text-xs mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    <span className="group-hover:translate-x-1 transition-all duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact Info & Articles */}
          <div>
            <h3 className="text-lg font-semibold text-[#E7E3D8] mb-4 relative">
              Get in Touch
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[#D3A16D]"></span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 group">
                <FaMapMarkerAlt className="text-[#D3A16D] text-lg mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <p className="text-sm text-white/70 leading-relaxed">
                  Adamjee Cantonment College
                  <br />
                  Dhaka, Bangladesh
                </p>
              </div>

              <div className="flex items-center space-x-3 group">
                <FaEnvelope className="text-[#D3A16D] text-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <a
                  href="mailto:acccareerclub@gmail.com"
                  className="text-sm text-white/70 hover:text-[#D3A16D] transition-colors duration-200"
                >
                  acccareerclub@gmail.com
                </a>
              </div>
            </div>

            {/* Articles Signup - Updated for mobile */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/60 mb-2">
                Subscribe to our articles
              </p>
              <form
                className="flex flex-col sm:flex-row gap-2 sm:gap-0"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full sm:flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:border-[#D3A16D] transition-colors duration-200 text-white placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-[#994D35] hover:bg-[#D3A16D] transition-all duration-300 rounded-lg sm:rounded-r-lg sm:rounded-l-none text-sm font-semibold hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/50 text-center sm:text-left">
            © {currentYear}{" "}
            <span className="text-[#D3A16D]">ACC Career Club</span>. All rights
            reserved. Made with{" "}
            <FaHeart className="inline text-red-500 text-xs animate-pulse" /> by
            <a href="https://www.facebook.com/sabbir183023" className="text-blue-500"> Sabbir</a>
          </p>

          <div className="flex items-center space-x-4 text-xs text-white/40">
            <Link
              href="/privacy"
              className="hover:text-[#D3A16D] transition-colors duration-200"
            >
              Privacy
            </Link>
            <span className="w-px h-3 bg-white/20"></span>
            <Link
              href="/terms"
              className="hover:text-[#D3A16D] transition-colors duration-200"
            >
              Terms
            </Link>
            <span className="w-px h-3 bg-white/20"></span>
            <Link
              href="/cookies"
              className="hover:text-[#D3A16D] transition-colors duration-200"
            >
              Cookies
            </Link>
            <span className="w-px h-3 bg-white/20"></span>
            <Link
              href="/sitemap"
              className="hover:text-[#D3A16D] transition-colors duration-200"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
