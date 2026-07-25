// app/terms/TermsClient.jsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaGavel, FaCheckCircle, FaShieldAlt, FaUserLock, FaClipboardList, FaHandshake, FaArrowLeft } from 'react-icons/fa';
import Logo from '../assets/logo/Careerclublogo.png';

const TermsClient = () => {
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
              <FaGavel className="text-[#994D35] text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#3D444C]">Terms of Service</h1>
              <p className="text-sm text-[#3D444C]/60">Last Updated: July 24, 2026</p>
            </div>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaHandshake className="text-[#D3A16D]" />
                <span>1. Introduction</span>
              </h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                Welcome to the ACC Career Club platform, operated by Adamjee Cantonment College. 
                By accessing or using our platform, you agree to comply with and be bound by the 
                following Terms of Service. Please read these terms carefully before using our services.
              </p>
            </section>

            {/* Acceptance */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaCheckCircle className="text-[#D3A16D]" />
                <span>2. Acceptance of Terms</span>
              </h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                By creating an account, accessing, or using the ACC Career Club platform, you acknowledge 
                that you have read, understood, and agree to be bound by these Terms of Service. If you do 
                not agree to these terms, please do not use our platform.
              </p>
              <div className="mt-3 bg-[#E7E3D8]/30 p-4 rounded-lg border-l-4 border-[#D3A16D]">
                <p className="text-sm text-[#3D444C]/70">
                  <strong>Eligibility:</strong> You must be a current student or alumni of Adamjee Cantonment 
                  College to create an account. By registering, you confirm that you meet this eligibility requirement.
                </p>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaUserLock className="text-[#D3A16D]" />
                <span>3. User Accounts</span>
              </h3>
              <ul className="space-y-3 text-[#3D444C]/80 leading-relaxed">
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>You agree to provide accurate and complete information during registration.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>You are solely responsible for all activities that occur under your account.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>You must notify us immediately of any unauthorized use of your account.</p>
                </li>
              </ul>
            </section>

            {/* User Obligations */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaClipboardList className="text-[#D3A16D]" />
                <span>4. User Obligations</span>
              </h3>
              <ul className="space-y-3 text-[#3D444C]/80 leading-relaxed">
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>Use the platform in accordance with all applicable laws and regulations.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>Respect the rights and privacy of other users and community members.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>Do not engage in any activity that could harm the platform or its users.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-[#D3A16D] font-bold mt-0.5">•</span>
                  <p>Provide accurate information and keep your profile updated.</p>
                </li>
              </ul>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3">5. Prohibited Activities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Impersonating others or providing false information',
                  'Sharing inappropriate or offensive content',
                  'Attempting to gain unauthorized access',
                  'Using the platform for illegal purposes',
                  'Harassing or abusing other users',
                  'Distributing malware or viruses',
                  'Posting spam or unwanted advertisements',
                  'Sharing copyrighted material without permission'
                ].map((item, index) => (
                  <div key={index} className="bg-[#E7E3D8]/20 p-3 rounded-lg flex items-start space-x-2">
                    <span className="text-red-500 text-sm mt-0.5">✕</span>
                    <span className="text-sm text-[#3D444C]/80">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Privacy */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3 flex items-center space-x-2">
                <FaShieldAlt className="text-[#D3A16D]" />
                <span>6. Privacy Policy</span>
              </h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and 
                protect your personal information. By using our platform, you consent to our data practices 
                as described in the Privacy Policy.
              </p>
              <div className="mt-3 p-3 bg-[#E7E3D8]/30 rounded-lg">
                <Link href="/privacy" className="text-[#994D35] hover:text-[#D3A16D] font-medium transition-colors duration-200 flex items-center space-x-2">
                  <span>Read our Privacy Policy</span>
                  <FaArrowLeft className="text-xs rotate-180" />
                </Link>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3">7. Termination</h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                We reserve the right to suspend or terminate your account at our discretion if we believe 
                you have violated these Terms of Service. You may also terminate your account at any time 
                by contacting us at careerclub@acc.edu.bd.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3">8. Disclaimer of Warranties</h3>
              <div className="bg-[#E7E3D8]/20 p-4 rounded-lg border border-[#D3A16D]/30">
                <p className="text-[#3D444C]/80 leading-relaxed text-sm">
                  The ACC Career Club platform is provided "as is" and "as available" without any warranties 
                  of any kind. We do not guarantee that the platform will be error-free, secure, or continuously 
                  available. We are not responsible for any damages or losses resulting from your use of the platform.
                </p>
              </div>
            </section>

            {/* Changes */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3">9. Changes to Terms</h3>
              <p className="text-[#3D444C]/80 leading-relaxed">
                We may update these Terms of Service from time to time. We will notify you of any changes 
                by posting the new terms on this page. Your continued use of the platform after any changes 
                constitutes your acceptance of the new terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold text-[#994D35] mb-3">10. Contact Us</h3>
              <div className="bg-[#E7E3D8]/20 p-4 rounded-lg">
                <p className="text-[#3D444C]/80 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-2 space-y-1 text-sm text-[#3D444C]/70">
                  <p><strong>Email:</strong> careerclub@acc.edu.bd</p>
                  <p><strong>Phone:</strong> +880-2-1234567</p>
                  <p><strong>Address:</strong> Adamjee Cantonment College, Dhaka, Bangladesh</p>
                </div>
              </div>
            </section>
          </div>

          {/* Agreement Footer */}
          <div className="mt-10 pt-6 border-t border-[#E7E3D8]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <FaCheckCircle className="text-[#994D35]" />
                <span className="text-sm text-[#3D444C]/70">
                  By using ACC Career Club, you agree to our Terms of Service
                </span>
              </div>
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
  );
};

export default TermsClient;