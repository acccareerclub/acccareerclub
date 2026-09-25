// app/components/ExperienceModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const ExperienceModal = ({ isOpen, onClose, onSave, experience }) => {
  const [data, setData] = useState({
    clubExperience: [],
    jobOrInternship: [],
    extraCurricularActivities: "",
  });

  useEffect(() => {
    if (isOpen) {
      setData({
        clubExperience: experience?.clubExperience || [],
        jobOrInternship: experience?.jobOrInternship || [],
        extraCurricularActivities: experience?.extraCurricularActivities || "",
      });
    }
  }, [isOpen, experience]);

  if (!isOpen) return null;

  // ---- Club Experience ----
  const addClub = () => {
    setData({
      ...data,
      clubExperience: [
        ...data.clubExperience,
        { clubName: "", position: "", duration: "", responsibility: "" },
      ],
    });
  };

  const updateClub = (index, field, value) => {
    const updated = [...data.clubExperience];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, clubExperience: updated });
  };

  const removeClub = (index) => {
    setData({
      ...data,
      clubExperience: data.clubExperience.filter((_, i) => i !== index),
    });
  };

  // ---- Job/Internship ----
  const addJob = () => {
    setData({
      ...data,
      jobOrInternship: [
        ...data.jobOrInternship,
        { organization: "", designation: "", duration: "", responsibility: "" },
      ],
    });
  };

  const updateJob = (index, field, value) => {
    const updated = [...data.jobOrInternship];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, jobOrInternship: updated });
  };

  const removeJob = (index) => {
    setData({
      ...data,
      jobOrInternship: data.jobOrInternship.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    onSave(data);
    toast.success("Experience updated!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3D444C]/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-[#3D444C]/20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3D444C]/10">
          <h2 className="text-2xl font-bold text-[#3D444C]">
            Experience & Activities
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3D444C]/10 rounded-full transition-colors"
          >
            <FaTimes className="text-[#3D444C]" />
          </button>
        </div>

        <div className="space-y-6">
          {/* ===== Club Experience ===== */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-[#3D444C]">
                Club Experience
              </h3>
              <button
                type="button"
                onClick={addClub}
                className="flex items-center gap-1 text-sm bg-[#E7E3D8] text-[#994D35] px-3 py-1.5 rounded-lg hover:bg-[#D3A16D]/30 transition-colors"
              >
                <FaPlus className="text-xs" /> Add Club
              </button>
            </div>
            {data.clubExperience.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No club experience added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.clubExperience.map((club, i) => (
                  <div
                    key={i}
                    className="bg-[#E7E3D8]/30 p-4 rounded-xl border border-[#3D444C]/10 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeClub(i)}
                      className="absolute top-3 right-3 text-[#994D35] hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <input
                        type="text"
                        placeholder="Club Name"
                        value={club.clubName || ""}
                        onChange={(e) => updateClub(i, "clubName", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={club.position || ""}
                        onChange={(e) => updateClub(i, "position", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 2022-2023)"
                        value={club.duration || ""}
                        onChange={(e) => updateClub(i, "duration", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                      <input
                        type="text"
                        placeholder="Responsibility"
                        value={club.responsibility || ""}
                        onChange={(e) =>
                          updateClub(i, "responsibility", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== Job / Internship ===== */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-[#3D444C]">
                Job / Internship
              </h3>
              <button
                type="button"
                onClick={addJob}
                className="flex items-center gap-1 text-sm bg-[#E7E3D8] text-[#994D35] px-3 py-1.5 rounded-lg hover:bg-[#D3A16D]/30 transition-colors"
              >
                <FaPlus className="text-xs" /> Add Job
              </button>
            </div>
            {data.jobOrInternship.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No job or internship added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {data.jobOrInternship.map((job, i) => (
                  <div
                    key={i}
                    className="bg-[#E7E3D8]/30 p-4 rounded-xl border border-[#3D444C]/10 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeJob(i)}
                      className="absolute top-3 right-3 text-[#994D35] hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <input
                        type="text"
                        placeholder="Organization"
                        value={job.organization || ""}
                        onChange={(e) =>
                          updateJob(i, "organization", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                      <input
                        type="text"
                        placeholder="Designation"
                        value={job.designation || ""}
                        onChange={(e) =>
                          updateJob(i, "designation", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={job.duration || ""}
                        onChange={(e) => updateJob(i, "duration", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                      <input
                        type="text"
                        placeholder="Responsibility"
                        value={job.responsibility || ""}
                        onChange={(e) =>
                          updateJob(i, "responsibility", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D3A16D]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== Extra Curricular ===== */}
          <div>
            <h3 className="text-lg font-semibold text-[#3D444C] mb-3">
              Extra-Curricular Activities
            </h3>
            <textarea
              value={data.extraCurricularActivities}
              onChange={(e) =>
                setData({ ...data, extraCurricularActivities: e.target.value })
              }
              rows="3"
              placeholder="Describe your extra-curricular activities, hobbies, volunteer work, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-[#3D444C]/10">
          <button
            onClick={onClose}
            className="flex-1 px-2 py-2 md:px-4 md:py-3 border border-[#3D444C]/30 rounded-lg hover:bg-[#E7E3D8] text-[#3D444C] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-2 py-2 md:px-4 md:py-3 bg-[#3D444C] text-[#E7E3D8] rounded-lg hover:bg-[#994D35] font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;