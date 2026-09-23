// app/certificates/certificateId/OpenCertificate.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  FaPrint,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaLock,
  FaUserCheck,
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
// MAIN
// ==========================================
const OpenCertificate = ({ certificateId }) => {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMemberOwned, setIsMemberOwned] = useState(false);

  // ==========================================
  // FETCH — user endpoint
  // ==========================================
  useEffect(() => {
    if (!certificateId) return;

    const fetchCert = async () => {
      setLoading(true);
      setError("");
      setIsMemberOwned(false);
      try {
        const res = await fetch(
          `/api/users/certificates/${encodeURIComponent(certificateId)}`,
        );
        const data = await res.json();

        if (data.success) {
          setCert(data.certificate);
        } else if (data.reason === "MEMBER_OWNED") {
          setIsMemberOwned(true);
        } else {
          setError(data.message || "Certificate not found");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load certificate");
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [certificateId]);

  // ==========================================
  // PRINT — hidden iframe (same pattern as other pages)
  // ==========================================
  const handlePrint = () => {
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
  // SHIMMER
  // ==========================================
  if (loading) {
    return (
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{ background: COLORS.bg }}
      >
        <div className="max-w-5xl mx-auto">
          <ShimmerBlock className="h-8 w-2/3 mb-3" />
          <ShimmerBlock className="h-4 w-1/3 mb-8" />
          <div
            className="rounded-2xl overflow-hidden shadow-md p-5"
            style={{ background: COLORS.card }}
          >
            <div
              className="rounded w-full"
              style={{ aspectRatio: "1.414 / 1", background: COLORS.shimmer }}
            />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <ShimmerBlock className="h-3 w-24 mb-1.5" />
                  <ShimmerBlock className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MEMBER-OWNED BLOCK
  // ==========================================
  if (isMemberOwned) {
    return (
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
        style={{ background: COLORS.bg }}
      >
        <div
          className="rounded-2xl p-10 max-w-lg w-full text-center shadow-lg"
          style={{ background: COLORS.card }}
        >
          <div
            className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: `${COLORS.accent}25` }}
          >
            <FaLock size={22} style={{ color: COLORS.accentDark }} />
          </div>
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: COLORS.primary }}
          >
            This certificate belongs to a club member
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            For privacy, member certificates can only be viewed from the
            owner's signed-in account.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: COLORS.primary, color: "#fff" }}
          >
            <FaUserCheck size={12} /> Sign in to view
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================
  if (error || !cert) {
    return (
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
        style={{ background: COLORS.bg }}
      >
        <div
          className="rounded-2xl p-10 max-w-lg w-full text-center shadow-lg"
          style={{ background: COLORS.card }}
        >
          <FaExclamationTriangle
            className="mx-auto mb-4"
            size={40}
            style={{ color: "#B45309" }}
          />
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: COLORS.primary }}
          >
            {error || "Certificate not found"}
          </h1>
          <p className="text-sm text-gray-600">
            The certificate ID you tried to open isn't valid or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SIGNATURE INFO
  // ==========================================
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

  const verifyBase =
    process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";
  const verifyUrl = `${verifyBase}/verify-certificate/${cert.certificateId}`;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ background: COLORS.bg }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{ color: COLORS.primary }}
            >
              {cert.title}
            </h1>
            <p
              className="text-xs font-mono"
              style={{ color: COLORS.accentDark }}
            >
              {cert.certificateId}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: COLORS.primary, color: "#fff" }}
            >
              <FaPrint size={12} /> Print Certificate
            </button>
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border"
              style={{
                borderColor: `${COLORS.accent}80`,
                color: COLORS.accentDark,
                background: `${COLORS.accent}10`,
              }}
            >
              <FaExternalLinkAlt size={10} /> Verify
            </a>
          </div>
        </div>

        {/* Signature warning */}
        {needsSignature && (
          <div
            className="mb-6 p-4 rounded-xl border flex items-start gap-3"
            style={{ background: "#FEF3C7", borderColor: "#FCD34D" }}
          >
            <FaExclamationTriangle
              className="flex-shrink-0 mt-0.5"
              style={{ color: "#B45309" }}
              size={18}
            />
            <div className="text-sm leading-snug" style={{ color: "#78350F" }}>
              <p className="font-semibold">
                This certificate requires signature.
              </p>
              <p className="mt-1">
                It must be signed by the following authority:
              </p>
              <p
                className="mt-1 font-semibold"
                style={{ color: COLORS.accentDark }}
              >
                {signatureLabel}
              </p>
              <p
                className="mt-3 pt-3 border-t text-[13px] leading-relaxed"
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

        {/* Certificate canvas */}
        <div
          className="rounded-2xl overflow-hidden shadow-lg p-3 sm:p-5"
          style={{ background: COLORS.card }}
        >
          <CertificateDisplay cert={cert} />
        </div>

        {/* Meta table */}
        <div
          className="mt-6 rounded-2xl p-5 sm:p-6"
          style={{ background: COLORS.card }}
        >
          <h2
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: COLORS.primary }}
          >
            Certificate Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <MetaRow label="Certificate ID" value={cert.certificateId} mono />
            <MetaRow
              label="Issued On"
              value={new Date(cert.createdAt).toLocaleString()}
            />
            <MetaRow
              label="Certificate Type"
              value={formatCertificateType(cert.certificateType)}
            />
            <MetaRow
              label="Recipient"
              value={`${cert.recipient?.fullName} (External)`}
            />
            {cert.recipient?.externalOrganization && (
              <MetaRow
                label="Organization"
                value={cert.recipient.externalOrganization}
              />
            )}
            {cert.recipient?.externalId && (
              <MetaRow label="External ID" value={cert.recipient.externalId} />
            )}
            {cert.recipient?.email && (
              <MetaRow label="Email" value={cert.recipient.email} />
            )}
            {cert.event?.eventName && (
              <MetaRow label="Event" value={cert.event.eventName} />
            )}
            {cert.event?.eventDate && (
              <MetaRow
                label="Event Date"
                value={new Date(cert.event.eventDate).toLocaleDateString()}
              />
            )}
            {cert.achievementTitle && (
              <MetaRow label="Achievement" value={cert.achievementTitle} />
            )}
            {cert.issuedBy?.fullName && (
              <MetaRow
                label="Issued By"
                value={`${cert.issuedBy.fullName}${
                  cert.issuedBy.designation
                    ? ` (${cert.issuedBy.designation})`
                    : ""
                }`}
              />
            )}
            <MetaRow
              label="Signature Type"
              value={formatSignatureType(cert.signatureType)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CERTIFICATE DISPLAY
// ==========================================
const CertificateDisplay = ({ cert }) => {
  const bgUrl =
    cert.background?.url ||
    "https://res.cloudinary.com/ffuatrrt/image/upload/v1790161104/certificate_back_1_sxzqf8.jpg";
  const signatureType = cert.signatureType || "system_generated";

  const verifyBase =
    process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";
  const verifyUrl = `${verifyBase}/verify-certificate/${cert.certificateId}`;

  return (
    <div className="w-full overflow-x-auto rounded-lg">
      <div className="min-w-[700px] max-w-full">
        <div
          className="relative w-full rounded-lg overflow-hidden shadow-sm"
          style={{
            aspectRatio: "1.414 / 1",
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute top-[18%] right-[10%] z-10 text-right">
            <p className="font-mono text-xs font-bold text-[#3D444C]">
              {cert.certificateId}
            </p>
          </div>

          <div className="absolute inset-x-0 top-[20%] bottom-[32%] flex flex-col items-center justify-center text-center px-[8%]">
            <h2
              className="font-bold text-[#3D444C] mb-2"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: "clamp(20px, 2.4vw, 30px)",
              }}
            >
              {cert.title}
            </h2>
            <p
              className="italic text-gray-600 mb-2"
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: "clamp(11px, 1.1vw, 14px)",
              }}
            >
              This certificate is proudly presented to
            </p>
            <p
              className="font-bold text-[#3D444C] pb-1 px-8 border-b-2 border-[#D3A16D]"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: "clamp(24px, 3.2vw, 40px)",
              }}
            >
              {cert.recipient?.fullName}
            </p>
            {cert.achievementTitle && (
              <p
                className="font-semibold text-[#994D35] mt-2"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: "clamp(13px, 1.4vw, 18px)",
                }}
              >
                {cert.achievementTitle}
              </p>
            )}
            {cert.description && (
              <p
                className="text-gray-800 max-w-[70%] mt-2"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: "clamp(11px, 1.1vw, 14px)",
                }}
              >
                {cert.description}
              </p>
            )}
            {cert.event?.eventName && (
              <p
                className="text-gray-700 italic mt-3"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: "clamp(11px, 1vw, 13px)",
                }}
              >
                {cert.event.eventName}
                {cert.event.eventDate &&
                  ` • ${new Date(cert.event.eventDate).toLocaleDateString()}`}
              </p>
            )}
          </div>

          <div className="absolute bottom-[10%] left-0 right-0 px-[8%]">
            {signatureType === "system_generated" && (
              <div className="flex flex-col items-center gap-2">
                <QRBlock url={verifyUrl} size={56} />
                <p
                  className="font-semibold text-red-600 italic text-center"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: "clamp(10px, 1vw, 13px)",
                  }}
                >
                  This certificate was system generated — no signature required.
                </p>
              </div>
            )}
            {signatureType === "moderator_signed" && (
              <div className="grid grid-cols-3 items-end gap-4">
                <div />
                <div className="flex justify-center">
                  <QRBlock url={verifyUrl} size={68} />
                </div>
                <SignatureLine label="Moderator" />
              </div>
            )}
            {signatureType === "moderator_and_principal_signed" && (
              <div className="grid grid-cols-3 items-end gap-4">
                <SignatureLine label="Principal" />
                <div className="flex justify-center">
                  <QRBlock url={verifyUrl} size={68} />
                </div>
                <SignatureLine label="Moderator" />
              </div>
            )}
            {signatureType === "custom" && (
              <div className="flex items-end justify-between gap-3">
                {(cert.signatories || [])
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((sig, idx) => (
                    <SignatureLine
                      key={idx}
                      label={sig.designation}
                      name={sig.name}
                    />
                  ))}
                <div className="flex flex-col items-center flex-shrink-0">
                  <QRBlock url={verifyUrl} size={60} />
                  <p
                    className="text-[8px] text-gray-500 mt-1"
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                    }}
                  >
                    Scan to verify
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SIGNATURE LINE
// ==========================================
const SignatureLine = ({ label, name }) => (
  <div className="flex flex-col items-center w-full max-w-[160px] mx-auto">
    <div className="w-full border-b border-[#3D444C] h-7 mb-1" />
    <p
      className="font-semibold text-[#3D444C] text-center leading-tight"
      style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: "clamp(10px, 1vw, 13px)",
      }}
    >
      {label}
    </p>
    {name && (
      <p
        className="text-gray-600 text-center leading-tight"
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: "clamp(9px, 0.9vw, 11px)",
        }}
      >
        {name}
      </p>
    )}
  </div>
);

// ==========================================
// QR BLOCK
// ==========================================
const QRBlock = ({ url, size = 64 }) => (
  <div
    className="bg-white p-1 rounded shadow-sm border border-[#D3A16D]/60 flex-shrink-0"
    style={{ width: size + 8, height: size + 8 }}
  >
    <QRCode
      value={url}
      size={size}
      bgColor="#ffffff"
      fgColor="#3D444C"
      level="M"
      style={{ width: size, height: size, display: "block" }}
    />
  </div>
);

// ==========================================
// META ROW
// ==========================================
const MetaRow = ({ label, value, mono }) => (
  <div className="border-b border-gray-100 pb-2">
    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium mb-0.5">
      {label}
    </p>
    <p
      className={`text-[#3D444C] font-medium break-words ${
        mono ? "font-mono text-xs" : ""
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
    className={`rounded ${className}`}
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
  return map[type] || formatCertificateType(type);
};

const formatCertificateType = (type) => {
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

export default OpenCertificate;