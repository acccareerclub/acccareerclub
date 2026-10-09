// app/dashboard/settings/attendance-report/AttendanceReportClient.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaSpinner,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaChartLine,
  FaTrophy,
  FaExclamationTriangle,
  FaPrint,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaChartBar,
} from "react-icons/fa";
import Logo from "../../../assets/logo/Careerclublogo.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fmtDateLong = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const fmtDateShort = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getInitialRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 90);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
};

// =============================================================
// Print function — builds a clean, minimal table and prints it
// =============================================================
const handlePrint = async ({
  reports,
  stats,
  from,
  to,
  include,
  onlyActive,
}) => {
  if (!reports || reports.length === 0) {
    toast.error("No data to print");
    return;
  }

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // ✅ Convert the imported logo into a base64 data URL so it renders
  //    inside the print iframe (which has no access to Next.js assets).
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
  const printDate = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const rangeLabel = `${fmtDate(from)} — ${fmtDate(to)}`;
  const includeLabel =
    include === "events"
      ? "Events only"
      : include === "sessions"
        ? "Sessions only"
        : "Events & Sessions";

  // ── Build table rows (minimal columns) ──
  const rowsHtml = reports
    .map((r, i) => {
      const rateClass =
        r.attendanceRate >= 80
          ? "rate-high"
          : r.attendanceRate >= 50
            ? "rate-mid"
            : r.attendanceRate > 0
              ? "rate-low"
              : "rate-zero";

      return `
        <tr>
          <td class="num">${i + 1}</td>
          <td>
            <div class="name">${esc(r.fullName)}</div>
            ${!r.isActive ? `<span class="inactive-tag">Inactive</span>` : ""}
          </td>
          <td class="mono">${esc(r.studentId || "—")}</td>
          <td>${esc(r.department || "—")}</td>
          <td class="num-cell">${r.attendedCount}</td>
          <td class="num-cell">${r.missedCount}</td>
          <td class="num-cell">${r.totalOccasions}</td>
          <td class="num-cell">
            <span class="rate ${rateClass}">${r.attendanceRate}%</span>
          </td>
        </tr>
      `;
    })
    .join("");

  // ── Stats row for header ──
  const statsHtml = stats
    ? `
    <div class="summary">
      <div class="chip">Total Users: <strong>${stats.totalUsers}</strong></div>
      <div class="chip">Occasions: <strong>${stats.totalOccasions}</strong></div>
      <div class="chip">Avg Rate: <strong>${stats.avgAttendanceRate}%</strong></div>
      <div class="chip">Perfect: <strong>${stats.perfectAttendance}</strong></div>
      <div class="chip">Zero: <strong>${stats.zeroAttendance}</strong></div>
    </div>
  `
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Attendance Report — ${rangeLabel}</title>
<style>
  @page { size: A4 portrait; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    color: #3D444C;
    font-size: 10pt;
    padding: 0;
  }

  /* ---------- Header ---------- */
  .header {
    text-align: center;
    padding: 8pt 0 12pt;
    border-bottom: 3px double #3D444C;
    margin-bottom: 10pt;
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
    font-size: 20pt;
    font-weight: 800;
    color: #3D444C;
    letter-spacing: 1px;
    margin: 0;
  }
  .header .subtitle {
    font-size: 10pt;
    color: #994D35;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 3pt 0 8pt;
    font-weight: 600;
  }
  .header .doc-title {
    font-size: 14pt;
    font-weight: 700;
    color: #3D444C;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0;
  }

  /* ---------- Meta info ---------- */
  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 9.5pt;
    color: #555;
    margin-bottom: 8pt;
    border-bottom: 1px solid #D3A16D;
    padding-bottom: 6pt;
  }
  .meta strong { color: #3D444C; }

  /* ---------- Summary chips ---------- */
  .summary {
    display: flex;
    flex-wrap: wrap;
    gap: 6pt;
    margin-bottom: 12pt;
  }
  .chip {
    border: 1px solid #3D444C;
    border-radius: 20pt;
    padding: 3pt 10pt;
    font-size: 9pt;
    font-weight: 600;
    color: #3D444C;
    background: #FFFFFF;
  }
  .chip strong { color: #994D35; }

  /* ---------- Table ---------- */
  table.list {
    width: 100%;
    border-collapse: collapse;
    margin-top: 4pt;
  }
  table.list thead th {
    background: #3D444C;
    color: #FFFFFF;
    text-align: left;
    padding: 6pt 5pt;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    border: 1px solid #3D444C;
  }
  table.list thead th.num-col { text-align: center; }
  table.list tbody td {
    padding: 6pt 5pt;
    border: 1px solid #D6D0BE;
    vertical-align: middle;
    font-size: 9.5pt;
    color: #3D444C;
  }
  table.list tbody tr:nth-child(even) td {
    background: #FAF8F3;
  }

  td.num {
    text-align: center;
    color: #994D35;
    font-weight: 700;
    width: 24pt;
  }
  td.num-cell {
    text-align: center;
    width: 50pt;
    font-weight: 600;
  }
  .name { font-weight: 700; font-size: 10pt; }
  .mono {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    color: #555;
  }
  .inactive-tag {
    display: inline-block;
    background: #E5E7EB;
    color: #6B7280;
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 1pt 4pt;
    border-radius: 6pt;
    margin-top: 2pt;
  }

  /* Rate pill colors */
  .rate {
    display: inline-block;
    padding: 2pt 6pt;
    border-radius: 8pt;
    font-size: 9pt;
    font-weight: 700;
  }
  .rate-high { background: #DCFCE7; color: #166534; }
  .rate-mid { background: #FEF3C7; color: #92400E; }
  .rate-low { background: #FEE2E2; color: #991B1B; }
  .rate-zero { background: #E5E7EB; color: #4B5563; }

  /* ---------- Footer ---------- */
  .footer {
    margin-top: 16pt;
    padding-top: 8pt;
    border-top: 1px solid #3D444C;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #666;
  }

  /* ---------- Print rules ---------- */
  @media print {
    body { background: #fff !important; }
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
  <h2 class="doc-title">Attendance Report</h2>
</div>

  <div class="meta">
    <div><strong>Period:</strong> ${esc(rangeLabel)}</div>
    <div><strong>Includes:</strong> ${esc(includeLabel)}</div>
    <div><strong>Filter:</strong> ${onlyActive ? "Active only" : "All members"}</div>
    <div><strong>Printed:</strong> ${esc(printDate)}</div>
  </div>

  ${statsHtml}

  <table class="list">
    <thead>
      <tr>
        <th class="num-col">#</th>
        <th>Name</th>
        <th>Student ID</th>
        <th>Department</th>
        <th class="num-col">Attended</th>
        <th class="num-col">Missed</th>
        <th class="num-col">Total</th>
        <th class="num-col">Rate</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>ACC Career Club — Attendance Register</div>
    <div>Generated by the club management system</div>
  </div>
</body>
</html>`;

  // ── Hidden iframe — no new tab, no popup blocked ──
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
      toast.error("Failed to open print dialog");
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
    if (win?.document?.fonts?.ready) {
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

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
const AttendanceReportClient = () => {
  const initial = getInitialRange();

  // filters
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [include, setInclude] = useState("both");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);

  // data
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showStatsDetail, setShowStatsDetail] = useState(true);

  const topRef = useRef(null);

  // ─────────────────────────────────────────────────────
  // Fetch
  // ─────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("include", include);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (!onlyActive) params.set("onlyActive", "false");

      const res = await fetch(
        `/api/secure/reports/detailed-attendance?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success) {
        setReports(data.reports || []);
        setStats(data.stats);
        setTimeline(data.timeline || []);
      } else {
        setError(data.message || "Failed to load report");
        toast.error(data.message || "Failed to load report");
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      setError("Failed to load report");
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [from, to, include, searchQuery, onlyActive]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ─────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────
  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    const r = getInitialRange();
    setFrom(r.from);
    setTo(r.to);
    setInclude("both");
    setSearchInput("");
    setSearchQuery("");
    setOnlyActive(true);
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const expandAll = () => setExpandedRows(new Set(reports.map((r) => r._id)));
  const collapseAll = () => setExpandedRows(new Set());

  const onPrint = () => {
    handlePrint({ reports, stats, from, to, include, onlyActive });
  };

  const hasActiveFilters =
    from !== initial.from ||
    to !== initial.to ||
    include !== "both" ||
    searchQuery.trim() ||
    onlyActive !== true;

  // ─────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 text-[#3D444C]/60 hover:text-[#994D35] transition-colors text-sm font-medium mb-2"
            >
              <FaArrowLeft /> Back to Settings
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Attendance Report
            </h1>
            <p className="text-gray-600 mt-1">
              Detailed attendance analytics across events and sessions
            </p>
          </div>
          <button
            onClick={onPrint}
            disabled={reports.length === 0 || loading}
            className="flex items-center gap-2 bg-[#3D444C] text-[#E7E3D8] px-5 py-2.5 rounded-lg hover:bg-[#994D35] transition-all duration-300 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              reports.length === 0
                ? "No data to print"
                : "Print attendance table"
            }
          >
            <FaPrint /> Print Report
          </button>
        </div>

        {/* Filters */}
        <div
          ref={topRef}
          className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-4 sm:p-5 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D444C]/60 mb-1.5">
                From
              </label>
              <DatePicker
                selected={from ? new Date(from) : null}
                onChange={(date) => {
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    setFrom(`${yyyy}-${mm}-${dd}`);
                  }
                }}
                dateFormat="MMMM d, yyyy"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
                placeholderText="Select a date"
                showPopperArrow={false}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D444C]/60 mb-1.5">
                To
              </label>
              <DatePicker
                selected={to ? new Date(to) : null}
                onChange={(date) => {
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    setTo(`${yyyy}-${mm}-${dd}`);
                  }
                }}
                dateFormat="MMMM d, yyyy"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
                placeholderText="Select a date"
                showPopperArrow={false}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D444C]/60 mb-1.5">
                Include
              </label>
              <select
                value={include}
                onChange={(e) => setInclude(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
              >
                <option value="both">Events + Sessions</option>
                <option value="events">Events only</option>
                <option value="sessions">Sessions only</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer select-none py-2.5">
                <input
                  type="checkbox"
                  checked={onlyActive}
                  onChange={(e) => setOnlyActive(e.target.checked)}
                  className="w-4 h-4 accent-[#994D35]"
                />
                <span className="text-sm text-[#3D444C] font-medium">
                  Active only
                </span>
              </label>
            </div>
          </div>

          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, ID, membership ID, phone or email..."
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#3D444C]/50 hover:text-[#994D35] hover:bg-[#994D35]/10 transition-colors"
                  aria-label="Clear search"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 text-sm text-[#994D35] hover:text-[#3D444C] font-semibold border border-[#994D35]/30 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading / Error / Data */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-[#994D35] mb-4" />
            <p className="text-gray-500 text-sm">Generating report...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-12 text-center">
            <FaExclamationTriangle className="text-5xl text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchReport}
              className="px-5 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#3D444C] transition-colors font-semibold text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            {stats && (
              <div className="mb-6">
                <button
                  onClick={() => setShowStatsDetail((v) => !v)}
                  className="flex items-center justify-between w-full mb-3 group"
                >
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#3D444C] flex items-center gap-2">
                    <FaChartBar className="text-[#994D35]" />
                    Overview
                  </h2>
                  {showStatsDetail ? (
                    <FaChevronUp className="text-[#3D444C]/50 group-hover:text-[#994D35]" />
                  ) : (
                    <FaChevronDown className="text-[#3D444C]/50 group-hover:text-[#994D35]" />
                  )}
                </button>

                {showStatsDetail && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                      icon={FaUsers}
                      label="Total Users"
                      value={stats.totalUsers}
                      sub={`${stats.activeUsers} active • ${stats.inactiveUsers} inactive`}
                      color="#3D444C"
                    />
                    <StatCard
                      icon={FaCalendarAlt}
                      label="Occasions"
                      value={stats.totalOccasions}
                      sub={`${stats.totalEvents} events • ${stats.totalSessions} sessions`}
                      color="#D3A16D"
                    />
                    <StatCard
                      icon={FaUserCheck}
                      label="Total Marks"
                      value={stats.totalAttendanceMarks}
                      sub="attendance records"
                      color="#16A34A"
                    />
                    <StatCard
                      icon={FaChartLine}
                      label="Avg Attendance"
                      value={`${stats.avgAttendanceRate}%`}
                      sub={`across ${stats.totalUsers} users`}
                      color="#994D35"
                    />
                    <StatCard
                      icon={FaTrophy}
                      label="Perfect Attendance"
                      value={stats.perfectAttendance}
                      sub="100% attendance"
                      color="#D3A16D"
                    />
                    <StatCard
                      icon={FaUserSlash}
                      label="Zero Attendance"
                      value={stats.zeroAttendance}
                      sub="missed all"
                      color="#DC2626"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Actions bar */}
            {reports.length > 0 && (
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-[#3D444C]">
                    {reports.length}
                  </span>{" "}
                  {reports.length === 1 ? "person" : "people"} found
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={expandAll}
                    className="text-[#994D35] hover:text-[#3D444C] font-semibold underline-offset-2 hover:underline"
                  >
                    Expand all
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={collapseAll}
                    className="text-[#994D35] hover:text-[#3D444C] font-semibold underline-offset-2 hover:underline"
                  >
                    Collapse all
                  </button>
                </div>
              </div>
            )}

            {/* Reports list */}
            {reports.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-12 text-center">
                <FaUsers className="text-5xl text-[#3D444C]/20 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold">No users found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting the date range or search
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r, idx) => (
                  <ReportRow
                    key={r._id}
                    report={r}
                    rank={idx + 1}
                    expanded={expandedRows.has(r._id)}
                    onToggle={() => toggleRow(r._id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceReportClient;

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-[#3D444C]/10 p-4 sm:p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3 mb-3">
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="text-lg sm:text-xl" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#3D444C]/60 truncate">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-[#3D444C] leading-none mt-1">
          {value}
        </p>
      </div>
    </div>
    <p className="text-[11px] text-gray-500 truncate">{sub}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Report Row (collapsible)
// ─────────────────────────────────────────────────────────────
const ReportRow = ({ report, rank, expanded, onToggle }) => {
  const r = report;

  let rateColor = "text-[#3D444C]";
  let rateBg = "bg-[#E7E3D8]";
  let rateBorder = "border-[#3D444C]/10";
  if (r.totalOccasions > 0) {
    if (r.attendanceRate >= 80) {
      rateColor = "text-green-700";
      rateBg = "bg-green-50";
      rateBorder = "border-green-200";
    } else if (r.attendanceRate >= 50) {
      rateColor = "text-amber-700";
      rateBg = "bg-amber-50";
      rateBorder = "border-amber-200";
    } else if (r.attendanceRate > 0) {
      rateColor = "text-red-700";
      rateBg = "bg-red-50";
      rateBorder = "border-red-200";
    }
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
        expanded
          ? "border-[#994D35]/30 shadow-md"
          : "border-[#3D444C]/10 hover:border-[#D3A16D]/40"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3 sm:gap-4 hover:bg-[#E7E3D8]/30 transition-colors"
      >
        {/* Rank */}
        <div
          className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 ${
            rank === 1
              ? "bg-[#D3A16D] text-[#3D444C] border-[#994D35]"
              : rank === 2
                ? "bg-[#E7E3D8] text-[#3D444C] border-[#3D444C]/30"
                : rank === 3
                  ? "bg-[#E7E3D8] text-[#3D444C] border-[#3D444C]/20"
                  : "bg-[#E7E3D8] text-[#3D444C]/70 border-[#3D444C]/10"
          }`}
        >
          {rank}
        </div>

        {/* Avatar */}
        <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[#E7E3D8] border-2 border-[#3D444C]/10">
          {r.profilePicture ? (
            <Image
              src={r.profilePicture}
              alt={r.fullName}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <FaUserCircle className="w-full h-full text-[#3D444C]/30" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[#3D444C] truncate">{r.fullName}</p>
            {!r.isActive && (
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-gray-200 text-gray-600">
                Inactive
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
            {r.studentId && (
              <span className="inline-flex items-center gap-1">
                <FaIdCard className="text-[10px] text-[#D3A16D]" />
                {r.studentId}
              </span>
            )}
            {r.membershipId && (
              <span className="hidden sm:inline">M: {r.membershipId}</span>
            )}
            {r.department && (
              <span className="hidden md:inline truncate max-w-[180px]">
                {r.department}
              </span>
            )}
          </div>
        </div>

        {/* Attendance rate */}
        <div
          className={`shrink-0 px-3 py-2 rounded-xl border ${rateBg} ${rateBorder} text-center`}
        >
          <p
            className={`text-lg sm:text-xl font-extrabold leading-none ${rateColor}`}
          >
            {r.attendanceRate}%
          </p>
          <p className="text-[10px] text-gray-500 font-semibold mt-1 whitespace-nowrap">
            {r.attendedCount}/{r.totalOccasions}
          </p>
        </div>

        {/* Chevron */}
        <div className="shrink-0 text-[#3D444C]/40">
          {expanded ? (
            <FaChevronUp className="text-sm" />
          ) : (
            <FaChevronDown className="text-sm" />
          )}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[#3D444C]/10 bg-[#E7E3D8]/20 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            <InfoChip icon={FaEnvelope} label="Email" value={r.email || "—"} />
            <InfoChip icon={FaPhone} label="Phone" value={r.phone || "—"} />
            <InfoChip
              icon={FaIdCard}
              label="Membership"
              value={r.membershipId || "—"}
            />
            <InfoChip
              icon={FaUserCheck}
              label="Role"
              value={r.role || "—"}
              capitalize
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-2 flex items-center gap-1.5">
                <FaCheckCircle /> Attended ({r.attended.length})
              </p>
              {r.attended.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No attendance recorded in this period.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {r.attended.map((a) => (
                    <OccasionRow key={a._id} item={a} status="attended" />
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
                <FaTimesCircle /> Missed ({r.missed.length})
              </p>
              {r.missed.length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  Perfect attendance in this period! 🎉
                </p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {r.missed.map((a) => (
                    <OccasionRow key={a._id} item={a} status="missed" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const InfoChip = ({ icon: Icon, label, value, capitalize }) => (
  <div className="bg-white rounded-lg border border-[#3D444C]/10 px-3 py-2 flex items-center gap-2">
    <Icon className="text-[#D3A16D] text-xs shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
        {label}
      </p>
      <p
        className={`text-xs text-[#3D444C] font-medium truncate ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const OccasionRow = ({ item, status }) => (
  <div
    className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${
      status === "attended"
        ? "bg-green-50/60 border-green-200"
        : "bg-red-50/60 border-red-200"
    }`}
  >
    <div
      className={`shrink-0 w-1.5 h-1.5 rounded-full ${
        status === "attended" ? "bg-green-500" : "bg-red-400"
      }`}
    />
    <div className="flex-1 min-w-0">
      <p
        className={`truncate font-semibold ${
          status === "attended" ? "text-green-900" : "text-red-900"
        }`}
      >
        {item.title}
      </p>
      <p className="text-[10px] text-gray-500 mt-0.5">
        {item.kind === "event" ? "Event" : "Session"} •{" "}
        {fmtDateShort(item.date)}
      </p>
    </div>
  </div>
);
