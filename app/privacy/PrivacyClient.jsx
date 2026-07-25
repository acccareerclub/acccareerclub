// app/privacy/PrivacyClient.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaShieldAlt, 
  FaLock, 
  FaDatabase, 
  FaCookie, 
  FaEnvelope, 
  FaUserSecret,
  FaFileContract,
  FaGlobe,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import Logo from '../assets/logo/Careerclublogo.png';

const PrivacyClient = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12">
                <Image
                  src={Logo}
                  alt="ACC Career Club Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  <span className="text-[#D3A16D]">ACC</span> Career Club
                </h2>
                <p className="text-xs text-white/70">Adamjee Cantonment College</p>
              </div>
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <span>Back to Sign Up</span>
              <FaArrowLeft className="text-xs" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-[#E7E3D8] rounded-xl">
              <FaShieldAlt className="text-[#994D35] text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#3D444C]">Privacy Policy</h1>
              <p className="text-sm text-[#3D444C]/60">Last Updated: July 24, 2026</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-[#E7E3D8]/20 p-4 rounded-lg border-l-4 border-[#D3A16D]">
              <p className="text-[#3D444C]/80 leading-relaxed">
                At ACC Career Club, we take your privacy seriously. This Privacy Policy explains how we 
                collect, use, disclose, and safeguard your personal information when you use our platform. 
                We are committed to protecting your privacy and ensuring your personal information is handled 
                responsibly.
              </p>
            </section>

            {/* Information Collection */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaDatabase className="text-[#D3A16D]" />
                <span>1. Information We Collect</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#E7E3D8]/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#3D444C] mb-2">Personal Information</h4>
                  <ul className="space-y-2 text-sm text-[#3D444C]/70">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Full Name</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Email Address</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Phone Number</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Student ID</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Department</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-[#E7E3D8]/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-[#3D444C] mb-2">Usage Information</h4>
                  <ul className="space-y-2 text-sm text-[#3D444C]/70">
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Login history</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>IP addresses</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Browser type and version</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Device information</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-[#D3A16D] mt-0.5">•</span>
                      <span>Pages visited</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaUserSecret className="text-[#D3A16D]" />
                <span>2. How We Use Your Information</span>
              </h3>
              <div className="space-y-3 text-[#3D444C]/80">
                <div className="flex items-start space-x-3 p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <FaCheckCircle className="text-[#994D35] text-sm mt-0.5 flex-shrink-0" />
                  <p>To create and manage your account and provide access to our services.</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <FaCheckCircle className="text-[#994D35] text-sm mt-0.5 flex-shrink-0" />
                  <p>To communicate with you about career opportunities, events, and updates.</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <FaCheckCircle className="text-[#994D35] text-sm mt-0.5 flex-shrink-0" />
                  <p>To personalize your experience and improve our platform.</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <FaCheckCircle className="text-[#994D35] text-sm mt-0.5 flex-shrink-0" />
                  <p>To maintain the security and integrity of our platform.</p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <FaCheckCircle className="text-[#994D35] text-sm mt-0.5 flex-shrink-0" />
                  <p>To comply with legal obligations and regulatory requirements.</p>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaLock className="text-[#D3A16D]" />
                <span>3. Data Protection</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-4 bg-[#E7E3D8]/10 rounded-lg">
                  <div className="text-3xl mb-2 text-[#994D35]">🔒</div>
                  <h4 className="font-semibold text-[#3D444C] text-sm">Encryption</h4>
                  <p className="text-xs text-[#3D444C]/60 mt-1">All data is encrypted in transit and at rest</p>
                </div>
                <div className="text-center p-4 bg-[#E7E3D8]/10 rounded-lg">
                  <div className="text-3xl mb-2 text-[#994D35]">🛡️</div>
                  <h4 className="font-semibold text-[#3D444C] text-sm">Security</h4>
                  <p className="text-xs text-[#3D444C]/60 mt-1">Regular security audits and monitoring</p>
                </div>
                <div className="text-center p-4 bg-[#E7E3D8]/10 rounded-lg">
                  <div className="text-3xl mb-2 text-[#994D35]">📋</div>
                  <h4 className="font-semibold text-[#3D444C] text-sm">Compliance</h4>
                  <p className="text-xs text-[#3D444C]/60 mt-1">Adherence to data protection regulations</p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaCookie className="text-[#D3A16D]" />
                <span>4. Cookies</span>
              </h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                Cookies help us remember your preferences, understand how you use our services, and improve 
                our platform. You can control cookie settings through your browser preferences.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Essential Cookies', 'Analytics Cookies', 'Preference Cookies'].map((cookie) => (
                  <span key={cookie} className="px-3 py-1 bg-[#E7E3D8]/30 rounded-full text-xs text-[#3D444C]/70">
                    {cookie}
                  </span>
                ))}
              </div>
            </section>

            {/* Third-Party Sharing */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaGlobe className="text-[#D3A16D]" />
                <span>5. Third-Party Sharing</span>
              </h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your 
                information with:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[#3D444C]/70">
                <li className="flex items-start space-x-2">
                  <span className="text-[#D3A16D] mt-0.5">•</span>
                  <span>Service providers who assist us in operating our platform</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#D3A16D] mt-0.5">•</span>
                  <span>Partner organizations for career opportunities (with your consent)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-[#D3A16D] mt-0.5">•</span>
                  <span>Law enforcement when required by law</span>
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaFileContract className="text-[#D3A16D]" />
                <span>6. Your Rights</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <h4 className="font-semibold text-[#3D444C] text-sm">Access</h4>
                  <p className="text-xs text-[#3D444C]/60">Request a copy of your personal data</p>
                </div>
                <div className="p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <h4 className="font-semibold text-[#3D444C] text-sm">Correction</h4>
                  <p className="text-xs text-[#3D444C]/60">Update or correct inaccurate data</p>
                </div>
                <div className="p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <h4 className="font-semibold text-[#3D444C] text-sm">Deletion</h4>
                  <p className="text-xs text-[#3D444C]/60">Request deletion of your personal data</p>
                </div>
                <div className="p-3 bg-[#E7E3D8]/10 rounded-lg">
                  <h4 className="font-semibold text-[#3D444C] text-sm">Portability</h4>
                  <p className="text-xs text-[#3D444C]/60">Receive your data in a portable format</p>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaEnvelope className="text-[#D3A16D]" />
                <span>7. Contact Us</span>
              </h3>
              <div className="bg-[#E7E3D8]/20 p-4 rounded-lg">
                <p className="text-[#3D444C]/80 leading-relaxed">
                  If you have any questions about this Privacy Policy or how we handle your personal 
                  information, please contact us:
                </p>
                <div className="mt-3 space-y-1 text-sm text-[#3D444C]/70">
                  <p><strong>Email:</strong> careerclub@acc.edu.bd</p>
                  <p><strong>Phone:</strong> +880-2-1234567</p>
                  <p><strong>Address:</strong> Adamjee Cantonment College, Dhaka, Bangladesh</p>
                  <p><strong>Privacy Officer:</strong> [Privacy Officer Name]</p>
                </div>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3">8. Changes to This Policy</h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last Updated" date. We encourage you 
                to review this policy periodically.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-[#E7E3D8]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-[#994D35]" />
                <span className="text-sm text-[#3D444C]/70">
                  Your privacy is protected by ACC Career Club
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Link 
                  href="/terms"
                  className="text-sm text-[#994D35] hover:text-[#D3A16D] transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <span className="text-[#3D444C]/20">|</span>
                <Link 
                  href="/signup"
                  className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg font-medium hover:bg-[#3D444C] transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Agree & Continue
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyClient;