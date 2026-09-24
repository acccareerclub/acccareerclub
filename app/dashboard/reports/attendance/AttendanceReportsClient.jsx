// app/dashboard/reports/attendance/page.jsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaSearch,
  FaSpinner,
  FaPrint,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaClipboardList,
  FaUserGraduate,
  FaHistory,
  FaFilter,
} from "react-icons/fa";
import DashboardMenu from "../../../components/layout/DashboardMenu";

const ALLOWED_ROLES = [
  "prefect",
  "itsecretary",
  "modarator",
  "assistant_prefect",
];

const AVATAR_FALLBACK =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/default-avatar.png";

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const AttendanceReportsClient = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState("overview"); // "overview" | "student"

  // ---- Overview state ----
  const [records, setRecords] = useState([]);
  const [totals, setTotals] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    from: "",
    to: "",
  });

  // ---- Student-wise state ----
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // ---------- Auth guard ----------
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      user &&
      !ALLOWED_ROLES.includes(user.role)
    ) {
      toast.error("You don't have access to this page");
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, user, router]);

  // ---------- Load overview ----------
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type !== "all") params.set("type", filters.type);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      params.set("limit", "100");

      const res = await fetch(
        `/api/secure/reports/attendance-summary?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setTotals(data.totals || null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load attendance data");
    } finally {
      setOverviewLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && ALLOWED_ROLES.includes(user?.role)) {
      loadOverview();
    }
  }, [isAuthenticated, user, loadOverview]);

  // ---------- Student search ----------
  const handleSearchStudent = async (e) => {
    e?.preventDefault?.();
    if (!searchQ.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/secure/reports/student-attendance?q=${encodeURIComponent(searchQ.trim())}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.students || []);
        if (data.students.length === 0) toast.error("No students found");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchResults([]);
    setReportLoading(true);
    setReport(null);
    try {
      const params = new URLSearchParams();
      params.set("userId", student._id);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const res = await fetch(
        `/api/secure/reports/student-attendance?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.success) {
        setReport(data);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load student report");
    } finally {
      setReportLoading(false);
    }
  };

  // ============ PRINT OVERVIEW REPORT ============
  const printOverview = () => {
    if (!records.length) {
      toast.error("No data to print");
      return;
    }

    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    // ---- Filter description for the header ----
    const filterParts = [];
    if (filters.type !== "all")
      filterParts.push(
        filters.type === "events" ? "Events only" : "Sessions only",
      );
    if (filters.status !== "all")
      filterParts.push(
        `Status: ${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}`,
      );
    if (filters.from) filterParts.push(`From: ${filters.from}`);
    if (filters.to) filterParts.push(`To: ${filters.to}`);
    const filterLine = filterParts.length
      ? filterParts.join(" • ")
      : "All records";

    // ---- Row rendering ----
    const rowsHtml = records
      .map((r, i) => {
        const kindLabel = r.kind === "event" ? "Event" : "Session";
        const badgeClass = r.kind === "event" ? "event" : "session";
        const rate = r.attendanceRate === null ? "—" : `${r.attendanceRate}%`;
        const rateClass =
          r.attendanceRate === null
            ? "muted"
            : r.attendanceRate >= 70
              ? "good"
              : r.attendanceRate >= 40
                ? "warn"
                : "bad";

        return `
      <tr>
        <td class="num">${i + 1}</td>
        <td>
          <div class="name">${esc(r.title)}</div>
          <div class="sub">
            <span class="tag ${badgeClass}">${kindLabel}</span>
            ${r.status ? `<span class="tag status">${esc(r.status)}</span>` : ""}
            ${
              r.counts.totalPreReg > 0
                ? `<span class="tag">${r.counts.totalPreReg} pre-registered</span>`
                : ""
            }
          </div>
        </td>
        <td>${esc(fmtDate(r.date))}</td>
        <td>${esc(r.location || "—")}</td>
        <td class="num-cell">${r.counts.memberAttendees}</td>
        <td class="num-cell">${r.counts.externalAttendees}</td>
        <td class="num-cell total">${r.counts.totalAttended}</td>
        <td class="num-cell ${rateClass}">${rate}</td>
      </tr>`;
      })
      .join("");

    // ---- Summary chip totals ----
    const totalEvents = records.filter((r) => r.kind === "event").length;
    const totalSessions = records.filter((r) => r.kind === "session").length;
    const totalMemberAtt = records.reduce(
      (s, r) => s + r.counts.memberAttendees,
      0,
    );
    const totalExternalAtt = records.reduce(
      (s, r) => s + r.counts.externalAttendees,
      0,
    );
    const grandTotal = totalMemberAtt + totalExternalAtt;

    const printDate = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Attendance Overview Report</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    color: #3D444C;
    font-size: 10pt;
  }

  .header {
    text-align: center;
    padding: 8pt 0 12pt;
    border-bottom: 3px double #3D444C;
    margin-bottom: 12pt;
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
    margin: 2pt 0 8pt;
    font-weight: 600;
  }
  .header .doc-title {
    font-size: 14pt;
    font-weight: 700;
    color: #3D444C;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 4pt 0 0;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    color: #666;
    margin-bottom: 10pt;
    padding: 6pt 10pt;
    background: #FAF8F3;
    border: 1px solid #D3A16D;
    border-radius: 4pt;
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
    padding: 3pt 12pt;
    font-size: 9.5pt;
    font-weight: 600;
    color: #3D444C;
    background: #FFFFFF;
  }
  .chip strong { color: #994D35; }

  table.list {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  table.list thead th {
    background: #3D444C;
    color: #FFFFFF;
    text-align: left;
    padding: 7pt 5pt;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid #3D444C;
  }
  table.list thead th.num,
  table.list td.num { width: 24pt; text-align: center; }
  table.list thead th.date,
  table.list td.date { width: 70pt; }
  table.list thead th.loc,
  table.list td.loc { width: 110pt; }
  table.list thead th.small,
  table.list td.small { width: 55pt; text-align: center; }
  table.list thead th.sign,
  table.list td.sign { width: 90pt; }

  table.list tbody td {
    padding: 6pt 5pt;
    border: 1px solid #D6D0BE;
    vertical-align: top;
    font-size: 9.5pt;
    color: #3D444C;
    word-wrap: break-word;
  }
  table.list tbody tr:nth-child(even) td {
    background: #FAF8F3;
  }

  .num { color: #994D35; font-weight: 700; }
  .num-cell { text-align: center; font-weight: 600; }
  .num-cell.total { color: #994D35; font-weight: 700; }
  .num-cell.good { color: #166534; }
  .num-cell.warn { color: #B45309; }
  .num-cell.bad { color: #991B1B; }
  .num-cell.muted { color: #AAA; }

  .name { font-weight: 700; font-size: 10pt; }
  .sub { margin-top: 2pt; display: flex; gap: 3pt; flex-wrap: wrap; }
  .tag {
    font-size: 7.5pt;
    background: #E7E3D8;
    color: #3D444C;
    padding: 1pt 5pt;
    border-radius: 8pt;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-transform: uppercase;
  }
  .tag.event { background: #DBEAFE; color: #1E40AF; }
  .tag.session { background: #EDE9FE; color: #5B21B6; }
  .tag.status { background: #DCFCE7; color: #166534; }

  .sign { height: 28pt; }

  .footer {
    margin-top: 14pt;
    padding-top: 8pt;
    border-top: 1px solid #3D444C;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
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
    table.list tbody tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1 class="club">ACC CAREER CLUB</h1>
    <p class="subtitle">Adamjee Cantonment College</p>
    <h2 class="doc-title">Attendance Overview Report</h2>
  </div>

  <div class="meta">
    <div><strong>Filters:</strong> ${esc(filterLine)}</div>
    <div><strong>Printed:</strong> ${esc(printDate)}</div>
  </div>

  <div class="summary">
    <div class="chip">Events: <strong>${totalEvents}</strong></div>
    <div class="chip">Sessions: <strong>${totalSessions}</strong></div>
    <div class="chip">Member Attendances: <strong>${totalMemberAtt}</strong></div>
    <div class="chip">External Attendances: <strong>${totalExternalAtt}</strong></div>
    <div class="chip">Total Attendances: <strong>${grandTotal}</strong></div>
  </div>

  ${
    records.length === 0
      ? `<div class="empty">No records match the current filters.</div>`
      : `
    <table class="list">
      <thead>
        <tr>
          <th class="num">#</th>
          <th>Title</th>
          <th class="date">Date</th>
          <th class="loc">Location</th>
          <th class="small">Members</th>
          <th class="small">Externals</th>
          <th class="small">Total</th>
          <th class="small">Rate</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `
  }

  <div class="footer">
    <div>ACC Career Club — Attendance Overview</div>
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

  // ---------- Print student report ----------
  const printStudentReport = () => {
    if (!report || !report.student) return;
    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const s = report.student;
    const t = report.totals;

    const rows = report.history
      .map((h) => {
        const statusClass =
          h.status === "present"
            ? "present"
            : h.status === "absent"
              ? "absent"
              : "na";
        const statusLabel =
          h.status === "present"
            ? "Present"
            : h.status === "absent"
              ? "Absent"
              : "Not Registered";
        return `
        <tr>
          <td>${esc(fmtDate(h.date))}</td>
          <td>
            <div class="t">${esc(h.title)}</div>
            <div class="k">${h.kind === "event" ? "Event" : "Session"}${h.time ? " • " + esc(h.time) : ""}</div>
          </td>
          <td>${esc(h.location || "—")}</td>
          <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Attendance Report - ${esc(s.fullName)}</title>
<style>
  @page { size: A4 portrait; margin: 12mm 10mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #3D444C; margin: 0; font-size: 11pt; }
  .header { text-align: center; padding: 12pt 0 14pt; border-bottom: 3px double #3D444C; margin-bottom: 14pt; }
  .header .club { font-size: 22pt; font-weight: 800; margin: 0; }
  .header .subtitle { font-size: 11pt; color: #994D35; letter-spacing: 3px; text-transform: uppercase; margin: 2pt 0 10pt; font-weight: 600; }
  .header .doc-title { font-size: 16pt; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 6pt 0 0; }
  .info { margin-bottom: 14pt; border: 1px solid #D3A16D; border-radius: 6pt; padding: 10pt 14pt; background: #FAF8F3; }
  .info table { width: 100%; border-collapse: collapse; }
  .info td { padding: 3pt 0; vertical-align: top; font-size: 10.5pt; }
  .info .label { color: #994D35; font-weight: 700; width: 110pt; }
  .summary { display: flex; gap: 8pt; margin-bottom: 12pt; flex-wrap: wrap; }
  .chip { border: 1px solid #3D444C; border-radius: 20pt; padding: 4pt 12pt; font-size: 10pt; font-weight: 600; background: #fff; }
  .chip strong { color: #994D35; }
  table.list { width: 100%; border-collapse: collapse; margin-top: 4pt; }
  table.list thead th { background: #3D444C; color: #fff; text-align: left; padding: 8pt 6pt; font-size: 10pt; text-transform: uppercase; border: 1px solid #3D444C; }
  table.list tbody td { padding: 7pt 6pt; border: 1px solid #D6D0BE; vertical-align: top; font-size: 10.5pt; }
  table.list tbody tr:nth-child(even) td { background: #FAF8F3; }
  .t { font-weight: 700; }
  .k { font-size: 9pt; color: #666; margin-top: 2pt; text-transform: capitalize; }
  .badge { display: inline-block; padding: 2pt 7pt; border-radius: 10pt; font-size: 8.5pt; font-weight: 700; text-transform: uppercase; }
  .badge.present { background: #DCFCE7; color: #166534; }
  .badge.absent { background: #FEE2E2; color: #991B1B; }
  .badge.na { background: #E7E3D8; color: #3D444C; }
  .footer { margin-top: 20pt; padding-top: 10pt; border-top: 1px solid #3D444C; display: flex; justify-content: space-between; font-size: 9pt; color: #666; }
  @media print { body { background: #fff !important; } table.list tbody tr { page-break-inside: avoid; } thead { display: table-header-group; } }
</style>
</head>
<body>
  <div class="header">
    <h1 class="club">ACC CAREER CLUB</h1>
    <p class="subtitle">Adamjee Cantonment College</p>
    <h2 class="doc-title">Student Attendance Report</h2>
  </div>

  <div class="info">
    <table>
      <tr><td class="label">Name:</td><td>${esc(s.fullName)}</td></tr>
      <tr><td class="label">Student ID:</td><td>${esc(s.studentId || "—")}</td></tr>
      <tr><td class="label">Email:</td><td>${esc(s.email || "—")}</td></tr>
      <tr><td class="label">Department:</td><td>${esc(s.department || "—")}</td></tr>
      <tr><td class="label">Role:</td><td>${esc(s.role || "member")}</td></tr>
      <tr><td class="label">Generated:</td><td>${esc(new Date().toLocaleString())}</td></tr>
    </table>
  </div>

  <div class="summary">
    <div class="chip">Overall Attendance: <strong>${t.overallRate}%</strong></div>
    <div class="chip">Events Present: <strong>${t.events.present}/${t.events.present + t.events.absent}</strong></div>
    <div class="chip">Sessions Present: <strong>${t.sessions.present}/${t.sessions.present + t.sessions.absent}</strong></div>
    <div class="chip">Total Records: <strong>${report.history.length}</strong></div>
  </div>

  <table class="list">
    <thead>
      <tr>
        <th style="width:90pt;">Date</th>
        <th>Event / Session</th>
        <th style="width:110pt;">Location</th>
        <th style="width:90pt;">Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <div>ACC Career Club — Student Attendance Report</div>
    <div>Generated by the club management system</div>
  </div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
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
        console.error(err);
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

    const wait = () => {
      const win = iframe.contentWindow;
      if (win.document.fonts?.ready) {
        win.document.fonts.ready.then(() => setTimeout(printNow, 200));
      } else {
        setTimeout(printNow, 300);
      }
    };

    if (iframe.contentWindow.document.readyState === "complete") wait();
    else {
      iframe.addEventListener("load", wait, { once: true });
      setTimeout(wait, 400);
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg bg-white shadow hover:bg-[#E7E3D8] transition-colors text-[#3D444C]"
                title="Back to dashboard"
              >
                <FaArrowLeft />
              </Link>
              <h1 className="text-xl md:text-3xl font-bold text-[#3D444C]">
                Attendance Reports
              </h1>
            </div>
            <p className="text-gray-600 text-sm md:text-md mt-1">
              Track attendance across events and sessions, or look up a single
              student's history.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setTab("overview")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              tab === "overview"
                ? "bg-[#994D35] text-white shadow-md"
                : "text-[#3D444C] hover:bg-[#E7E3D8]"
            }`}
          >
            <FaClipboardList /> Overview
          </button>
          <button
            onClick={() => setTab("student")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
              tab === "student"
                ? "bg-[#994D35] text-white shadow-md"
                : "text-[#3D444C] hover:bg-[#E7E3D8]"
            }`}
          >
            <FaUserGraduate /> Student-wise
          </button>
        </div>

        {/* ==================== OVERVIEW TAB ==================== */}
        {tab === "overview" && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex items-center gap-2 text-[#3D444C] text-sm font-semibold">
                  <FaFilter /> Filters:
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="px-3 py-2 border border-[#3D444C]/20 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All</option>
                    <option value="events">Events only</option>
                    <option value="sessions">Sessions only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="px-3 py-2 border border-[#3D444C]/20 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      setFilters({ ...filters, from: e.target.value })
                    }
                    className="px-3 py-2 border border-[#3D444C]/20 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">To</label>
                  <input
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      setFilters({ ...filters, to: e.target.value })
                    }
                    className="px-3 py-2 border border-[#3D444C]/20 rounded-lg text-sm bg-white"
                  />
                </div>
                <button
                  onClick={() =>
                    setFilters({
                      type: "all",
                      status: "all",
                      from: "",
                      to: "",
                    })
                  }
                  className="px-4 py-2 text-sm text-[#994D35] hover:bg-[#E7E3D8] rounded-lg font-medium"
                >
                  Reset
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={printOverview}
                  disabled={!records.length}
                  className="flex items-center gap-2 px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] text-sm font-medium disabled:opacity-50"
                >
                  <FaPrint /> Print Report
                </button>
              </div>
            </div>

            {/* Totals */}
            {totals && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <StatCard
                  label="Events"
                  value={totals.events}
                  icon={<FaCalendarAlt />}
                  color="bg-blue-500"
                />
                <StatCard
                  label="Sessions"
                  value={totals.sessions}
                  icon={<FaClipboardList />}
                  color="bg-purple-500"
                />
                <StatCard
                  label="Member Attendances"
                  value={totals.memberAttendances}
                  icon={<FaUsers />}
                  color="bg-[#994D35]"
                />
                <StatCard
                  label="Total Attendances"
                  value={totals.totalAttendances}
                  icon={<FaCheckCircle />}
                  color="bg-green-600"
                />
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {overviewLoading ? (
                <div className="flex justify-center py-16">
                  <FaSpinner className="animate-spin text-4xl text-[#994D35]" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <FaClipboardList className="text-4xl mx-auto mb-3 opacity-30" />
                  No records match your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#3D444C] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Title</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-center">Members</th>
                        <th className="px-4 py-3 text-center">Externals</th>
                        <th className="px-4 py-3 text-center">Total</th>
                        <th className="px-4 py-3 text-center">Pre-Reg</th>
                        <th className="px-4 py-3 text-center">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r, i) => (
                        <tr
                          key={r._id}
                          className={`border-b border-[#3D444C]/10 ${
                            i % 2 === 0 ? "bg-white" : "bg-[#FAF8F3]"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-[#3D444C]">
                            {r.title}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {fmtDate(r.date)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                r.kind === "event"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {r.kind === "event" ? "Event" : "Session"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {r.location || "—"}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">
                            {r.counts.memberAttendees}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.counts.externalAttendees}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-[#994D35]">
                            {r.counts.totalAttended}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500">
                            {r.counts.totalPreReg || "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.attendanceRate === null ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <span
                                className={`font-semibold ${
                                  r.attendanceRate >= 70
                                    ? "text-green-600"
                                    : r.attendanceRate >= 40
                                      ? "text-orange-500"
                                      : "text-red-500"
                                }`}
                              >
                                {r.attendanceRate}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== STUDENT TAB ==================== */}
        {tab === "student" && (
          <>
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
              <form
                onSubmit={handleSearchStudent}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3D444C]/40" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search by name, student ID, or email..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[#3D444C]/20 rounded-lg focus:outline-none focus:border-[#3D444C] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {searching ? (
                    <>
                      <FaSpinner className="animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch /> Search
                    </>
                  )}
                </button>
              </form>

              {/* Date range for student report */}
              <div className="mt-3 pt-3 border-t border-[#3D444C]/10 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-500 font-medium">
                  Date range (optional):
                </span>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                  className="px-3 py-1.5 border border-[#3D444C]/20 rounded-lg text-sm"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters({ ...filters, to: e.target.value })
                  }
                  className="px-3 py-1.5 border border-[#3D444C]/20 rounded-lg text-sm"
                />
                {(filters.from || filters.to) && (
                  <button
                    onClick={() => setFilters({ ...filters, from: "", to: "" })}
                    className="text-[#994D35] hover:underline text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <h3 className="font-bold text-[#3D444C] mb-3 text-sm">
                  {searchResults.length} match
                  {searchResults.length !== 1 ? "es" : ""} — click to view
                  report
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {searchResults.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => selectStudent(s)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#3D444C]/10 hover:border-[#D3A16D] hover:bg-[#FAF8F3] text-left transition-colors"
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#3D444C]/10 shrink-0">
                        <Image
                          src={s.profilePicture || AVATAR_FALLBACK}
                          alt={s.fullName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#3D444C] truncate">
                          {s.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          ID: {s.studentId} • {s.department}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Report */}
            {selectedStudent && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Report header */}
                <div className="bg-[#3D444C] text-[#E7E3D8] p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#D3A16D] shrink-0">
                      <Image
                        src={selectedStudent.profilePicture || AVATAR_FALLBACK}
                        alt={selectedStudent.fullName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">
                        {selectedStudent.fullName}
                      </h3>
                      <p className="text-[#E7E3D8]/70 text-sm">
                        ID: {selectedStudent.studentId} •{" "}
                        {selectedStudent.department} • {selectedStudent.role}
                      </p>
                    </div>
                    <button
                      onClick={printStudentReport}
                      disabled={!report}
                      className="flex items-center gap-2 px-4 py-2 bg-[#D3A16D] text-[#3D444C] rounded-lg hover:bg-[#994D35] hover:text-white font-semibold text-sm disabled:opacity-50"
                    >
                      <FaPrint /> Print Report
                    </button>
                  </div>
                </div>

                {reportLoading ? (
                  <div className="flex justify-center py-16">
                    <FaSpinner className="animate-spin text-4xl text-[#994D35]" />
                  </div>
                ) : !report ? (
                  <div className="text-center py-16 text-gray-500">
                    No report data.
                  </div>
                ) : (
                  <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
                      <MiniStat
                        label="Overall"
                        value={`${report.totals.overallRate}%`}
                        color="text-[#994D35]"
                      />
                      <MiniStat
                        label="Events Present"
                        value={`${report.totals.events.present}/${
                          report.totals.events.present +
                          report.totals.events.absent
                        }`}
                        color="text-green-600"
                      />
                      <MiniStat
                        label="Sessions Present"
                        value={`${report.totals.sessions.present}/${
                          report.totals.sessions.present +
                          report.totals.sessions.absent
                        }`}
                        color="text-purple-600"
                      />
                      <MiniStat
                        label="Total Records"
                        value={report.history.length}
                        color="text-[#3D444C]"
                      />
                    </div>

                    {/* History table */}
                    <div className="border-t border-[#3D444C]/10 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#FAF8F3] text-[#3D444C]">
                          <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">
                              Event / Session
                            </th>
                            <th className="px-4 py-3 text-left">Location</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.history.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center py-12 text-gray-500"
                              >
                                No attendance records found.
                              </td>
                            </tr>
                          ) : (
                            report.history.map((h) => (
                              <tr
                                key={`${h.kind}-${h._id}`}
                                className="border-b border-[#3D444C]/10"
                              >
                                <td className="px-4 py-3 text-gray-600">
                                  {fmtDate(h.date)}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-[#3D444C]">
                                    {h.title}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {h.kind}
                                    {h.time ? ` • ${h.time}` : ""}
                                    {h.day ? ` • ${h.day}` : ""}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {h.location || "—"}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <StatusBadge status={h.status} />
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {!selectedStudent && searchResults.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
                <FaUserGraduate className="text-5xl mx-auto mb-3 opacity-30" />
                <p>Search for a student to see their attendance report.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ---------- Small helpers ----------
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4">
    <div className={`${color} p-3 rounded-xl text-white text-xl`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#3D444C]">{value}</p>
    </div>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div className="bg-[#FAF8F3] rounded-xl p-3 text-center">
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
      {label}
    </p>
    <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  if (status === "present") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        <FaCheckCircle className="text-[10px]" /> Present
      </span>
    );
  }
  if (status === "absent") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
        <FaTimesCircle className="text-[10px]" /> Absent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E7E3D8] text-[#3D444C] text-xs font-semibold">
      <FaHistory className="text-[10px]" /> Not Registered
    </span>
  );
};

export default AttendanceReportsClient;
