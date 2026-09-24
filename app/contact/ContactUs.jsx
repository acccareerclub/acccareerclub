// app/contact/ContactUs.jsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaEnvelope,
  FaPhone,
  FaUserTie,
  FaLaptopCode,
  FaUserShield,
  FaChalkboardTeacher,
  FaMapMarkerAlt,
  FaArrowRight,
  FaSpinner,
  FaInfoCircle,
  FaUniversity,
  FaClock,
  FaWhatsapp,
  FaFacebookMessenger,
} from "react-icons/fa";
import toast from "react-hot-toast";

const AVATAR_FALLBACK =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/default-avatar.png";

const ICON_MAP = {
  it: FaLaptopCode,
  prefect: FaUserShield,
  assistant: FaUserTie,
  moderator: FaChalkboardTeacher,
};

// Normalize a phone for WhatsApp:
// - strip all non-digits
// - if it starts with 0 (BD local), prepend 880
// - if it starts with 880 already, leave as is
const toWhatsAppNumber = (raw) => {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return `880${digits.slice(1)}`;
  return digits;
};

const ContactUs = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/users/contact", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json.success) setData(json);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Always render all three "primary" role cards — even if vacant.
  // The API may return an empty array for a role; we still show the card.
  const getHelper = (key) => {
    if (!data?.helpers) return null;
    return data.helpers.find((h) => h.key === key) || null;
  };

  const itHelper = getHelper("itsecretary");
  const prefectHelper = getHelper("prefect");
  const assistantHelper = getHelper("assistant_prefect");

  const allThreeVacant =
    !loading &&
    (!itHelper || itHelper.members.length === 0) &&
    (!prefectHelper || prefectHelper.members.length === 0) &&
    (!assistantHelper || assistantHelper.members.length === 0);

  return (
    <div className="min-h-screen bg-[#E7E3D8]">
      {/* ============================================================
          HERO
      ============================================================ */}
      <section className="relative w-full bg-[#3D444C] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 80% at 15% 0%, rgba(153,77,53,0.55), transparent 60%), radial-gradient(ellipse 50% 70% at 90% 100%, rgba(211,161,109,0.45), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #D3A16D 1px, transparent 1px), linear-gradient(to bottom, #D3A16D 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D3A16D]/70 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 mb-5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D3A16D]">
              We're here to help
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#E7E3D8] leading-tight">
            Get in Touch with{" "}
            <span className="text-[#D3A16D]">ACC Career Club</span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-[#E7E3D8]/70 leading-relaxed">
            Whether it's a technical issue with the platform or an
            administrative query about club activities — reach out to the right
            person below and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ============================================================
          HELPER CARDS — always show all three
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 pb-10">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FaSpinner className="animate-spin text-3xl text-[#994D35] mx-auto" />
            <p className="text-[#3D444C]/60 text-sm mt-3">
              Loading contact information…
            </p>
          </div>
        ) : allThreeVacant ? (
          <FallbackNotice />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <HelperCard
              helper={
                itHelper || {
                  key: "itsecretary",
                  label: "IT Secretary",
                  tagline: "Technical help & platform support",
                  icon: "it",
                  accent: "#994D35",
                  members: [],
                }
              }
            />
            <HelperCard
              helper={
                prefectHelper || {
                  key: "prefect",
                  label: "Prefect",
                  tagline: "Administrative & club operations",
                  icon: "prefect",
                  accent: "#3D444C",
                  members: [],
                }
              }
            />
            <HelperCard
              helper={
                assistantHelper || {
                  key: "assistant_prefect",
                  label: "Assistant Prefect",
                  tagline: "Administrative support & coordination",
                  icon: "assistant",
                  accent: "#D3A16D",
                  members: [],
                }
              }
            />
          </div>
        )}
      </section>

      {/* ============================================================
          VISIT US + MAP + QUICK ACTIONS
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-[#3D444C]/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: address + map */}
            <div className="p-6 sm:p-10">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-[#994D35] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
                  Visit Us
                </h2>
              </div>

              <div className="space-y-5">
                <InfoLine
                  icon={<FaUniversity className="text-[#D3A16D]" />}
                  label="Institution"
                  value="Adamjee Cantonment College"
                />
                <InfoLine
                  icon={<FaMapMarkerAlt className="text-[#D3A16D]" />}
                  label="Address"
                  value="Adamjee Cantonment College, Dhaka Cantonment, Dhaka, Bangladesh"
                />
                <InfoLine
                  icon={<FaClock className="text-[#D3A16D]" />}
                  label="Office Hours"
                  value="Sunday – Thursday · 8:00 AM – 2:00 PM (Except Govt. Holidy)"
                />
              </div>

              {/* Map embed */}
              <div className="mt-6 rounded-xl overflow-hidden border border-[#3D444C]/10 shadow-sm">
                <iframe
                  title="Adamjee Cantonment College location"
                  src="https://www.google.com/maps?q=Adamjee+Cantonment+College,+Dhaka+Cantonment,+Dhaka,+Bangladesh&output=embed"
                  className="w-full h-64 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="mt-5 pt-5 border-t border-[#3D444C]/10">
                <p className="text-xs text-[#3D444C]/60 leading-relaxed">
                  Walk-in visits are welcome during office hours. For the
                  fastest response, please contact the relevant club officer
                  above first.
                </p>
              </div>
            </div>

            {/* Right: quick actions */}
            <div className="p-6 sm:p-10 bg-gradient-to-br from-[#3D444C] to-[#2a3037] text-[#E7E3D8]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-6 bg-[#D3A16D] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold">Quick Actions</h2>
              </div>

              <p className="text-sm text-[#E7E3D8]/70 mb-6 leading-relaxed">
                Prefer a different channel? These are the fastest ways to reach
                the club.
              </p>

              <div className="space-y-3">
                <ActionRow
                  icon={<FaFacebookMessenger />}
                  label="Facebook Page"
                  description="Send a message on Facebook"
                  href="https://www.facebook.com/ACC.CareerClub"
                  accent="#D3A16D"
                />
                <ActionRow
                  icon={<FaEnvelope />}
                  label="General Email"
                  description="accareerclub@gmail.com"
                  href="mailto:accareerclub@gmail.com"
                  accent="#D3A16D"
                />
                <ActionRow
                  icon={<FaLaptopCode />}
                  label="Platform Support"
                  description="For technical issues with the website"
                  href="#"
                  accent="#994D35"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER NOTE
      ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
        <div className="bg-[#E7E3D8]/60 border border-dashed border-[#3D444C]/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-[#3D444C]/70">
            Can't find the right person? Reach out to the club's{" "}
            <span className="font-semibold text-[#994D35]">
              faculty Moderator
            </span>{" "}
            directly at the college, or send us a message on Facebook — we'll
            route you to the right officer.
          </p>
        </div>
      </section>
    </div>
  );
};

// ============================================================
// Helper Card — always rendered, shows vacant state if empty
// ============================================================
const HelperCard = ({ helper }) => {
  const Icon = ICON_MAP[helper.icon] || FaUserTie;
  const members = helper.members || [];
  const isEmpty = members.length === 0;

  return (
    <div className="relative bg-white rounded-2xl shadow-lg border border-[#3D444C]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Colored top strip */}
      <div className="h-1.5" style={{ backgroundColor: helper.accent }} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: helper.accent }}
          >
            <Icon className="text-lg" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#3D444C] text-base leading-tight">
              {helper.label}
            </h3>
            <p className="text-xs text-[#3D444C]/60 truncate">
              {helper.tagline}
            </p>
          </div>
        </div>

        {/* Members OR vacant state */}
        {isEmpty ? (
          <VacantSlot accent={helper.accent} />
        ) : (
          <div className="space-y-3">
            {members.map((m) => (
              <MemberRow key={m._id} member={m} accent={helper.accent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Vacant slot — shown inside a card when no one holds the post
// ============================================================
const VacantSlot = ({ accent }) => (
  <div
    className="flex-1 flex flex-col items-center justify-center text-center p-5 rounded-xl border-2 border-dashed"
    style={{
      borderColor: `${accent}55`,
      backgroundColor: `${accent}0d`,
    }}
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
      style={{ backgroundColor: `${accent}22` }}
    >
      <FaInfoCircle className="text-base" style={{ color: accent }} />
    </div>
    <p
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color: accent }}
    >
      Post is Vacant for now
    </p>
    <p className="text-[11px] text-[#3D444C]/60 mt-1.5 leading-relaxed">
      For matters related to this post, please visit the college and contact the
      club's faculty Moderator directly.
    </p>
  </div>
);

// ============================================================
// Member Row (avatar + name + contact info as visible text)
// ============================================================
const MemberRow = ({ member, accent }) => {
  const hasEmail = !!member.email;
  const hasPhone = !!member.phone;
  const waNumber = toWhatsAppNumber(member.phone);
  const waMessage = encodeURIComponent(
    `Hello ${member.fullName}, I'm reaching out through the ACC Career Club website.`,
  );
  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : "#";

  return (
    <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#3D444C]/8">
      {/* Top row: avatar + name + department */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#E7E3D8] shrink-0 ring-2 ring-white shadow-sm">
          <Image
            src={member.profilePicture || AVATAR_FALLBACK}
            alt={member.fullName}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#3D444C] truncate">
            {member.fullName}
          </p>
          <p className="text-xs text-[#3D444C]/60 truncate">
            {member.executiveBranch || member.department || "ACC Career Club"}
          </p>
        </div>
      </div>

      {/* Contact block — visible info + action buttons */}
      <div className="mt-3 space-y-2">
        {/* EMAIL */}
        {hasEmail && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1a` }}
            >
              <FaEnvelope className="text-[11px]" style={{ color: accent }} />
            </div>
            <a
              href={`mailto:${member.email}`}
              className="flex-1 min-w-0 text-[12px] font-medium text-[#3D444C] hover:text-[#994D35] transition-colors truncate"
              title={`Send email to ${member.email}`}
            >
              {member.email}
            </a>
          </div>
        )}

        {/* PHONE + WhatsApp */}
        {hasPhone && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accent}1a` }}
            >
              <FaPhone className="text-[10px]" style={{ color: accent }} />
            </div>
            <a
              href={`tel:${member.phone}`}
              className="flex-1 min-w-0 text-[12px] font-medium text-[#3D444C] hover:text-[#994D35] transition-colors truncate"
              title={`Call ${member.phone}`}
            >
              {member.phone}
            </a>
            {waNumber && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-[#25D366] text-white hover:bg-[#1ea952] transition-colors"
                title={`WhatsApp ${member.phone}`}
              >
                <FaWhatsapp className="text-[11px]" />
                WhatsApp
              </a>
            )}
          </div>
        )}

        {/* If neither — shouldn't happen but a graceful note */}
        {!hasEmail && !hasPhone && (
          <p className="text-[11px] text-[#3D444C]/50 italic">
            No contact details on file.
          </p>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Fallback — only shown when ALL THREE roles are vacant
// ============================================================
const FallbackNotice = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-[#3D444C]/10 p-6 sm:p-10">
    <div className="flex flex-col sm:flex-row items-start gap-5">
      <div className="w-14 h-14 rounded-2xl bg-[#994D35]/15 flex items-center justify-center shrink-0">
        <FaInfoCircle className="text-[#994D35] text-2xl" />
      </div>
      <div className="flex-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C] mb-2">
          These posts are currently empty
        </h2>
        <p className="text-sm text-[#3D444C]/70 leading-relaxed mb-4">
          The officer positions below are currently vacant. Please visit{" "}
          <span className="font-semibold text-[#3D444C]">
            Adamjee Cantonment College
          </span>{" "}
          in person and reach out to the club's faculty{" "}
          <span className="font-semibold text-[#994D35]">
            Moderator (teacher)
          </span>{" "}
          directly for any technical or administrative matters.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {["IT Secretary", "Prefect", "Assistant Prefect"].map((label) => (
            <div
              key={label}
              className="text-center p-2 rounded-lg bg-[#E7E3D8]/60 border border-dashed border-[#3D444C]/20"
            >
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#3D444C]/50">
                Vacant
              </p>
              <p className="text-xs font-semibold text-[#3D444C] mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-[#3D444C]/10">
          <InfoLine
            icon={<FaUniversity className="text-[#D3A16D]" />}
            label="Where to go"
            value="Adamjee Cantonment College, Dhaka Cantonment"
          />
          <InfoLine
            icon={<FaClock className="text-[#D3A16D]" />}
            label="When"
            value="Sunday – Thursday · 8:00 AM – 2:00 PM (Except Govt. Holidy)"
          />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// Small helpers
// ============================================================
const InfoLine = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 flex-1 min-w-[220px]">
    <div className="mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-[#3D444C]/50 font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm text-[#3D444C] font-medium break-words">{value}</p>
    </div>
  </div>
);

const ActionRow = ({ icon, label, description, href, accent }) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] hover:border-[#D3A16D]/50 transition-all group"
  >
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      style={{ backgroundColor: accent }}
    >
      <span className="text-white text-sm">{icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-[#E7E3D8]">{label}</p>
      <p className="text-xs text-[#E7E3D8]/60 truncate">{description}</p>
    </div>
    <FaArrowRight className="text-[#D3A16D] text-xs transition-transform group-hover:translate-x-0.5" />
  </a>
);

export default ContactUs;
