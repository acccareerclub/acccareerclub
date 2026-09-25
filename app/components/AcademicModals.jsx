// app/components/AcademicModals.jsx
import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { FaPlus } from "react-icons/fa";

// Add Semester/Year Modal
export const AddSemesterModal = ({ isOpen, onClose, onAdd, examType }) => {
  const [formData, setFormData] = useState({
    number: "",
    year: "",
    rollNumber: "",
    result: "",
    remarks: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();
    const number = parseInt(formData.number);
    if (!number) return;

    const getOrdinalSuffix = (n) => {
      const suffixes = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
    };

    const newItem = {
      [`${examType === "semester" ? "semesterNumber" : "yearNumber"}`]: number,
      examName: `${number}${getOrdinalSuffix(number)} ${examType === "semester" ? "Semester" : "Year"}`,
      year: formData.year,
      rollNumber: formData.rollNumber,
      result: formData.result,
      remarks: formData.remarks,
    };

    onAdd(newItem);
    setFormData({
      number: "",
      year: "",
      rollNumber: "",
      result: "",
      remarks: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add New ${examType === "semester" ? "Semester" : "Year"}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {examType === "semester" ? "Semester Number" : "Year Number"} *
            </label>
            <select
              name="number"
              value={formData.number || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
              required
            >
              <option value="">
                Select {examType === "semester" ? "Semester" : "Year"}
              </option>
              {(examType === "semester"
                ? [1, 2, 3, 4, 5, 6, 7, 8]
                : [1, 2, 3, 4]
              ).map((n) => {
                const suffix =
                  n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
                const label = examType === "semester" ? "Semester" : "Year";
                return (
                  <option key={n} value={n}>
                    {n}
                    {suffix} {label}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exam Year
            </label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., 2023"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="Enter roll number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result (GPA)
            </label>
            <input
              type="text"
              name="result"
              value={formData.result}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., 3.50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="Any remarks"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add {examType === "semester" ? "Semester" : "Year"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// SSC/HSC Result Edit Modal
export const EditBoardExamModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  data,
  examType,
}) => {
  const [formData, setFormData] = useState(
    data || {
      year: "",
      group: "",
      board: "",
      rollNumber: "",
      institutionName: "",
      result: "",
      remarks: "",
    },
  );

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const groups = ["", "Humanities", "Business Studies", "Science"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              name="year"
              value={formData.year || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., 2020"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <select
              name="group"
              value={formData.group || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group || "empty"} value={group}>
                  {group || "Not Specified"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board
            </label>
            <input
              type="text"
              name="board"
              value={formData.board || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., Dhaka"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="Enter roll number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              name="institutionName"
              value={formData.institutionName || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder={
                examType === "HSC"
                  ? "Enter your HSC college name"
                  : "Enter your SSC school name"
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result (GPA)
            </label>
            <input
              type="text"
              name="result"
              value={formData.result || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., 5.00"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="Any remarks"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors flex items-center gap-2"
          >
            <FaPlus /> Save {examType}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Semester/Year Modal
export const EditSemesterModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  data,
  examType,
}) => {
  const [formData, setFormData] = useState({
    year: "",
    rollNumber: "",
    result: "",
    remarks: "",
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              type="text"
              name="year"
              value={formData.year || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., 2023"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="Enter roll number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result (GPA)
            </label>
            <input
              type="text"
              name="result"
              value={formData.result || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="e.g., 3.50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <input
              type="text"
              name="remarks"
              value={formData.remarks || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
              placeholder="Any remarks"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
