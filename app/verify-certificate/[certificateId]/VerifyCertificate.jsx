// app/verify-certificate/[certificateId]/VerifyCertificate.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaUserShield,
  FaUserTie,
  FaUserGraduate,
  FaUserCog,
  FaClipboardCheck,
  FaSearch,
} from "react-icons/fa";

// ==========================================
// COLOR PALETTE
// ==========================================
const COLORS = {
  bg: "#E7E3D8",
  card: "#FFFFFF",
  primary: "#3D444C",
  accent: "#D3A16D",
  accentDark: "#994D35",
  success: "#059669",
  successBg: "#ECFDF5",
  successBorder: "#A7F3D0",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  shimmer: "#F2EFE6",
  shimmerHi: "#FFFFFF",
};

// ==========================================
// ROLE ICON MAP
// ==========================================
const RoleIcon = ({ role }) => {
  const size = 16;
  if (role === "prefect") return <FaUserShield size={size} />;
  if (role === "assistant_prefect") return <FaUserGraduate size={size} />;
  if (role === "itsecretary") return <FaUserCog size={size} />;
  if (role === "modarator" || role === "moderator")
    return <FaUserTie size={size} />;
  return <FaUserShield size={size} />;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const VerifyCertificate = ({ certificateId }) => {
  const [state, setState] = useState({
    loading: true,
    verified: false,
    certificate: null,
    contacts: [],
    message: "",
    error: false,
  });

  // ==========================================
  // FETCH VERIFICATION
  // ==========================================
  useEffect(() => {
    if (!certificateId) return;

    const verify = async () => {
      setState((s) => ({ ...s, loading: true, error: false }));
      try {
        const res = await fetch(
          `/api/users/certificates/verify-certificate/${encodeURIComponent(
            certificateId,
          )}`,
        );
        const data = await res.json();

        setState({
          loading: false,
          verified: !!data.verified,
          certificate: data.certificate || null,
          contacts: data.contacts || [],
          message: data.message || "",
          error: !data.success,
        });
      } catch (err) {
        console.error(err);
        setState({
          loading: false,
          verified: false,
          certificate: null,
          contacts: [],
          message: "Unable to reach the verification service.",
          error: true,
        });
      }
    };

    verify();
  }, [certificateId]);

  // ==========================================
  // SHIMMER
  // ==========================================
  if (state.loading) {
    return (
      <div
        className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
        style={{ background: COLORS.bg }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <ShimmerBlock className="h-24 w-full" />
          <ShimmerBlock className="h-40 w-full" />
          <ShimmerBlock className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8"
      style={{ background: COLORS.bg }}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header badge */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{
              background: `${COLORS.accent}25`,
              color: COLORS.accentDark,
            }}
          >
            <FaClipboardCheck size={10} /> Certificate Verification
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: COLORS.primary }}
          >
            ACC Career Club Certificate
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Verification result for{" "}
            <span className="font-mono font-semibold">{certificateId}</span>
          </p>
        </div>

        {/* ==========================================
            VERIFIED PANEL
           ========================================== */}
        {state.verified ? (
          <div
            className="rounded-2xl border overflow-hidden shadow-lg"
            style={{
              background: COLORS.successBg,
              borderColor: COLORS.successBorder,
            }}
          >
            <div className="p-5 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: COLORS.success, color: "#fff" }}
              >
                <FaCheckCircle size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.success }}
                >
                  Certificate Verified ✓
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                  This certificate is authentic and was issued by{" "}
                  <strong>ACC Career Club</strong>.
                </p>
              </div>
            </div>

            {/* Details */}
            <div
              className="border-t px-5 py-4 bg-white"
              style={{ borderColor: COLORS.successBorder }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailRow
                  label="Certificate ID"
                  value={state.certificate.certificateId}
                  mono
                />
                <DetailRow
                  label="Certificate Type"
                  value={formatType(state.certificate.certificateType)}
                />
                <DetailRow label="Title" value={state.certificate.title} span />
                <DetailRow
                  label="Recipient"
                  value={`${state.certificate.recipient.fullName}`}
                />
                {state.certificate.recipient.studentId && (
                  <DetailRow
                    label="Student ID"
                    value={state.certificate.recipient.studentId}
                    mono
                  />
                )}
                {state.certificate.recipient.institution && (
                  <DetailRow
                    label="Institution"
                    value={state.certificate.recipient.institution}
                  />
                )}
                {state.certificate.recipient.identificationNo && (
                  <DetailRow
                    label="Identification No"
                    value={state.certificate.recipient.identificationNo}
                    mono
                  />
                )}

                {state.certificate.event && (
                  <>
                    <DetailRow
                      label="Event"
                      value={state.certificate.event.eventName}
                    />
                    {state.certificate.event.eventDate && (
                      <DetailRow
                        label="Event Date"
                        value={new Date(
                          state.certificate.event.eventDate,
                        ).toLocaleDateString()}
                      />
                    )}
                    {state.certificate.event.eventLocation && (
                      <DetailRow
                        label="Event Location"
                        value={state.certificate.event.eventLocation}
                      />
                    )}
                  </>
                )}

                {state.certificate.achievementTitle && (
                  <DetailRow
                    label="Achievement"
                    value={state.certificate.achievementTitle}
                  />
                )}

                <DetailRow
                  label="Issued By"
                  value={`${
                    state.certificate.issuedBy.designation
                      ? `${state.certificate.issuedBy.designation}`
                      : ""
                  }`}
                />

                <DetailRow
                  label="Issued On"
                  value={new Date(
                    state.certificate.createdAt,
                  ).toLocaleDateString()}
                />

                <DetailRow
                  label="Signature Type"
                  value={formatSignatureType(state.certificate.signatureType)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
             NOT VERIFIED PANEL
             ========================================== */
          <div
            className="rounded-2xl border overflow-hidden shadow-lg"
            style={{
              background: COLORS.dangerBg,
              borderColor: COLORS.dangerBorder,
            }}
          >
            <div className="p-5 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: COLORS.danger, color: "#fff" }}
              >
                <FaTimesCircle size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-bold"
                  style={{ color: COLORS.danger }}
                >
                  Certificate Not Verified
                </h2>
                <p className="text-sm text-gray-700 mt-1">
                  {state.message ||
                    "We couldn't find a certificate with this ID in our records."}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  If you believe this is a mistake, please contact one of the
                  officials listed below for manual verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
    DEEP VERIFICATION CONTACTS
   ========================================== */}
        {state.contacts.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-xl">
            {/* Header */}
            <div
              className="relative px-6 py-6"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2a3037 100%)`,
              }}
            >
              {/* Decorative dots */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, ${COLORS.bg} 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `${COLORS.accent}10`,
                    border: `1px solid ${COLORS.accent}60`,
                    color: COLORS.accent,
                  }}
                >
                  <FaSearch size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-base font-bold tracking-wide"
                    style={{ color: COLORS.bg }}
                  >
                    Need Deep Verification?
                  </h2>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: `${COLORS.bg}CC` }}
                  >
                    Reach out to any official below to confirm this certificate
                    manually. They can cross-check the recipient, event, and
                    issuing details with our records.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider stripe */}
            <div
              className="h-1"
              style={{
                background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              }}
            />

            {/* Contact cards */}
            <div
              className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-3"
              style={{ background: COLORS.card }}
            >
              {state.contacts.map((c, idx) => (
                <ContactCard key={idx} contact={c} />
              ))}
            </div>

            {/* Footer note */}
            <div
              className="px-5 py-3 text-center text-[11px] leading-relaxed border-t"
              style={{
                background: `${COLORS.bg}66`,
                borderColor: `${COLORS.accent}33`,
                color: `${COLORS.primary}BB`,
              }}
            >
              These officials can verify the certificate using the ID{" "}
              <span
                className="font-mono font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: `${COLORS.accent}22`,
                  color: COLORS.accentDark,
                }}
              >
                {certificateId}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ACC Career Club —{" "}
            <Link
              href="/"
              className="hover:underline"
              style={{ color: COLORS.accentDark }}
            >
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CONTACT CARD
// ==========================================
const ContactCard = ({ contact }) => {
  const [copied, setCopied] = React.useState(null); // "email" | "phone" | null

  const copy = async (value, key) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch (_) {}
  };

  const initials = (contact.fullName || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="group rounded-2xl border p-4 transition-all hover:shadow-md"
      style={{
        background: COLORS.card,
        borderColor: `${COLORS.accent}33`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Initial badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm tracking-wide"
          style={{
            background: `${COLORS.primary}`,
            color: COLORS.accent,
            border: `1px solid ${COLORS.accent}55`,
          }}
        >
          {initials || <RoleIcon role={contact.role} />}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <p
            className="font-semibold text-sm leading-tight truncate"
            style={{ color: COLORS.primary }}
          >
            {contact.fullName}
          </p>

          {/* Role chip */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{
                background: `${COLORS.accent}22`,
                color: COLORS.accentDark,
              }}
            >
              <RoleIcon role={contact.role} />
              {contact.roleLabel}
            </span>
            {contact.executiveBranch && (
              <span
                className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: `${COLORS.primary}10`,
                  color: COLORS.primary,
                }}
              >
                {contact.executiveBranch}
              </span>
            )}
          </div>

          {/* Contact rows */}
          <div className="mt-3 space-y-1.5">
            {contact.email && (
              <ContactRow
                icon={<FaEnvelope size={11} />}
                label={contact.email}
                href={`mailto:${contact.email}`}
                onCopy={() => copy(contact.email, "email")}
                copied={copied === "email"}
              />
            )}
            {contact.phone && (
              <ContactRow
                icon={<FaPhone size={11} />}
                label={contact.phone}
                href={`tel:${contact.phone}`}
                onCopy={() => copy(contact.phone, "phone")}
                copied={copied === "phone"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CONTACT ROW (email / phone)
// ==========================================
const ContactRow = ({ icon, label, href, onCopy, copied }) => (
  <div
    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
    style={{ background: `${COLORS.bg}80` }}
  >
    <span style={{ color: COLORS.accentDark }} className="flex-shrink-0">
      {icon}
    </span>
    <a
      href={href}
      className="flex-1 min-w-0 text-[11px] font-medium truncate hover:underline"
      style={{ color: COLORS.primary }}
    >
      {label}
    </a>
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy"
      className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded transition-all"
      style={{
        background: copied ? COLORS.accentDark : `${COLORS.accent}22`,
        color: copied ? COLORS.bg : COLORS.accentDark,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  </div>
);

// ==========================================
// DETAIL ROW
// ==========================================
const DetailRow = ({ label, value, mono, span }) => (
  <div className={span ? "sm:col-span-2" : ""}>
    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium mb-0.5">
      {label}
    </p>
    <p
      className={`text-[#3D444C] font-medium break-words ${
        mono ? "font-mono text-xs" : "text-sm"
      }`}
    >
      {value || "—"}
    </p>
  </div>
);

// ==========================================
// SHIMMER
// ==========================================
const ShimmerBlock = ({ className = "" }) => (
  <div
    className={`rounded-2xl ${className}`}
    style={{
      background: `linear-gradient(90deg, ${COLORS.shimmer} 0%, ${COLORS.shimmerHi} 50%, ${COLORS.shimmer} 100%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s ease-in-out infinite",
    }}
  />
);

// ==========================================
// UTILS
// ==========================================
const formatSignatureType = (type) => {
  const map = {
    system_generated: "System Generated",
    moderator_signed: "Moderator Signed",
    moderator_and_principal_signed: "Moderator & Principal Signed",
    custom: "Custom Signatories",
  };
  return map[type] || formatType(type);
};

const formatType = (type) => {
  if (!type) return "—";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// ==========================================
// GLOBAL KEYFRAMES
// ==========================================
if (typeof document !== "undefined") {
  const styleId = "shimmer-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
    document.head.appendChild(style);
  }
}

export default VerifyCertificate;
