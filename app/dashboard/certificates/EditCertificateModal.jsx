"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaTimes, FaSpinner, FaPlus, FaTrash, FaSave } from "react-icons/fa";

const CERT_TYPE_OPTIONS = [
  "participation",
  "achievement",
  "completion",
  "appreciation",
  "recognition",
  "organizer",
  "speaker",
  "judge",
  "mentor",
  "excellence",
  "alumni",
  "custom",
];

const POSITION_OPTIONS = [
  { value: "", label: "—" },
  { value: "1st", label: "1st Place" },
  { value: "2nd", label: "2nd Place" },
  { value: "3rd", label: "3rd Place" },
  { value: "champion", label: "Champion" },
  { value: "runner_up", label: "Runner Up" },
  { value: "finalist", label: "Finalist" },
  { value: "honorable_mention", label: "Honorable Mention" },
  { value: "special_mention", label: "Special Mention" },
  { value: "participant", label: "Participant" },
];

const EditCertificateModal = ({ cert, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    certificateType: "participation",
    title: "",
    description: "",
    achievementTitle: "",
    achievementPosition: "",
    signatureType: "system_generated",
    signatories: [],
    backgroundUrl: "",
  });

  // Hydrate from cert
  useEffect(() => {
    if (!cert) return;
    setForm({
      certificateType: cert.certificateType || "participation",
      title: cert.title || "",
      description: cert.description || "",
      achievementTitle: cert.achievementTitle || "",
      achievementPosition: cert.achievementPosition || "",
      signatureType: cert.signatureType || "system_generated",
      signatories: (cert.signatories || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((s, i) => ({
          name: s.name || "",
          designation: s.designation || "",
          signatureUrl: s.signatureUrl || "",
          order: typeof s.order === "number" ? s.order : i,
        })),
      backgroundUrl: cert.background?.url || "",
    });
  }, [cert]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const addSignatory = () => {
    setForm((prev) => ({
      ...prev,
      signatories: [
        ...prev.signatories,
        {
          name: "",
          designation: "",
          signatureUrl: "",
          order: prev.signatories.length,
        },
      ],
    }));
  };

  const updateSignatory = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.signatories];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, signatories: updated };
    });
  };

  const removeSignatory = (index) => {
    setForm((prev) => ({
      ...prev,
      signatories: prev.signatories.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!cert) return;

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const updates = {
        certificateType: form.certificateType,
        title: form.title,
        description: form.description,
        achievementTitle: form.achievementTitle,
        achievementPosition: form.achievementPosition,
        signatureType: form.signatureType,
        signatories:
          form.signatureType === "custom"
            ? form.signatories
            : [], // clear signatories if switching away from custom
      };

      // Only send background if it changed
      if (
        form.backgroundUrl &&
        form.backgroundUrl !== cert.background?.url
      ) {
        updates.background = {
          publicId: cert.background?.publicId || "",
          url: form.backgroundUrl,
        };
      }

      const res = await fetch(
        "/api/secure/certificates/update-certificate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            certificateId: cert.certificateId,
            updates,
          }),
        },
      );

      const data = await res.json();
      if (data.success) {
        toast.success("Certificate updated");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to update certificate");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update certificate");
    } finally {
      setSaving(false);
    }
  };

  if (!cert) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-white/30 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#E7E3D8] rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#3D444C] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Edit Certificate</h2>
            <p className="text-xs text-gray-300 mt-0.5 font-mono">
              {cert.certificateId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Locked info banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <strong>Recipient, Certificate ID, Batch ID, and Issuer</strong>{" "}
            are locked after issuance. To change the recipient, delete this
            certificate and create a new one.
          </div>

          {/* Recipient (read-only) */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-[#3D444C] uppercase tracking-wide mb-2">
              Recipient (locked)
            </h3>
            <p className="text-sm font-medium text-[#3D444C]">
              {cert.recipient?.fullName}
            </p>
            <p className="text-xs text-gray-500">
              {cert.recipient?.isClubMember ? "Member" : "External"}
              {cert.recipient?.studentId
                ? ` • ${cert.recipient.studentId}`
                : cert.recipient?.externalId
                  ? ` • ${cert.recipient.externalId}`
                  : ""}
              {cert.recipient?.email ? ` • ${cert.recipient.email}` : ""}
            </p>
          </div>

          {/* Editable fields */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-1">
              Certificate Content
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Certificate Type
              </label>
              <select
                value={form.certificateType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, certificateType: e.target.value }))
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              >
                {CERT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                placeholder="For participation with us"
              />
            </div>

            {(form.certificateType === "achievement" ||
              cert.achievementTitle) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Achievement Title
                  </label>
                  <input
                    type="text"
                    value={form.achievementTitle}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        achievementTitle: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                    placeholder="e.g., Champion"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    value={form.achievementPosition}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        achievementPosition: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
                  >
                    {POSITION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Signature section */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-1">
              Signatures
            </h3>

            <select
              value={form.signatureType}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  signatureType: e.target.value,
                  ...(e.target.value !== "custom"
                    ? { signatories: [] }
                    : {}),
                }))
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg text-sm"
            >
              <option value="system_generated">
                System Generated (No signature)
              </option>
              <option value="moderator_signed">Moderator Signed</option>
              <option value="moderator_and_principal_signed">
                Moderator & Principal Signed
              </option>
            </select>

            {form.signatureType === "custom" && (
              <div className="space-y-3 mt-2">
                {form.signatories.map((sig, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">
                        Signatory {idx + 1}
                      </span>
                      <button
                        onClick={() => removeSignatory(idx)}
                        className="text-red-500 text-xs flex items-center gap-1"
                      >
                        <FaTrash className="text-[10px]" /> Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={sig.name}
                      onChange={(e) =>
                        updateSignatory(idx, "name", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={sig.designation}
                      onChange={(e) =>
                        updateSignatory(idx, "designation", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={addSignatory}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-[#3D444C] hover:text-[#3D444C] flex items-center justify-center gap-2"
                >
                  <FaPlus className="text-xs" /> Add Signatory
                </button>
              </div>
            )}
          </div>

          {/* Background (optional override) */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-2">
            <h3 className="text-sm font-semibold text-[#3D444C] uppercase tracking-wide mb-1">
              Background Image URL
            </h3>
            <p className="text-xs text-gray-500">
              Leave unchanged unless you want to swap the certificate
              background.
            </p>
            <input
              type="text"
              value={form.backgroundUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, backgroundUrl: e.target.value }))
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs font-mono"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-[#3D444C] text-white rounded-lg font-semibold hover:bg-[#2a3037] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCertificateModal;