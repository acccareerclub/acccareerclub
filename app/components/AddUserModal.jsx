// app/components/AddUserModal.jsx
"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUniversity,
  FaGraduationCap,
  FaCalendarAlt,
  FaBook,
  FaBuilding,
  FaCode,
  FaLightbulb,
  FaUserGraduate,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaUpload,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { MdOutlineSchool } from "react-icons/md";
import Image from "next/image";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  "Department of BBA",
  "Department of Accounting",
  "Department of Management",
  "Department of English",
  "Department of Political Science",
  "Department of Economics",
  "Masters",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const SSC_HSC_GROUPS = ["Humanities", "Business Studies", "Science"];
const EXAM_SYSTEMS = ["semester", "yearly"];

const SKILL_OPTIONS = [
  "Leadership",
  "Basic Computer Skill",
  "AI Tools",
  "Social Media Management",
  "Canva Design",
  "Graphic Design",
  "Digital Marketing",
  "MS Office",
  "Communication English",
  "Team Work",
  "Public Speaking",
];

const INTEREST_OPTIONS = [
  "BCS & Govt. Job",
  "Corporate & MNCs",
  "Entrepreneurship",
  "Defence",
  "Teaching & Research",
  "Banking & Finance",
  "Journalism",
];

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Info
    fullName: "",
    email: "",
    phone: "",
    studentId: "",
    department: "",
    password: "",
    role: "member",

    // Personal Info
    personalInfo: {
      classOrYear: "",
      dateOfBirth: "",
      bloodGroup: "",
      presentAddress: "",
      permanentAddress: "",
      profilePicture: "",
      bio: "",
    },

    // Guardian Info
    guardianInfo: {
      father: { name: "", occupation: "", contactNo: "" },
      mother: { name: "", occupation: "", contactNo: "" },
      emergencyContact: { name: "", relation: "", contactNo: "" },
    },

    // Academic Info
    academicInfo: {
      university: {
        institutionName: "National University",
        collegeName: "Adamjee Cantonment College",
        registrationNumber: "",
        examSystem: "semester",
        session: "",
        cumulativeResult: { cgpa: "", totalCredits: "", remarks: "" },
        semesters: [],
        years: [],
      },
      sscOrEquivalent: {
        institutionName: "",
        group: "",
        board: "",
        rollNumber: "",
        year: "",
        result: "",
        remarks: "",
      },
      hscOrEquivalent: {
        institutionName: "",
        group: "",
        board: "",
        rollNumber: "",
        year: "",
        result: "",
        remarks: "",
      },
    },

    // Skills & Interests
    skills: [],
    interests: [],
    customSkills: [],
    customInterests: [],

    // Career Club Info
    careerClubInfo: {
      reasonToJoin: "",
      interestedCareerOrgOrPos: "",
      requiredSkillsForCareer: "",
      roadmapPlanning: "",
      careerProspectsOfDept: "",
    },

    // Declaration
    declaration: true,
  });

  // Skills & Interests states for modal
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customInterestInput, setCustomInterestInput] = useState("");

  // Handle basic input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle nested input changes
  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDeepNestedChange = (section, subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleGuardianChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      guardianInfo: {
        ...prev.guardianInfo,
        [parent]: {
          ...prev.guardianInfo[parent],
          [field]: value,
        },
      },
    }));
  };

  // Skills & Interests handlers
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const addCustomSkill = () => {
    if (
      customSkillInput.trim() &&
      !selectedSkills.includes(customSkillInput.trim())
    ) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput("");
    }
  };

  const addCustomInterest = () => {
    if (
      customInterestInput.trim() &&
      !selectedInterests.includes(customInterestInput.trim())
    ) {
      setSelectedInterests([...selectedInterests, customInterestInput.trim()]);
      setCustomInterestInput("");
    }
  };

  const removeCustomItem = (item, type) => {
    if (type === "skill") {
      setSelectedSkills(selectedSkills.filter((s) => s !== item));
    } else {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    }
  };

  // Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", "temp");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setImagePreview(data.imageUrl);
        setFormData((prev) => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, profilePicture: data.imageUrl },
        }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API - separate predefined and custom skills/interests
      const predefinedSkills = selectedSkills.filter((s) =>
        SKILL_OPTIONS.includes(s),
      );
      const customSkills = selectedSkills.filter(
        (s) => !SKILL_OPTIONS.includes(s),
      );
      const predefinedInterests = selectedInterests.filter((i) =>
        INTEREST_OPTIONS.includes(i),
      );
      const customInterests = selectedInterests.filter(
        (i) => !INTEREST_OPTIONS.includes(i),
      );

      // Prepare academic data with proper group handling
      const academicInfo = {
        university: {
          ...formData.academicInfo.university,
          institutionName: "National University",
          collegeName: "Adamjee Cantonment College",
        },
        sscOrEquivalent: {
          ...formData.academicInfo.sscOrEquivalent,
          // Ensure group is either a valid value or empty string
          group: formData.academicInfo.sscOrEquivalent.group || "",
        },
        hscOrEquivalent: {
          ...formData.academicInfo.hscOrEquivalent,
          // Ensure group is either a valid value or empty string
          group: formData.academicInfo.hscOrEquivalent.group || "",
        },
      };

      const submitData = {
        ...formData,
        skills: predefinedSkills,
        interests: predefinedInterests,
        customSkills: customSkills,
        customInterests: customInterests,
        academicInfo: academicInfo,
        // Ensure profile picture is set
        personalInfo: {
          ...formData.personalInfo,
          profilePicture:
            imagePreview || formData.personalInfo.profilePicture || "",
        },
      };

      const response = await fetch("/api/secure/users/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User added successfully!");
        onUserAdded();
        onClose();
        resetForm();
      } else {
        toast.error(data.message || "Failed to add user");
      }
    } catch (error) {
      console.error("Add user error:", error);
      toast.error("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      studentId: "",
      department: "",
      password: "",
      role: "member",
      personalInfo: {
        classOrYear: "",
        dateOfBirth: "",
        bloodGroup: "",
        presentAddress: "",
        permanentAddress: "",
        profilePicture: "",
        bio: "",
      },
      guardianInfo: {
        father: { name: "", occupation: "", contactNo: "" },
        mother: { name: "", occupation: "", contactNo: "" },
        emergencyContact: { name: "", relation: "", contactNo: "" },
      },
      academicInfo: {
        university: {
          institutionName: "National University",
          collegeName: "Adamjee Cantonment College",
          registrationNumber: "",
          examSystem: "semester",
          session: "",
          cumulativeResult: { cgpa: "", totalCredits: "", remarks: "" },
          semesters: [],
          years: [],
        },
        sscOrEquivalent: {
          institutionName: "",
          group: "",
          board: "",
          rollNumber: "",
          year: "",
          result: "",
          remarks: "",
        },
        hscOrEquivalent: {
          institutionName: "",
          group: "",
          board: "",
          rollNumber: "",
          year: "",
          result: "",
          remarks: "",
        },
      },
      skills: [],
      interests: [],
      customSkills: [],
      customInterests: [],
      careerClubInfo: {
        reasonToJoin: "",
        interestedCareerOrgOrPos: "",
        requiredSkillsForCareer: "",
        roadmapPlanning: "",
        careerProspectsOfDept: "",
      },
      declaration: true,
    });
    setSelectedSkills([]);
    setSelectedInterests([]);
    setCustomSkillInput("");
    setCustomInterestInput("");
    setImagePreview(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Member" size="xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-h-[70vh] overflow-y-auto px-1"
      >

        {/* Basic Information */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-semibold text-[#3D444C] mb-3 flex items-center gap-2">
            <FaUser className="text-[#994D35]" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                placeholder="Enter student ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
              >
                <option value="member">Member</option>
                <option value="prefect">Prefect</option>
                <option value="itsecretary">IT Secretary</option>
                <option value="modarator">Moderator</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent pr-10"
                    placeholder="Generate or enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="px-3 py-2 bg-[#3D444C] text-white rounded-lg hover:bg-[#994D35] transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>

        

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheckCircle />
            )}
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
