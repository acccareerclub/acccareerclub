"use client";

import DashboardMenu from "@/app/components/layout/DashboardMenu";
import React, { useState, useEffect, useCallback, useRef } from "react";
import CreateCertificateModal from "./CreateCertificateModal";
import EditCertificateModal from "./EditCertificateModal";
import QRCode from "react-qr-code";
import { FaPrint, FaTrash, FaEdit, FaEnvelope } from "react-icons/fa";

const PAGE_SIZE = 50;

const AdminCertificatesClient = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [editingCert, setEditingCert] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });
  const [sendingEmailId, setSendingEmailId] = useState(null);

  // Track the last successful fetch so we can abort races
  const fetchAbortRef = useRef(null);

  // ==========================================
  // DEBOUNCE SEARCH (300ms)
  // ==========================================
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ==========================================
  // FETCH (initial or reset)
  // ==========================================
  const fetchCertificates = useCallback(async (searchOverride) => {
    // Cancel any in-flight fetch
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    const search =
      typeof searchOverride === "string"
        ? searchOverride
        : debouncedSearch;

    if (search) setSearching(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: "0",
      });
      if (search) params.set("search", search);

      const res = await fetch(
        `/api/secure/certificates/get-certificates?${params.toString()}`,
        { credentials: "include", signal: controller.signal },
      );
      const data = await res.json();

      if (controller.signal.aborted) return;

      if (data.success) {
        setCertificates(data.certificates || []);
        setHasMore(!!data.hasMore);
        setTotal(data.total || 0);
        setSelectedIds([]); // clear selection when list changes
      } else {
        setToast({
          type: "error",
          text: data.message || "Failed to load certificates",
        });
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Error fetching certificates:", err);
      setToast({ type: "error", text: "Failed to load certificates" });
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setSearching(false);
      }
    }
  }, [debouncedSearch]);

  // ==========================================
  // LOAD MORE (append next page)
  // ==========================================
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        skip: String(certificates.length),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(
        `/api/secure/certificates/get-certificates?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.success) {
        // Dedupe by _id in case of overlap
        setCertificates((prev) => {
          const seen = new Set(prev.map((c) => c._id));
          const merged = [...prev];
          for (const c of data.certificates || []) {
            if (!seen.has(c._id)) {
              seen.add(c._id);
              merged.push(c);
            }
          }
          return merged;
        });
        setHasMore(!!data.hasMore);
        setTotal(data.total || 0);
      } else {
        setToast({
          type: "error",
          text: data.message || "Failed to load more certificates",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        text: "Failed to load more certificates",
      });
    } finally {
      setLoadingMore(false);
    }
  }, [certificates.length, debouncedSearch, hasMore, loadingMore]);

  // ==========================================
  // TRIGGER FETCH ON SEARCH CHANGE / MOUNT
  // ==========================================
  useEffect(() => {
    fetchCertificates(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ==========================================
  // AUTO-CLEAR TOAST
  // ==========================================
  useEffect(() => {
    if (toast.text) {
      const t = setTimeout(() => setToast({ type: "", text: "" }), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ==========================================
  // GROUPING (client-side, applied to loaded certs)
  // ==========================================
  const groupedCertificates = React.useMemo(() => {
    const groups = {};
    certificates.forEach((cert) => {
      let groupKey, groupLabel, groupType;
      if (cert.batchId) {
        groupKey = `batch-${cert.batchId}`;
        groupLabel = cert.event?.eventName
          ? `${cert.event.eventName} — Batch`
          : `Bulk Generation`;
        groupType = "batch";
      } else if (cert.event?.eventId) {
        groupKey = `event-${cert.event.eventId}`;
        groupLabel = cert.event.eventName || "Unknown Event";
        groupType = "event";
      } else {
        groupKey = `custom-${cert.certificateType}`;
        groupLabel = `Custom — ${formatCertificateType(cert.certificateType)}`;
        groupType = "custom";
      }
      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          label: groupLabel,
          type: groupType,
          eventDate: cert.event?.eventDate || null,
          batchId: cert.batchId || null,
          eventId: cert.event?.eventId || null,
          certificates: [],
        };
      }
      groups[groupKey].certificates.push(cert);
    });

    return Object.values(groups).sort((a, b) => {
      const aDate = a.certificates[0]?.createdAt || 0;
      const bDate = b.certificates[0]?.createdAt || 0;
      return new Date(bDate) - new Date(aDate);
    });
  }, [certificates]);

  // ==========================================
  // FILTER (type only — search is now backend)
  // ==========================================
  const filteredGroups = React.useMemo(() => {
    let result = groupedCertificates;
    if (filterType !== "all") {
      result = result.filter((g) => g.type === filterType);
    }
    return result;
  }, [groupedCertificates, filterType]);

  const toggleGroup = (key) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const expandAll = () => {
    const all = {};
    filteredGroups.forEach((g) => (all[g.key] = true));
    setExpandedGroups(all);
  };
  const collapseAll = () => setExpandedGroups({});

  // ==========================================
  // STATS — based on loaded certs
  // (total from backend shown separately)
  // ==========================================
  const stats = React.useMemo(() => {
    const loaded = certificates.length;
    const internal = certificates.filter(
      (c) => c.recipient?.isClubMember,
    ).length;
    const external = loaded - internal;
    return {
      loaded,
      internal,
      external,
      groups: groupedCertificates.length,
    };
  }, [certificates, groupedCertificates]);

  // ==========================================
  // BULK SELECTION
  // ==========================================
  const toggleSelectId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectGroup = (group) => {
    const ids = group.certificates.map((c) => c._id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const selectAllVisible = () => {
    const all = filteredGroups.flatMap((g) => g.certificates.map((c) => c._id));
    setSelectedIds(all);
  };

  const clearSelection = () => setSelectedIds([]);

  // ==========================================
  // DELETE HANDLERS
  // ==========================================
  const requestDeleteSingle = (cert) => {
    setConfirmDelete({
      type: "single",
      ids: [cert._id],
      label: cert.recipient?.fullName || cert.certificateId,
      count: 1,
    });
  };

  const requestEdit = (cert) => setEditingCert(cert);

  const requestDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmDelete({
      type: "bulk",
      ids: selectedIds,
      label: `${selectedIds.length} selected certificate${
        selectedIds.length !== 1 ? "s" : ""
      }`,
      count: selectedIds.length,
    });
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/secure/certificates/delete-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: confirmDelete.ids }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", text: data.message });
        setConfirmDelete(null);
        setSelectedIds([]);
        fetchCertificates();
      } else {
        setToast({ type: "error", text: data.message || "Failed to delete" });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", text: "Failed to delete certificates" });
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // SEND CERTIFICATE EMAIL
  // ==========================================
  const sendCertificateEmail = async (cert) => {
    if (!cert) return;

    if (!cert.recipient?.email) {
      setToast({
        type: "error",
        text: "This certificate has no recipient email on file.",
      });
      return;
    }

    setSendingEmailId(cert.certificateId);
    try {
      const res = await fetch(
        "/api/secure/certificates/send-certificate-mail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ certificateId: cert.certificateId }),
        },
      );
      const data = await res.json();

      if (data.success) {
        setToast({ type: "success", text: data.message });
        setCertificates((prev) =>
          prev.map((c) =>
            c.certificateId === cert.certificateId
              ? {
                  ...c,
                  emailSent: true,
                  emailSentAt: data.emailSentAt || new Date().toISOString(),
                }
              : c,
          ),
        );
      } else {
        setToast({
          type: "error",
          text: data.message || "Failed to send certificate email",
        });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", text: "Failed to send certificate email" });
    } finally {
      setSendingEmailId(null);
    }
  };

  // ==========================================
  // PRINT (unchanged)
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
    width: 297mm;
    height: 210mm;
    background-image: url('${bgUrl}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
    overflow: hidden;
  }
  .id-block { position: absolute; top: 18%; right: 10%; text-align: right; }
  .id-value { font-family: 'Courier New', monospace; font-size: 10pt; font-weight: 700; color: #3D444C; line-height: 1.2; margin: 0; }
  .center { position: absolute; left: 10%; right: 10%; top: 22%; bottom: 34%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .title { font-family: 'Playfair Display', Georgia, serif; font-weight: 700; color: #3D444C; font-size: 26pt; letter-spacing: 0.5px; line-height: 1.1; margin: 0 0 6pt; }
  .subtitle { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; color: #555; font-size: 16pt; margin: 0 0 6pt; }
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
    html { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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

    const cleanup = () => {
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 800);
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
        if (win.document.fonts && win.document.fonts.ready) {
          win.document.fonts.ready.then(go);
        } else {
          go();
        }
      };

      if (pendingImgs === 0) {
        afterImages();
      } else {
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

    if (iframe.contentWindow.document.readyState === "complete") {
      waitForAssets();
    } else {
      iframe.addEventListener("load", waitForAssets, { once: true });
      setTimeout(waitForAssets, 200);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Certificates Management
            </h1>
            <p className="text-gray-600 mt-1">
              View and generate certificates for events and custom purposes
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#3D444C] text-white rounded-xl font-semibold hover:bg-[#2a3037] transition-colors shadow-md whitespace-nowrap"
          >
            + Create Certificates
          </button>
        </div>

        {/* Toast */}
        {toast.text && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              toast.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Loaded / Total"
            value={`${stats.loaded} / ${total}`}
            icon="📜"
          />
          <StatCard label="Club Members" value={stats.internal} icon="👤" />
          <StatCard label="External" value={stats.external} icon="🌐" />
          <StatCard label="Groups" value={stats.groups} icon="📁" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name, email, student ID, certificate ID, or event…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3D444C] focus:border-transparent pr-10"
              />
              {searching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-[#3D444C] rounded-full animate-spin" />
                </span>
              )}
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="event">Events</option>
              <option value="batch">Bulk Batches</option>
              <option value="custom">Custom</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <button
              onClick={selectAllVisible}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
            >
              Select All Visible
            </button>
            {selectedIds.length > 0 && (
              <>
                <span className="text-xs text-gray-500">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  Clear
                </button>
                <button
                  onClick={requestDeleteSelected}
                  className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-1"
                >
                  <FaTrash className="text-[10px]" /> Delete Selected
                </button>
              </>
            )}
            {debouncedSearch && (
              <span className="text-xs text-gray-500">
                · showing {certificates.length} matching result
                {certificates.length !== 1 ? "s" : ""} of {total}
              </span>
            )}
          </div>
        </div>

        {/* Groups */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Loading certificates...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500 text-lg">
              {debouncedSearch
                ? "No certificates match your search"
                : certificates.length === 0
                  ? "No certificates created yet"
                  : "No certificates to display"}
            </p>
            {!debouncedSearch && certificates.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-6 py-3 bg-[#3D444C] text-white rounded-xl font-semibold hover:bg-[#2a3037]"
              >
                Create Your First Certificate
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <CertificateGroup
                  key={group.key}
                  group={group}
                  isExpanded={expandedGroups[group.key]}
                  onToggle={() => toggleGroup(group.key)}
                  selectedIds={selectedIds}
                  onToggleSelectId={toggleSelectId}
                  onToggleSelectGroup={() => toggleSelectGroup(group)}
                  onDeleteSingle={requestDeleteSingle}
                  onPrint={handlePrint}
                  onEdit={requestEdit}
                  onSendEmail={sendCertificateEmail}
                  sendingEmailId={sendingEmailId}
                />
              ))}
            </div>

            {/* LOAD MORE */}
            {hasMore && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-[#3D444C] text-white rounded-xl font-semibold hover:bg-[#2a3037] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>Load More ({certificates.length} / {total})</>
                  )}
                </button>
                <p className="text-xs text-gray-500">
                  Showing {certificates.length} of {total} certificates
                </p>
              </div>
            )}

            {!hasMore && total > PAGE_SIZE && (
              <p className="mt-6 text-center text-xs text-gray-500">
                All {total} certificates loaded
              </p>
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <CreateCertificateModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCertificates();
          }}
        />
      )}

      {editingCert && (
        <EditCertificateModal
          cert={editingCert}
          onClose={() => setEditingCert(null)}
          onSuccess={() => {
            setEditingCert(null);
            fetchCertificates();
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          info={confirmDelete}
          deleting={deleting}
          onCancel={() => !deleting && setConfirmDelete(null)}
          onConfirm={performDelete}
        />
      )}
    </div>
  );
};

// ==========================================
// CONFIRM DELETE MODAL
// ==========================================
const ConfirmDeleteModal = ({ info, deleting, onCancel, onConfirm }) => (
  <div
    className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-[60] p-4"
    onClick={onCancel}
  >
    <div
      className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl">
          ⚠
        </div>
        <h3 className="text-lg font-bold text-[#3D444C]">
          Delete Certificate{info.count > 1 ? "s" : ""}?
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        You are about to permanently delete <strong>{info.count}</strong>{" "}
        certificate{info.count > 1 ? "s" : ""} — <br />
        <span className="text-[#3D444C] font-medium">{info.label}</span>
      </p>
      <p className="text-xs text-red-600 mb-5">This action cannot be undone.</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          disabled={deleting}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
);

// ==========================================
// STAT CARD
// ==========================================
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl shadow-md p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-[#3D444C] mt-1">{value}</p>
      </div>
      <span className="text-3xl opacity-60">{icon}</span>
    </div>
  </div>
);

// ==========================================
// CERTIFICATE GROUP
// ==========================================
const CertificateGroup = ({
  group,
  isExpanded,
  onToggle,
  selectedIds,
  onToggleSelectId,
  onToggleSelectGroup,
  onDeleteSingle,
  onPrint,
  onEdit,
  onSendEmail,
  sendingEmailId,
}) => {
  const getTypeBadge = () => {
    switch (group.type) {
      case "event":
        return { label: "Event", className: "bg-blue-100 text-blue-700" };
      case "batch":
        return {
          label: "Bulk Batch",
          className: "bg-purple-100 text-purple-700",
        };
      case "custom":
        return { label: "Custom", className: "bg-amber-100 text-amber-700" };
      default:
        return { label: "Other", className: "bg-gray-100 text-gray-700" };
    }
  };

  const badge = getTypeBadge();
  const groupIds = group.certificates.map((c) => c._id);
  const allSelected =
    groupIds.length > 0 && groupIds.every((id) => selectedIds.includes(id));
  const someSelected =
    !allSelected && groupIds.some((id) => selectedIds.includes(id));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center justify-between hover:bg-gray-50 transition-colors">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-4 p-5 text-left min-w-0"
        >
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelectGroup();
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 cursor-pointer flex-shrink-0"
          />
          <span
            className={`text-xl transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold text-[#3D444C] truncate">
                {group.label}
              </h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {group.certificates.length} certificate
              {group.certificates.length !== 1 ? "s" : ""}
              {group.eventDate &&
                ` • ${new Date(group.eventDate).toLocaleDateString()}`}
            </p>
          </div>
        </button>

        <div className="pr-4 flex items-center gap-2">
          <span className="text-sm text-gray-400 hidden sm:block">
            {isExpanded ? "Hide" : "View"}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 p-3"></th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Certificate ID
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Recipient
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600 hidden md:table-cell">
                    Identifier
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">
                    Email
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">
                    Issued
                  </th>
                  <th className="text-right p-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.certificates.map((cert) => (
                  <CertificateRow
                    key={cert._id}
                    cert={cert}
                    isSelected={selectedIds.includes(cert._id)}
                    onToggleSelect={() => onToggleSelectId(cert._id)}
                    onDelete={() => onDeleteSingle(cert)}
                    onPrint={() => onPrint(cert)}
                    onEdit={() => onEdit(cert)}
                    onSendEmail={() => onSendEmail(cert)}
                    isSendingEmail={sendingEmailId === cert.certificateId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// CERTIFICATE ROW
// ==========================================
const CertificateRow = ({
  cert,
  isSelected,
  onToggleSelect,
  onDelete,
  onPrint,
  onEdit,
  onSendEmail,
  isSendingEmail,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const hasEmail = !!cert.recipient?.email;

  return (
    <>
      <tr
        className={`border-t border-gray-100 hover:bg-gray-50 ${
          isSelected ? "bg-red-50" : ""
        }`}
      >
        <td className="p-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 cursor-pointer"
          />
        </td>
        <td className="p-3 font-mono text-xs text-gray-700">
          {cert.certificateId}
        </td>
        <td className="p-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#3D444C]">
              {cert.recipient?.fullName || "—"}
            </span>
            {cert.recipient?.isClubMember ? (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                Member
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                External
              </span>
            )}
          </div>
          {cert.recipient?.email && (
            <p className="text-xs text-gray-500">{cert.recipient.email}</p>
          )}
        </td>
        <td className="p-3">
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded capitalize">
            {formatCertificateType(cert.certificateType)}
          </span>
          {cert.achievementPosition && (
            <p className="text-xs text-yellow-700 mt-1">
              {cert.achievementPosition}
            </p>
          )}
        </td>
        <td className="p-3 text-xs text-gray-600 hidden md:table-cell">
          {cert.recipient?.studentId ||
            cert.recipient?.externalId ||
            cert.recipient?.externalOrganization ||
            "—"}
        </td>

        {/* EMAIL STATUS COLUMN */}
        <td className="p-3 text-xs hidden lg:table-cell">
          {!hasEmail ? (
            <span
              className="inline-flex items-center gap-1 text-gray-400"
              title="No email on file"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              No email
            </span>
          ) : cert.emailSent ? (
            <span
              className="inline-flex items-center gap-1 text-green-700 font-medium"
              title={
                cert.emailSentAt
                  ? `Sent ${new Date(cert.emailSentAt).toLocaleString()}`
                  : "Sent"
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Sent
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Not sent
            </span>
          )}
        </td>

        <td className="p-3 text-xs text-gray-600 hidden lg:table-cell">
          {new Date(cert.createdAt).toLocaleDateString()}
        </td>

        <td className="p-3 text-right whitespace-nowrap">
          <button
            onClick={() => setShowPreview(true)}
            className="text-xs px-3 py-1.5 bg-[#3D444C] text-white rounded hover:bg-[#2a3037] mr-2"
          >
            Preview
          </button>
          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded mr-2 inline-flex items-center gap-1"
            title="Edit certificate"
          >
            <FaEdit className="text-[10px]" /> Edit
          </button>
          <button
            onClick={onPrint}
            className="text-xs px-3 py-1.5 bg-[#D3A16D] hover:bg-[#994D35] text-white rounded mr-2 inline-flex items-center gap-1"
            title="Print certificate"
          >
            <FaPrint className="text-[10px]" /> Print
          </button>

          {/* SEND / RESEND EMAIL */}
          <button
            onClick={onSendEmail}
            disabled={isSendingEmail || !hasEmail}
            className={`text-xs px-3 py-1.5 rounded mr-2 inline-flex items-center gap-1 ${
              cert.emailSent
                ? "bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200"
                : "bg-green-600 hover:bg-green-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={
              !hasEmail
                ? "No recipient email on file"
                : cert.emailSent
                  ? "Resend certificate email"
                  : "Send certificate email"
            }
          >
            {isSendingEmail ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending
              </>
            ) : (
              <>
                <FaEnvelope className="text-[10px]" />
                {cert.emailSent ? "Resend" : "Send"}
              </>
            )}
          </button>

          <button
            onClick={onDelete}
            className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200"
            title="Delete this certificate"
          >
            <FaTrash className="text-[10px]" />
          </button>
        </td>
      </tr>

      {showPreview && (
        <tr>
          <td colSpan="8" className="p-0">
            <div
              className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4 bg-white/30 backdrop-blur-md"
              onClick={() => setShowPreview(false)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 sm:p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                  <h3 className="font-semibold text-[#3D444C] text-sm sm:text-base">
                    Certificate Preview
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onPrint}
                      className="text-xs px-3 py-1.5 bg-[#D3A16D] hover:bg-[#994D35] text-white rounded inline-flex items-center gap-1"
                    >
                      <FaPrint className="text-[10px]" /> Print
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-gray-500 hover:text-gray-800 text-2xl leading-none w-8 h-8 flex items-center justify-center"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="p-3 sm:p-6">
                  <CertificatePreview cert={cert} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ==========================================
// CERTIFICATE PREVIEW
// ==========================================
const CertificatePreview = ({ cert }) => {
  const bgUrl =
    cert.background?.url ||
    "https://res.cloudinary.com/ffuatrrt/image/upload/v1790161104/certificate_back_1_sxzqf8.jpg";

  const verifyBase =
    process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";
  const verifyUrl = `${verifyBase}/verify-certificate/${cert.certificateId}`;
  const signatureType = cert.signatureType || "system_generated";

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-lg">
        <div className="min-w-[620px] max-w-full">
          <div
            className="relative w-full rounded-lg overflow-hidden shadow-lg"
            style={{
              aspectRatio: "1.414 / 1",
              backgroundImage: `url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute top-[18%] right-[10%] z-10 text-right">
              <p className="font-mono text-[10px] font-bold text-[#3D444C] leading-tight">
                {cert.certificateId}
              </p>
            </div>

            <div className="absolute inset-x-0 top-[20%] bottom-[32%] flex flex-col items-center justify-center text-center px-[8%]">
              <h2
                className="font-bold text-[#3D444C] mb-2 tracking-wide leading-tight"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: "clamp(18px, 2.4vw, 28px)",
                }}
              >
                {cert.title}
              </h2>

              <p
                className="italic text-gray-600 mb-2"
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: "clamp(9px, 1vw, 12px)",
                }}
              >
                This certificate is proudly presented to
              </p>

              <p
                className="font-bold text-[#3D444C] pb-1 px-6 border-b-2 border-[#D3A16D] leading-tight"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: "clamp(22px, 3.2vw, 38px)",
                  letterSpacing: "0.5px",
                }}
              >
                {cert.recipient?.fullName}
              </p>

              {cert.achievementTitle && (
                <p
                  className="font-semibold text-[#994D35] mt-1"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: "clamp(11px, 1.3vw, 15px)",
                  }}
                >
                  {cert.achievementTitle}
                </p>
              )}

              {cert.description && (
                <p
                  className="text-gray-900 max-w-[70%] mt-2 leading-relaxed"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: "clamp(9px, 1vw, 12px)",
                  }}
                >
                  {cert.description}
                </p>
              )}

              {cert.event?.eventName && (
                <p
                  className="text-gray-800 italic mt-2"
                  style={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    fontSize: "clamp(9px, 0.9vw, 11px)",
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
                <div className="flex flex-col items-center gap-1.5">
                  <QRBlock url={verifyUrl} size={48} />
                  <p
                    className="font-semibold text-red-600 italic text-center"
                    style={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: "clamp(8px, 0.9vw, 11px)",
                    }}
                  >
                    This certificate was system generated — no signature
                    required.
                  </p>
                </div>
              )}

              {signatureType === "moderator_signed" && (
                <div className="grid grid-cols-3 items-end gap-3">
                  <div />
                  <div className="flex justify-center">
                    <QRBlock url={verifyUrl} size={60} />
                  </div>
                  <SignatureLine label="Moderator" />
                </div>
              )}

              {signatureType === "moderator_and_principal_signed" && (
                <div className="grid grid-cols-3 items-end gap-3">
                  <SignatureLine label="Principal" />
                  <div className="flex justify-center">
                    <QRBlock url={verifyUrl} size={60} />
                  </div>
                  <SignatureLine label="Moderator" />
                </div>
              )}

              {signatureType === "custom" && (
                <div className="flex items-end justify-between gap-2">
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
                    <QRBlock url={verifyUrl} size={56} />
                    <p
                      className="text-[7px] text-gray-500 mt-1"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4">
        <MetaField label="Certificate ID" value={cert.certificateId} mono />
        <MetaField
          label="Issued On"
          value={new Date(cert.createdAt).toLocaleString()}
        />
        <MetaField
          label="Recipient"
          value={`${cert.recipient?.fullName} (${
            cert.recipient?.isClubMember ? "Member" : "External"
          })`}
        />
        {cert.recipient?.email && (
          <MetaField label="Email" value={cert.recipient.email} />
        )}
        {cert.recipient?.studentId && (
          <MetaField label="Student ID" value={cert.recipient.studentId} />
        )}
        {cert.recipient?.externalOrganization && (
          <MetaField
            label="Organization"
            value={cert.recipient.externalOrganization}
          />
        )}
        {cert.recipient?.externalId && (
          <MetaField label="External ID" value={cert.recipient.externalId} />
        )}
        <MetaField
          label="Issued By"
          value={`${cert.issuedBy?.fullName}${
            cert.issuedBy?.designation ? ` (${cert.issuedBy.designation})` : ""
          }`}
        />
        {cert.signatureType && (
          <MetaField
            label="Signature Type"
            value={formatSignatureType(cert.signatureType)}
          />
        )}
        {cert.batchId && (
          <MetaField label="Batch ID" value={cert.batchId} mono />
        )}
      </div>
    </div>
  );
};

// ==========================================
// SIGNATURE LINE
// ==========================================
const SignatureLine = ({ label, name }) => (
  <div className="flex flex-col items-center w-full max-w-[140px] mx-auto">
    <div className="w-full border-b border-[#3D444C] h-6 mb-1" />
    <p
      className="font-semibold text-[#3D444C] text-center leading-tight"
      style={{
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        fontSize: "clamp(8px, 0.9vw, 11px)",
      }}
    >
      {label}
    </p>
    {name && (
      <p
        className="text-gray-600 text-center leading-tight"
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: "clamp(7px, 0.8vw, 10px)",
        }}
      >
        {name}
      </p>
    )}
  </div>
);

// ==========================================
// QR CODE BLOCK
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

const formatSignatureType = (type) => {
  const map = {
    system_generated: "System Generated",
    moderator_signed: "Moderator Signed",
    moderator_and_principal_signed: "Moderator & Principal Signed",
  };
  return map[type] || formatCertificateType(type);
};

const MetaField = ({ label, value, mono }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
      {label}
    </p>
    <p className={`text-[#3D444C] ${mono ? "font-mono text-xs" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

const formatCertificateType = (type) => {
  if (!type) return "—";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default AdminCertificatesClient;