// app/dashboard/sessions/SessionAttendance.jsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaTimes,
  FaSearch,
  FaCamera,
  FaSpinner,
  FaCheck,
  FaUserCheck,
  FaBarcode,
  FaUsers,
  FaSave,
  FaCheckCircle,
  FaHistory,
  FaPrint,
  FaUserCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Image from "next/image";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Logo from "../../assets/logo/Careerclublogo.png";

const SessionAttendance = ({ session, onClose, onSaved }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  // ✅ Track the original attendees fetched on mount
  const [initialAttendees, setInitialAttendees] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const selectedIdsRef = useRef(selectedIds);

  // Keep a ref in sync so scanner callback sees latest selection
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  // ---------- Fetch Users ----------
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/secure/sessions/session-attendance", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        // Pre-select users already marked in this session
        if (session?.sessionAttendees?.length > 0) {
          const attendeeIds = session.sessionAttendees.map((id) =>
            id.toString(),
          );
          setSelectedIds(attendeeIds);
          // ✅ Save the initial attendees for comparison later
          setInitialAttendees(attendeeIds);
        }
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ---------- Toggle Selection ----------
  const toggleUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // ---------- Filtered Users ----------
  const hasSearchTerm = searchTerm.trim().length > 0;

  const filteredUsers = users.filter((u) => {
    const idStr = u._id.toString();

    // No search → only show currently selected members
    if (!hasSearchTerm) {
      return selectedIds.includes(idStr);
    }

    // With search → show all matching (selected + unselected)
    const term = searchTerm.toLowerCase().trim();
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.studentId?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.department?.toLowerCase().includes(term)
    );
  });

  // ---------- Play Beep Sound ----------
  const playBeep = () => {
    try {
      const audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 200);
    } catch (e) {
      // silent
    }
  };

  // ---------- Start Scanning ----------
  const startScanning = useCallback(async () => {
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      html5QrCodeRef.current = new Html5Qrcode("attendance-scanner");

      const config = {
        fps: 20,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.AZTEC,
        ],
      };

      const onSuccess = (decodedText) => {
        if (isScanningRef.current) return;
        isScanningRef.current = true;
        setIsScanning(true);
        playBeep();

        const scanned = decodedText.trim();
        const matched = users.find(
          (u) =>
            u.studentId === scanned ||
            u.email?.toLowerCase() === scanned.toLowerCase() ||
            u.fullName?.toLowerCase() === scanned.toLowerCase(),
        );

        if (matched) {
          const id = matched._id.toString();
          if (!selectedIdsRef.current.includes(id)) {
            setSelectedIds((prev) => [...prev, id]);
            toast.success(`${matched.fullName} marked present ✓`);
          } else {
            toast(`${matched.fullName} is already marked`, { icon: "ℹ️" });
          }
        } else {
          toast.error(`No user found for "${scanned}"`);
        }

        setTimeout(() => {
          setIsScanning(false);
          isScanningRef.current = false;
        }, 800);
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        onSuccess,
        () => {},
      );
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("Could not start scanner. Check camera permissions.");
      setShowScanner(false);
    }
  }, [users]);

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (showScanner) {
      setTimeout(() => startScanning(), 400);
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [showScanner, startScanning, stopScanning]);

  // ---------- Save Attendance ----------
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/secure/sessions/session-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session._id,
          attendeeIds: selectedIds,
          markAsAttended: true,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onSaved?.();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  // ============ PRINT ATTENDANCE LIST ============
  const handlePrint = async () => {
    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // ✅ Convert imported logo to base64 data URL so it renders inside the iframe
    let logoDataUrl = "";
    try {
      const logoRes = await fetch(Logo.src || Logo);
      const logoBlob = await logoRes.blob();
      logoDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
    } catch (err) {
      console.error("Failed to load logo for print:", err);
      // Continue without logo — print still works
    }

    // Resolve phone from any plausible location on the user document
    const getMemberPhone = (u) =>
      u?.phone ||
      u?.personalInfo?.phone ||
      u?.personalInfo?.phoneNumber ||
      u?.personalInfo?.contactNumber ||
      u?.guardianInfo?.emergencyContact?.contactNo ||
      u?.alumniInfo?.contactPhone ||
      "";

    // Pretty-print BD phone numbers: 01XXXXXXXXX → 01XXX-XXXXXX
    const fmtPhone = (raw) => {
      const s = String(raw ?? "").trim();
      if (!s) return "";
      const digits = s.replace(/\D/g, "");
      if (digits.length === 11 && digits.startsWith("01")) {
        return `${digits.slice(0, 5)}-${digits.slice(5)}`;
      }
      return s;
    };

    // Build rows from users actually selected for this session
    const rows = [];
    users.forEach((u) => {
      const idStr = u._id.toString();
      if (!selectedIds.includes(idStr)) return;
      const wasAlreadyMarked = initialAttendees.includes(idStr);
      rows.push({
        name: u.fullName || "",
        studentId: u.studentId || "",
        membershipId: u.membershipId || "",
        email: u.email || "",
        phone: fmtPhone(getMemberPhone(u)),
        department: u.department || "",
        classOrYear: u.personalInfo?.classOrYear || "",
        role: u.role || "member",
        isNew: !wasAlreadyMarked,
      });
    });

    // Sort alphabetically for readability
    rows.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const total = rows.length;
    const newCount = rows.filter((r) => r.isNew).length;
    const preCount = total - newCount;
    const withPhone = rows.filter((r) => r.phone).length;
    const withEmail = rows.filter((r) => r.email).length;

    const printDate = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const sessionDateStr = session.sessionDate
      ? new Date(session.sessionDate).toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

    const rowsHtml = rows
      .map(
        (r, i) => `
      <tr>
        <td class="num">${i + 1}</td>
        <td>
          <div class="name">${esc(r.name)}</div>
          <div class="sub">
          ${
            r.studentId
              ? `<span class="tag">C.ID: ${esc(r.studentId)}</span>`
              : ""
          }
          ${
            r.membershipId
              ? `<span class="tag">M.ID: ${esc(r.membershipId)}</span>`
              : ""
          }
          ${r.isNew ? `<span class="tag new">NEW</span>` : ""}
        </div>
        </td>
        <td>${esc(r.department || "—")}</td>
        <td class="contact">
          ${r.phone ? `<div>☎ ${esc(r.phone)}</div>` : ""}
          ${r.email ? `<div>✉ ${esc(r.email)}</div>` : ""}
          ${!r.email && !r.phone ? `<span class="muted">—</span>` : ""}
        </td>
      </tr>
    `,
      )
      .join("");

    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="utf-8" />
  <title>Attendance - ${esc(session.sessionTitle)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 10mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    color: #3D444C;
    font-size: 11pt;
    padding: 0;
  }

 .header {
  text-align: center;
  padding: 12pt 0 14pt;
  border-bottom: 3px double #3D444C;
  margin-bottom: 14pt;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14pt;
    margin-bottom: 8pt;
  }

  .header-top .logo {
    width: 60pt;
    height: 60pt;
    object-fit: contain;
    flex-shrink: 0;
  }

  .header-top .header-text {
    text-align: left;
  }
  .header .club {
    font-size: 22pt;
    font-weight: 800;
    color: #3D444C;
    letter-spacing: 1px;
    margin: 0;
  }
  .header .subtitle {
    font-size: 11pt;
    color: #994D35;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 2pt 0 10pt;
    font-weight: 600;
  }
  .header .doc-title {
    font-size: 16pt;
    font-weight: 700;
    color: #3D444C;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 6pt 0 0;
  }

  .event-info {
    margin-bottom: 14pt;
    border: 1px solid #D3A16D;
    border-radius: 6pt;
    padding: 10pt 14pt;
    background: #FAF8F3;
  }
  .event-info table { width: 100%; border-collapse: collapse; }
  .event-info td {
    padding: 3pt 0;
    vertical-align: top;
    font-size: 10.5pt;
  }
  .event-info .label {
    color: #994D35;
    font-weight: 700;
    width: 110pt;
  }
  .event-info .value {
    color: #3D444C;
    font-weight: 500;
  }

  .summary {
    display: flex;
    gap: 8pt;
    margin-bottom: 12pt;
    flex-wrap: wrap;
  }
  .chip {
    border: 1px solid #3D444C;
    border-radius: 20pt;
    padding: 4pt 12pt;
    font-size: 10pt;
    font-weight: 600;
    color: #3D444C;
    background: #FFFFFF;
  }
  .chip strong { color: #994D35; }

  table.list {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4pt;
  }
  table.list thead th {
    background: #3D444C;
    color: #FFFFFF;
    text-align: left;
    padding: 8pt 6pt;
    font-size: 10pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid #3D444C;
  }
  table.list thead th.num,
  table.list td.num { width: 26pt; text-align: center; }

  table.list tbody td {
    padding: 8pt 6pt;
    border: 1px solid #D6D0BE;
    vertical-align: top;
    font-size: 10.5pt;
    color: #3D444C;
  }
  table.list tbody tr:nth-child(even) td {
    background: #FAF8F3;
  }

  .num { color: #994D35; font-weight: 700; }
  .name { font-weight: 700; font-size: 11pt; }
  .sub { margin-top: 2pt; display: flex; gap: 4pt; flex-wrap: wrap; }
  .tag {
    font-size: 8pt;
    background: #E7E3D8;
    color: #3D444C;
    padding: 1pt 5pt;
    border-radius: 8pt;
    font-weight: 600;
    letter-spacing: 0.3px;
  }
  .tag.new {
    background: #FEF3C7;
    color: #92400E;
    border: 1px solid #FCD34D;
  }
  .tag.prev {
    background: #DCFCE7;
    color: #166534;
    border: 1px solid #86EFAC;
  }

  .contact { font-size: 9.5pt; line-height: 1.5; }
  .contact .muted { color: #AAA; }

  .footer {
    margin-top: 20pt;
    padding-top: 10pt;
    border-top: 1px solid #3D444C;
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    color: #666;
  }

  .empty {
    text-align: center;
    padding: 40pt 0;
    color: #888;
    font-size: 12pt;
    font-style: italic;
  }

  @media print {
    body { background: #fff !important; }
    .no-print { display: none !important; }
    table.list tbody tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
  }
</style>
</head>
<body>
  <div class="header">
  <div class="header-top">
    ${
      logoDataUrl
        ? `<img src="${logoDataUrl}" alt="ACC Career Club Logo" class="logo" />`
        : ""
    }
    <div class="header-text">
      <h1 class="club">ACC CAREER CLUB</h1>
      <p class="subtitle">Adamjee Cantonment College</p>
    </div>
  </div>
  <h2 class="doc-title">Session Attendance Sheet</h2>
</div>

  <div class="event-info">
    <table>
      <tr>
        <td class="label">Session:</td>
        <td class="value">${esc(session.sessionTitle)}</td>
      </tr>
      ${
        sessionDateStr !== "—"
          ? `<tr><td class="label">Date:</td><td class="value">${esc(
              sessionDateStr,
            )}</td></tr>`
          : ""
      }
      ${
        session.sessionTime
          ? `<tr><td class="label">Time:</td><td class="value">${esc(
              session.sessionTime,
            )}</td></tr>`
          : ""
      }
      ${
        session.location
          ? `<tr><td class="label">Location:</td><td class="value">${esc(
              session.location,
            )}</td></tr>`
          : ""
      }
      ${
        session.sessionStatus
          ? `<tr><td class="label">Status:</td><td class="value">${esc(
              session.sessionStatus,
            )}</td></tr>`
          : ""
      }
      <tr>
        <td class="label">Printed:</td>
        <td class="value">${esc(printDate)}</td>
      </tr>
    </table>
  </div>

  <div class="summary">
  <div class="chip">Total Attendees: <strong>${total}</strong></div>
  <div class="chip">With Phone: <strong>${withPhone}</strong></div>
  <div class="chip">With Email: <strong>${withEmail}</strong></div>
</div>

  ${
    rows.length === 0
      ? `<div class="empty">No attendees marked for this session.</div>`
      : `
    <table class="list">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Name</th>
          <th>Department</th>
          <th>Contact</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `
  }

  <div class="footer">
    <div>ACC Career Club — Session Attendance Register</div>
    <div>Generated by the club management system</div>
  </div>
</body>
</html>`;

    // Hidden iframe — no new window/tab
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

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 500);
    };

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
        const win = iframe.contentWindow;
        if (win) {
          const done = () => cleanup();
          try {
            win.addEventListener("afterprint", done, { once: true });
          } catch (_) {}
          setTimeout(done, 1500);
        } else {
          cleanup();
        }
      }
    };

    const waitForReady = () => {
      const win = iframe.contentWindow;
      if (win.document.fonts && win.document.fonts.ready) {
        win.document.fonts.ready.then(() => setTimeout(printNow, 200));
      } else {
        setTimeout(printNow, 300);
      }
    };

    if (iframe.contentWindow.document.readyState === "complete") {
      waitForReady();
    } else {
      iframe.addEventListener("load", waitForReady, { once: true });
      setTimeout(waitForReady, 400);
    }
  };

  // ✅ Counts for display
  const alreadyMarkedCount = selectedIds.filter((id) =>
    initialAttendees.includes(id),
  ).length;
  const newlySelectedCount = selectedIds.length - alreadyMarkedCount;

  return (
    <div className="fixed inset-0 z-[100] bg-[#E7E3D8] overflow-y-auto">
      {/* ============== HEADER ============== */}
      <div className="sticky top-0 z-20 bg-[#3D444C] text-[#E7E3D8] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#D3A16D] flex items-center justify-center shrink-0">
              <FaUserCheck className="text-[#3D444C]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">
                Mark Attendance
              </h1>
              <p className="text-xs sm:text-sm text-[#E7E3D8]/70 truncate">
                {session.sessionTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-[#994D35] transition-colors shrink-0"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* ============== TOOLBAR ============== */}
      <div className="sticky top-[72px] z-10 bg-[#E7E3D8] border-b border-[#3D444C]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#3D444C]/50 hover:text-[#994D35] hover:bg-[#994D35]/10 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors font-medium text-sm"
          >
            <FaCamera /> Scan ID Card
          </button>
        </div>
      </div>

      {/* ============== BODY ============== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Stats + Legend */}
        <div className="bg-white rounded-2xl border border-[#3D444C]/10 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-2 text-[#3D444C]/70">
                <FaUsers className="text-[#D3A16D]" />
                <span className="font-semibold text-[#3D444C]">
                  {users.length}
                </span>
                eligible
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-green-600">
                <FaHistory />
                <span className="font-semibold">{alreadyMarkedCount}</span>
                already marked
              </span>
              <span className="hidden sm:block text-[#3D444C]/20">|</span>
              <span className="flex items-center gap-2 text-[#3D444C]">
                <FaCheckCircle className="text-[#D3A16D]" />
                <span className="font-semibold">{newlySelectedCount}</span>
                newly selected
              </span>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm text-[#994D35] hover:text-[#3D444C] font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* ✅ Color Legend */}
          <div className="mt-3 pt-3 border-t border-[#3D444C]/10 flex flex-wrap gap-4 text-xs text-[#3D444C]/70">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#3D444C] border-2 border-[#3D444C]"></div>
              Newly selected
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500 border-2 border-green-600"></div>
              Already in attendance
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-[#3D444C]/20"></div>
              Not selected
            </div>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-4xl text-[#3D444C]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#3D444C]/10">
            <FaUsers className="text-4xl text-[#3D444C]/30 mx-auto mb-3" />
            <p className="text-[#3D444C]/60">
              {hasSearchTerm
                ? "No users match your search"
                : "No members marked yet. Search for a name, ID, or email to mark attendance."}
            </p>
            {!hasSearchTerm && selectedIds.length === 0 && (
              <p className="text-xs text-[#3D444C]/40 mt-2">
                Tip: scan an ID or search to find and mark members.
              </p>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-bold text-[#3D444C] mb-3 flex items-center gap-2">
              <FaUserCheck className="text-[#994D35]" />
              {hasSearchTerm ? (
                <>
                  Search Results
                  <span className="text-[#3D444C]/50 font-normal">
                    ({filteredUsers.length} matching)
                  </span>
                </>
              ) : (
                <>
                  Marked Members
                  <span className="text-[#3D444C]/50 font-normal">
                    ({selectedIds.length} selected)
                  </span>
                </>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredUsers.map((u) => {
                const idStr = u._id.toString();
                const isSelected = selectedIds.includes(idStr);
                const wasAlreadyMarked = initialAttendees.includes(idStr);

                return (
                  <button
                    key={u._id}
                    onClick={() => toggleUser(idStr)}
                    className={`text-left p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 relative ${
                      isSelected && wasAlreadyMarked
                        ? "bg-green-500 text-white border-green-600 shadow-md"
                        : isSelected
                          ? "bg-[#3D444C] text-[#E7E3D8] border-[#3D444C] shadow-md"
                          : "bg-white text-[#3D444C] border-[#3D444C]/10 hover:border-[#D3A16D] hover:shadow-sm"
                    }`}
                  >
                    {/* Pre-existing badge — only when selected */}
                    {isSelected && wasAlreadyMarked && (
                      <span className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/25 text-[8px] font-bold tracking-wide">
                        <FaHistory className="text-[8px]" /> PRE
                      </span>
                    )}

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className={`relative w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center ${
                          isSelected && wasAlreadyMarked
                            ? "border-white"
                            : isSelected
                              ? "border-[#D3A16D]"
                              : "border-[#3D444C]/10"
                        }`}
                      >
                        {u.personalInfo?.profilePicture ? (
                          <Image
                            src={u.personalInfo.profilePicture}
                            alt={u.fullName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <FaUserCircle
                            className={`text-3xl ${
                              isSelected
                                ? wasAlreadyMarked
                                  ? "text-white"
                                  : "text-[#E7E3D8]"
                                : "text-[#3D444C]/40"
                            }`}
                          />
                        )}
                      </div>
                      {isSelected && (
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                            wasAlreadyMarked ? "bg-white" : "bg-[#D3A16D]"
                          }`}
                        >
                          <FaCheck
                            className={`text-[10px] ${
                              wasAlreadyMarked
                                ? "text-green-600"
                                : "text-[#3D444C]"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm truncate ${
                          isSelected ? "text-white" : "text-[#3D444C]"
                        }`}
                      >
                        {u.fullName}
                      </p>
                      <p
                        className={`text-xs truncate ${
                          isSelected ? "text-white/80" : "text-[#3D444C]/60"
                        }`}
                      >
                        ID: {u.studentId || "N/A"}
                      </p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? "text-white/70" : "text-[#3D444C]/50"
                        }`}
                      >
                        {u.department || "N/A"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============== STICKY FOOTER ============== */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#3D444C] border-t border-[#D3A16D]/30 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="text-[#E7E3D8] text-sm flex flex-wrap gap-x-4 gap-y-1">
            <span>
              <span className="font-bold text-[#D3A16D]">
                {selectedIds.length}
              </span>{" "}
              total selected
            </span>
            {initialAttendees.length > 0 && (
              <>
                <span className="hidden sm:inline text-[#E7E3D8]/30">|</span>
                <span className="text-green-400">
                  {alreadyMarkedCount} previously marked
                </span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              disabled={selectedIds.length === 0}
              className="px-5 py-2.5 bg-white/10 border border-[#D3A16D]/50 text-[#E7E3D8] rounded-lg hover:bg-[#D3A16D] hover:text-[#3D444C] font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                selectedIds.length === 0
                  ? "Mark attendees first to print the list"
                  : "Print attendance sheet"
              }
            >
              <FaPrint /> Print
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-[#E7E3D8]/30 text-[#E7E3D8] rounded-lg hover:bg-white/10 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#D3A16D] text-[#3D444C] rounded-lg hover:bg-[#994D35] hover:text-white transition-colors font-bold text-sm disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============== SCANNER MODAL ============== */}
      {showScanner && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#3D444C] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-[#E7E3D8] font-bold flex items-center gap-2">
                <FaBarcode className="text-[#D3A16D]" /> Scan ID Barcode
              </h3>
              <button
                onClick={() => setShowScanner(false)}
                className="p-2 text-[#E7E3D8] hover:bg-white/10 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="relative bg-black aspect-square">
              <div id="attendance-scanner" className="w-full h-full" />
              {isScanning && (
                <div className="absolute inset-0 bg-[#994D35]/30 flex items-center justify-center">
                  <div className="bg-white rounded-lg px-4 py-2 text-[#3D444C] font-bold shadow-lg animate-pulse">
                    Scanned!
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 text-center">
              <p className="text-[#E7E3D8]/80 text-sm">
                Point the camera at the barcode on the ID card
              </p>
              <p className="text-[#D3A16D] text-xs mt-1">
                Users will be automatically marked present
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionAttendance;
