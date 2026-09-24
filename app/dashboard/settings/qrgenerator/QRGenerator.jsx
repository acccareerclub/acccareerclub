// app/dashboard/settings/qrgenerator/QRGenerator.jsx
"use client";

import DashboardMenu from "@/app/components/layout/DashboardMenu";
import React, { useState, useRef, useCallback } from "react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import {
  FaQrcode,
  FaDownload,
  FaTrash,
  FaSpinner,
  FaCopy,
  FaInfoCircle,
  FaCheck,
} from "react-icons/fa";

const DEFAULT_TEXT = "";

const QRGenerator = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [size, setSize] = useState(1024); // download size (px)
  const [fgColor, setFgColor] = useState("#3D444C");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrWrapRef = useRef(null); // wraps the on-screen SVG

  // ---------- Copy the text ----------
  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Text copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // ---------- Clear ----------
  const handleClear = () => {
    setText("");
    toast.success("Cleared");
  };

  // ---------- Build a unique filename ----------
  const makeFileName = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp =
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    // Add a short random suffix to avoid collisions when clicking twice
    const rand = Math.random().toString(36).slice(2, 6);
    return `qr-${stamp}-${rand}.png`;
  };

  // ---------- Download as high-res PNG ----------
  const handleDownload = useCallback(async () => {
    if (!text.trim()) {
      toast.error("Enter some text first");
      return;
    }

    setDownloading(true);
    try {
      // 1) Take the SVG currently rendered on screen.
      //    react-qr-code renders a plain SVG, which scales cleanly.
      const svgEl = qrWrapRef.current?.querySelector("svg");
      if (!svgEl) throw new Error("QR SVG not found");

      // 2) Serialize the SVG to a data URL
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // 3) Render into an offscreen canvas at the target size
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Fill background first (so transparent PNGs don't come out black on some viewers)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Load the SVG into an Image and draw it
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            ctx.drawImage(img, 0, 0, size, size);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("Failed to load SVG"));
        img.src = svgUrl;
      });

      URL.revokeObjectURL(svgUrl);

      // 4) Convert canvas to PNG and trigger download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate PNG");
          setDownloading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = makeFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Give the browser a moment before revoking
        setTimeout(() => URL.revokeObjectURL(url), 1500);

        toast.success(`Downloaded ${size}×${size} PNG`);
        setDownloading(false);
      }, "image/png");
    } catch (err) {
      console.error("[QR download]", err);
      toast.error("Failed to generate QR image");
      setDownloading(false);
    }
  }, [text, size, fgColor, bgColor]);

  const hasText = text.trim().length > 0;
  const charCount = text.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="mt-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-[#994D35] flex items-center justify-center text-white shadow-md">
              <FaQrcode className="text-lg" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#3D444C]">
                QR Code Generator
              </h1>
              <p className="text-sm text-[#3D444C]/60">
                Paste any text or URL — get a high-resolution QR code you can
                download instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* ============ LEFT: INPUT PANEL ============ */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-[#3D444C]/10 p-5 sm:p-7">
            {/* Textarea */}
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="qr-text"
                className="text-sm font-semibold text-[#3D444C]"
              >
                Text or URL
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#3D444C]/50 font-mono">
                  {charCount} chars
                </span>
                {hasText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 text-[11px] text-[#994D35] hover:text-[#3D444C] font-medium"
                  >
                    <FaTrash className="text-[9px]" /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="qr-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a URL, text, contact info, Wi-Fi credentials, or anything else..."
              rows={7}
              className="w-full px-4 py-3 rounded-xl border border-[#3D444C]/20 bg-[#E7E3D8]/20 text-sm text-[#3D444C] focus:outline-none focus:border-[#3D444C] focus:ring-2 focus:ring-[#D3A16D]/30 resize-none font-mono"
            />

            {/* Copy button under the textarea */}
            {hasText && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-[#3D444C]/5 hover:bg-[#3D444C]/10 text-[#3D444C] font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <FaCheck className="text-[9px] text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <FaCopy className="text-[9px]" />
                      Copy text
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Options */}
            <div className="mt-6 pt-6 border-t border-[#3D444C]/10">
              <h3 className="text-sm font-bold text-[#3D444C] mb-4">
                Download options
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Size */}
                <div>
                  <label className="text-xs text-[#3D444C]/60 font-medium block mb-1.5">
                    Image size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#3D444C]/20 rounded-lg text-sm text-[#3D444C] bg-white focus:outline-none focus:border-[#3D444C]"
                  >
                    <option value={512}>512 × 512 px</option>
                    <option value={1024}>1024 × 1024 px (recommended)</option>
                    <option value={2048}>2048 × 2048 px</option>
                    <option value={4096}>4096 × 4096 px (print)</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#3D444C]/60 font-medium block mb-1.5">
                      Foreground
                    </label>
                    <div className="flex items-center gap-2 border border-[#3D444C]/20 rounded-lg px-2 py-1.5 bg-white">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-[#3D444C]/70 uppercase">
                        {fgColor}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#3D444C]/60 font-medium block mb-1.5">
                      Background
                    </label>
                    <div className="flex items-center gap-2 border border-[#3D444C]/20 rounded-lg px-2 py-1.5 bg-white">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-[#3D444C]/70 uppercase">
                        {bgColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info note */}
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-[#D3A16D]/10 border border-[#D3A16D]/25">
                <FaInfoCircle className="text-[#994D35] text-xs mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#3D444C]/70 leading-relaxed">
                  QR codes stay scannable at any size. For social media use{" "}
                  <strong>1024px</strong>; for printing flyers or posters use{" "}
                  <strong>2048px</strong> or higher. Keep a good contrast
                  between foreground and background.
                </p>
              </div>
            </div>
          </div>

          {/* ============ RIGHT: PREVIEW ============ */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-[#3D444C]/10 p-5 sm:p-7 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#3D444C]">Preview</h3>
              {hasText && (
                <span className="text-[11px] text-[#3D444C]/50">
                  Live update
                </span>
              )}
            </div>

            {/* QR Preview Area */}
            <div className="flex-1 flex items-center justify-center p-4 rounded-xl bg-[#FAF8F3] border border-dashed border-[#3D444C]/15 min-h-[280px]">
              {hasText ? (
                <div
                  ref={qrWrapRef}
                  className="p-3 bg-white rounded-lg shadow-sm"
                  style={{
                    // Sizing here is just for on-screen; the SVG scales infinitely
                    width: "100%",
                    maxWidth: "260px",
                  }}
                >
                  <QRCode
                    value={text}
                    size={256}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    level="M"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaQrcode className="text-5xl text-[#3D444C]/15 mx-auto mb-3" />
                  <p className="text-sm text-[#3D444C]/40">
                    Your QR code will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasText || downloading}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[#994D35] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#3D444C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {downloading ? (
                <>
                  <FaSpinner className="animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <FaDownload /> Download PNG ({size}×{size})
                </>
              )}
            </button>

            {hasText && (
              <p className="mt-2 text-[10px] text-[#3D444C]/40 text-center">
                Filename auto-generated with timestamp for uniqueness
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;