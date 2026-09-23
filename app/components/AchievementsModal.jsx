// app/components/AchievementsModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const CATEGORIES = [
  "academic", "sports", "cultural", "technical",
  "competition", "olympiad", "volunteering",
  "leadership", "arts", "other", "",
];
const LEVELS = [
  "school", "college", "university", "district",
  "divisional", "national", "international", "",
];

const AchievementsModal = ({ isOpen, onClose, onSave, achievements, isAdminMode = false }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (isOpen) setData(achievements || []);
  }, [isOpen, achievements]);

  if (!isOpen) return null;

  const addItem = () => {
    if (isAdminMode) {
      setData([
        ...data,
        {
          eventName: "",
          organizer: "",
          position: "",
          date: "",
          certificateId: "",
        },
      ]);
    } else {
      setData([
        ...data,
        {
          title: "",
          category: "",
          level: "",
          organizer: "",
          position: "",
          date: "",
          location: "",
          projectOrCompetitionName: "",
        },
      ]);
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setData(updated);
  };

  const removeItem = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(data);
    toast.success(
      isAdminMode
        ? "ACC Career Club achievements updated!"
        : "Achievements updated!",
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#3D444C]/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3D444C]/10">
          <h2 className="text-2xl font-bold text-[#3D444C]">
            {isAdminMode ? "ACC Career Club Achievements" : "Achievements"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3D444C]/10 rounded-full transition-colors"
          >
            <FaTimes className="text-[#3D444C]" />
          </button>
        </div>

        {/* Info banner */}
        <div className="mb-4 p-3 bg-[#D3A16D]/10 border border-[#D3A16D]/30 rounded-lg text-xs text-[#3D444C]">
          {isAdminMode ? (
            <>
              ⚠️ <strong>Admin only:</strong> These achievements are visible on
              the member's profile but can only be edited by admins (Prefect,
              IT Secretary, Moderator, Assistant Prefect).
            </>
          ) : (
            <>
              💡 Add achievements from your whole life — academic, sports,
              cultural, competitions, olympiads, volunteering, etc.
            </>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <p className="text-gray-500 text-sm italic text-center py-6">
              No achievements added yet.
            </p>
          ) : (
            data.map((item, i) => (
              <div
                key={i}
                className="bg-[#E7E3D8]/30 p-4 rounded-xl border border-[#3D444C]/10 relative"
              >
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="absolute top-3 right-3 text-[#994D35] hover:text-red-700"
                >
                  <FaTrash />
                </button>

                {isAdminMode ? (
                  // ===== ADMIN MODE FIELDS =====
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                    <input
                      type="text"
                      placeholder="Event Name (e.g. Talent Hunt 2024)"
                      value={item.eventName || ""}
                      onChange={(e) => updateItem(i, "eventName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Organizer (e.g. ACC Career Club)"
                      value={item.organizer || ""}
                      onChange={(e) => updateItem(i, "organizer", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Position (Champion, Runner-up, Volunteer)"
                      value={item.position || ""}
                      onChange={(e) => updateItem(i, "position", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Date (2024-08-15)"
                      value={item.date || ""}
                      onChange={(e) => updateItem(i, "date", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Certificate ID"
                      value={item.certificateId || ""}
                      onChange={(e) =>
                        updateItem(i, "certificateId", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D] md:col-span-2"
                    />
                  </div>
                ) : (
                  // ===== USER MODE FIELDS =====
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                    <input
                      type="text"
                      placeholder="Achievement Title *"
                      value={item.title || ""}
                      onChange={(e) => updateItem(i, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D] md:col-span-2"
                    />
                    <select
                      value={item.category || ""}
                      onChange={(e) => updateItem(i, "category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D] bg-white"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.filter(Boolean).map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.level || ""}
                      onChange={(e) => updateItem(i, "level", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D] bg-white"
                    >
                      <option value="">Select Level</option>
                      {LEVELS.filter(Boolean).map((l) => (
                        <option key={l} value={l}>
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Organizer"
                      value={item.organizer || ""}
                      onChange={(e) => updateItem(i, "organizer", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Position (1st Place, Winner, Finalist)"
                      value={item.position || ""}
                      onChange={(e) => updateItem(i, "position", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Date (2024-08-15)"
                      value={item.date || ""}
                      onChange={(e) => updateItem(i, "date", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={item.location || ""}
                      onChange={(e) => updateItem(i, "location", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                    />
                    <input
                      type="text"
                      placeholder="Project / Competition Name"
                      value={item.projectOrCompetitionName || ""}
                      onChange={(e) =>
                        updateItem(i, "projectOrCompetitionName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D] md:col-span-2"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={addItem}
          className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#D3A16D] text-[#994D35] py-3 rounded-xl hover:bg-[#D3A16D]/10 transition-colors font-medium"
        >
          <FaPlus /> Add {isAdminMode ? "Club Achievement" : "Achievement"}
        </button>

        {/* Actions */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-[#3D444C]/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-[#3D444C] text-[#E7E3D8] rounded-lg hover:bg-[#994D35] font-medium"
          >
            Save Achievements
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;