// app/certificates/[userId]/MyCertificates.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  FaExclamationTriangle,
  FaFileSignature,
  FaArrowRight,
  FaPrint,
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
  shimmer: "#F2EFE6",
  shimmerHi: "#FFFFFF",
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const MyCertificates = ({ userId }) => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // AUTH GUARD
  // ==========================================
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const authUserId = user.id || user._id;
    if (String(authUserId) !== String(userId)) {
      router.push(`/certificates/${authUserId}`);
    }
  }, [user, authLoading, userId, router]);

  // ==========================================
  // FETCH
  // ==========================================
  useEffect(() => {
    if (authLoading || !user) return;

    const authUserId = user.id || user._id;
    if (String(authUserId) !== String(userId)) return;

    const fetchCerts = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/secure/certificates/user/${userId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setCertificates(data.certificates || []);
        } else {
          setError(data.message || "Failed to load certificates");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };

    fetchCerts();
  }, [userId, user, authLoading]);

  // ==========================================
  // PRINT (kept here so users can still print
  // quickly from the list without opening the page)
  // ==========================================
  const handlePrint = (cert) => {
    if (!cert) return;

    const bgUrl =
      cert.background?.url ||
      "https://res.cloudinary.com/ffuatrrt/image/upload/v1790161104/certificate_back_1_sxzqf8.jpg";

    const verifyBase =
      process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";
    const verifyUrl = `${verifyBase}/verify-certificate/${cert.certificateId}`;
    const signatureType = cert.signatureType || "system_generated";

    const qrImg = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(
      verifyUrl,
    )}" alt="QR" width="120" height="120" style="display:block;" />`;

    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const safeTitle = esc(cert.title || "");
    const safeName = esc(cert.recipient?.fullName || "");
    const safeDesc = esc(cert.description || "");
    const safeEvent = esc(cert.event?.eventName || "");
    const safeEventDate = cert.event?.eventDate
      ? new Date(cert.event.eventDate).toLocaleDateString()
      : "";
    const safeAchievement = esc(cert.achievementTitle || "");
    const safeId = esc(cert.certificateId || "");

    const signatureBlockHtml = (() => {
      if (signatureType === "system_generated") {
        return `
          <div style="display:flex;flex-direction:column;align-items:center;gap:6pt;">
            <div class="qr-wrap">${qrImg}</div>
            <p class="system-note">This certificate was system generated — no signature required.</p>
          </div>`;
      }
      if (signatureType === "moderator_signed") {
        return `
    <div class="sign-row">
      <div></div>
      <div class="center-qr">${qrImg}</div>
      <div>
        <div class="sig-line"></div>
        <p class="sig-label">Moderator</p>
      </div>
    </div>`;
      }
      if (signatureType === "moderator_and_principal_signed") {
        return `
          <div class="sign-row">
            <div>
              <div class="sig-line"></div>
              <p class="sig-label">Principal</p>
            </div>
            <div class="center-qr">${qrImg}</div>
            <div>
              <div class="sig-line"></div>
              <p class="sig-label">Moderator</p>
            </div>
          </div>`;
      }
      if (signatureType === "custom") {
        const signers = (cert.signatories || [])
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(
            (sig) => `
              <div class="sig-col">
                <div class="sig-line"></div>
                <p class="sig-label">${esc(sig.designation)}</p>
                ${sig.name ? `<p class="sig-name">${esc(sig.name)}</p>` : ""}
              </div>`,
          )
          .join("");
        return `
          <div class="sign-row-custom">
            ${signers}
            <div class="qr-custom">
              <div class="qr-wrap">${qrImg}</div>
              <p class="qr-caption">Scan to verify</p>
            </div>
          </div>`;
      }
      return "";
    })();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Certificate ${safeId}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { background: #fff; font-family: system-ui, sans-serif; }
  .page {
    width: 297mm; height: 210mm;
    background-image: url('${bgUrl}');
    background-size: cover; background-position: center; background-repeat: no-repeat;
    position: relative; overflow: hidden;
  }
  .id-block { position: absolute; top: 18%; right: 10%; text-align: right; }
  .id-value { font-family: 'Courier New', monospace; font-size: 10pt; font-weight: 700; color: #3D444C; line-height: 1.2; margin: 0; }
  .center { position: absolute; left: 10%; right: 10%; top: 22%; bottom: 34%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .title { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; color: #3D444C; font-size: 26pt; letter-spacing: 0.5px; line-height: 1.1; margin: 0 0 6pt; }
  .subtitle { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; color: #555; font-size: 17pt; margin: 0 0 6pt; }
  .name { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; color: #3D444C; font-size: 29pt; letter-spacing: 0.5px; line-height: 1.1; padding: 0 24pt 4pt; border-bottom: 2px solid #D3A16D; margin: 0; }
  .achievement { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; color: #994D35; font-size: 17pt; margin: 4pt 0 0; }
  .desc { font-family: 'Cormorant Garamond', Georgia, serif; color: #333; font-size: 14pt; max-width: 70%; margin-top: 6pt; line-height: 1.5; }
  .event { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; color: #666; font-size: 12pt; margin-top: 8pt; }
  .bottom { position: absolute; left: 8%; right: 8%; bottom: 10%; }
  .sign-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12pt; align-items: end; }
  .sign-row-custom { display: flex; gap: 12pt; align-items: flex-end; justify-content: space-between; }
  .sig-col { flex: 1; text-align: center; }
  .sig-line { width: 100%; border-bottom: 1px solid #3D444C; height: 20pt; margin-bottom: 4pt; }
  .sig-label { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; color: #3D444C; font-size: 10pt; text-align: center; line-height: 1.2; margin: 0; }
  .sig-name { font-family: 'Cormorant Garamond', Georgia, serif; color: #555; font-size: 9pt; text-align: center; line-height: 1.2; margin: 0; }
  .qr-wrap { display: inline-block; background: #fff; padding: 2pt; border: 1px solid rgba(211,161,109,0.6); border-radius: 2pt; }
  .qr-left { display: flex; justify-content: flex-start; }
  .center-qr { display: flex; justify-content: center; }
  .qr-custom { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .qr-caption { font-family: 'Cormorant Garamond', Georgia, serif; color: #777; font-size: 7pt; margin-top: 2pt; }
  .system-note { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; color: #dc2626; font-size: 10pt; text-align: center; margin: 6pt 0 0; }
  @media print {
    body { background: #fff !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    .page { box-shadow: none !important; margin: 0 !important; width: 297mm !important; height: 210mm !important; page-break-after: avoid; page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="id-block"><p class="id-value">${safeId}</p></div>
    <div class="center">
      <h2 class="title">${safeTitle}</h2>
      <p class="subtitle">This certificate is proudly presented to</p>
      <p class="name">${safeName}</p>
      ${safeAchievement ? `<p class="achievement">${safeAchievement}</p>` : ""}
      ${safeDesc ? `<p class="desc">${safeDesc}</p>` : ""}
      ${safeEvent ? `<p class="event">${safeEvent}${safeEventDate ? ` • ${safeEventDate}` : ""}</p>` : ""}
    </div>
    <div class="bottom">${signatureBlockHtml}</div>
  </div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const cleanup = () =>
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 800);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const printNow = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Print error:", err);
        alert("Failed to open print dialog. Please try again.");
      } finally {
        cleanup();
      }
    };

    const waitForAssets = () => {
      const win = iframe.contentWindow;
      const idoc = iframe.contentDocument;
      let printed = false;
      const go = () => {
        if (printed) return;
        printed = true;
        setTimeout(printNow, 300);
      };
      const imgs = Array.from(idoc.images || []);
      let pendingImgs = imgs.filter((i) => !i.complete).length;
      const afterImages = () => {
        if (win.document.fonts && win.document.fonts.ready)
          win.document.fonts.ready.then(go);
        else go();
      };
      if (pendingImgs === 0) afterImages();
      else {
        imgs.forEach((img) => {
          if (img.complete) return;
          img.addEventListener("load", () => {
            if (--pendingImgs === 0) afterImages();
          });
          img.addEventListener("error", () => {
            if (--pendingImgs === 0) afterImages();
          });
        });
        setTimeout(afterImages, 1500);
      }
    };

    if (iframe.contentWindow.document.readyState === "complete")
      waitForAssets();
    else {
      iframe.addEventListener("load", waitForAssets, { once: true });
      setTimeout(waitForAssets, 200);
    }
  };

  // ==========================================
  // SHIMMER LOADING
  // ==========================================
  if (authLoading || loading) {
    return (
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{ background: COLORS.bg }}
      >
        <div className="max-w-5xl mx-auto">
          <ShimmerBlock className="h-10 w-64 mb-2" />
          <ShimmerBlock className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: COLORS.bg }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-1"
            style={{ color: COLORS.primary }}
          >
            My Certificates
          </h1>
          <p className="text-sm text-gray-600">
            All certificates you've earned with ACC Career Club
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!error && certificates.length === 0 && (
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: COLORS.card }}
          >
            <FaFileSignature
              className="mx-auto mb-4 opacity-40"
              size={48}
              style={{ color: COLORS.primary }}
            />
            <p
              className="text-lg font-medium"
              style={{ color: COLORS.primary }}
            >
              No certificates yet
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Participate in an event to earn your first certificate.
            </p>
          </div>
        )}

        {!error && certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <CertificateCard
                key={cert._id}
                cert={cert}
                userId={userId}
                onPrint={() => handlePrint(cert)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// CERTIFICATE CARD
// ==========================================
const CertificateCard = ({ cert, userId, onPrint }) => {
  const signatureType = cert.signatureType || "system_generated";
  const needsSignature = signatureType !== "system_generated";

  const signatureLabel = (() => {
    if (signatureType === "moderator_signed") return "Moderator";
    if (signatureType === "moderator_and_principal_signed")
      return "Principal & Moderator";
    if (signatureType === "custom") {
      const desigs = (cert.signatories || [])
        .map((s) => s.designation)
        .filter(Boolean);
      return desigs.length > 0 ? desigs.join(", ") : "Authorized Signatories";
    }
    return "";
  })();

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-md border transition-all hover:shadow-lg"
      style={{ background: COLORS.card, borderColor: "#00000010" }}
    >
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
        }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3
              className="text-base sm:text-lg font-bold truncate"
              style={{ color: COLORS.primary }}
            >
              {cert.title}
            </h3>
            <p
              className="text-[11px] font-mono mt-0.5"
              style={{ color: COLORS.accentDark }}
            >
              {cert.certificateId}
            </p>
          </div>
          <span
            className="text-[10px] font-semibold px-2 py-1 rounded-full capitalize whitespace-nowrap"
            style={{
              background: `${COLORS.accent}25`,
              color: COLORS.accentDark,
            }}
          >
            {String(cert.certificateType).replace(/_/g, " ")}
          </span>
        </div>

        <div className="space-y-1 mb-4">
          {cert.event?.eventName && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Event:</span> {cert.event.eventName}
            </p>
          )}
          {cert.achievementTitle && (
            <p className="text-xs text-gray-600">
              <span className="font-medium">Achievement:</span>{" "}
              {cert.achievementTitle}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Issued{" "}
            {new Date(cert.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {needsSignature && (
          <div
            className="mb-4 p-3 rounded-lg border flex items-start gap-2"
            style={{ background: "#FEF3C7", borderColor: "#FCD34D" }}
          >
            <FaExclamationTriangle
              className="flex-shrink-0 mt-0.5"
              style={{ color: "#B45309" }}
              size={14}
            />
            <div
              className="text-[11px] leading-snug"
              style={{ color: "#78350F" }}
            >
              <p className="font-semibold">
                This certificate requires signature.
              </p>
              <p className="mt-0.5">
                It must be signed by the following authority:
              </p>
              <p
                className="mt-0.5 font-semibold"
                style={{ color: COLORS.accentDark }}
              >
                {signatureLabel}
              </p>
              <p
                className="mt-2 pt-2 border-t"
                style={{
                  borderColor: "#FCD34D",
                  fontFamily:
                    '"Noto Sans Bengali", "Hind Siliguri", system-ui, sans-serif',
                }}
              >
                <span className="font-semibold">
                  এই সার্টিফিকেটটিতে স্বাক্ষর প্রয়োজন।
                </span>{" "}
                নিম্নলিখিত কর্তৃপক্ষের দ্বারা এটি স্বাক্ষরিত হতে হবে:{" "}
                <span className="font-semibold">{signatureLabel}</span>।
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/certificates/${userId}/${cert.certificateId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: COLORS.primary, color: "#fff" }}
          >
            View Certificate <FaArrowRight size={10} />
          </Link>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
            style={{
              borderColor: `${COLORS.accent}80`,
              color: COLORS.accentDark,
              background: `${COLORS.accent}10`,
            }}
          >
            <FaPrint size={10} /> Quick Print
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SHIMMER
// ==========================================
const ShimmerBlock = ({ className = "" }) => (
  <div
    className={`rounded ${className}`}
    style={{
      background: `linear-gradient(90deg, ${COLORS.shimmer} 0%, ${COLORS.shimmerHi} 50%, ${COLORS.shimmer} 100%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.6s ease-in-out infinite",
    }}
  />
);

const ShimmerCard = () => (
  <div
    className="rounded-2xl overflow-hidden shadow-md p-5"
    style={{ background: COLORS.card }}
  >
    <div
      className="h-1.5 w-full -mt-5 -mx-5 mb-5"
      style={{ background: COLORS.shimmer }}
    />
    <ShimmerBlock className="h-5 w-3/4 mb-2" />
    <ShimmerBlock className="h-3 w-1/3 mb-4" />
    <ShimmerBlock className="h-3 w-1/2 mb-1.5" />
    <ShimmerBlock className="h-3 w-2/3 mb-4" />
    <div className="flex gap-2">
      <ShimmerBlock className="h-8 w-24" />
      <ShimmerBlock className="h-8 w-24" />
    </div>
  </div>
);

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

export default MyCertificates;
