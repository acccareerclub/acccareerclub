// app/profile/ProfileClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaGraduationCap,
  FaBriefcase,
  FaCog,
  FaPen,
  FaSave,
  FaTimes,
  FaUniversity,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaGlobe,
  FaLinkedin,
  FaFacebook,
  FaUserCircle,
  FaEdit,
  FaCheckCircle,
  FaExclamationCircle,
  FaCamera,
  FaBuilding,
  FaBirthdayCake,
  FaHeart,
  FaCode,
  FaLightbulb,
  FaAward,
  FaBook,
  FaSchool,
  FaUserGraduate,
  FaInfoCircle,
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import {
  MdOutlineSchool,
  MdOutlineEmail,
  MdPhone,
  MdLocationOn,
} from "react-icons/md";

const ProfileClient = () => {
  const { user, loading, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        studentId: user.studentId || "",
        department: user.department || "",
        role: user.role || "",
        isVerified: user.isVerified || false,
        noticeMail: user.noticeMail !== undefined ? user.noticeMail : true,
        personalInfo: user.personalInfo || {
          classOrYear: "",
          dateOfBirth: "",
          bloodGroup: "",
          facebookIdLink: "",
          linkedInIdLink: "",
          presentAddress: "",
          permanentAddress: "",
          profilePicture: "",
          bio: "",
        },
        guardianInfo: user.guardianInfo || {
          father: { name: "", occupation: "", contactNo: "" },
          mother: { name: "", occupation: "", contactNo: "" },
          emergencyContact: { name: "", relation: "", contactNo: "" },
        },
        academicInfo: user.academicInfo || {
          university: {
            institutionName: "",
            department: "",
            examSystem: "semester",
            semesters: [],
            years: [],
            cumulativeResult: { cgpa: "", grade: "", totalCredits: "", remarks: "" },
            passingYear: "",
            session: "",
          },
          hscOrEquivalent: { year: "", group: "", board: "", result: "", grade: "", instituteName: "", remarks: "" },
          sscOrEquivalent: { year: "", group: "", board: "", result: "", grade: "", instituteName: "", remarks: "" },
        },
        skills: user.skills || [],
        interests: user.interests || [],
        experience: user.experience || {
          clubExperience: [],
          jobOrInternship: [],
          extraCurricularActivities: "",
        },
        careerClubInfo: user.careerClubInfo || {
          reasonToJoin: "",
          interestedCareerOrgOrPos: "",
          requiredSkillsForCareer: "",
          roadmapPlanning: "",
        },
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || "",
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  const handleDeepNestedInputChange = (section, subsection, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [subsection]: {
          ...formData[section]?.[subsection],
          [field]: value,
        },
      },
    });
  };

  const handleArrayInputChange = (section, index, field, value) => {
    const newArray = [...(formData[section] || [])];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({ ...formData, [section]: newArray });
  };

  const handleAddArrayItem = (section, newItem) => {
    setFormData({
      ...formData,
      [section]: [...(formData[section] || []), newItem],
    });
  };

  const handleRemoveArrayItem = (section, index) => {
    const newArray = [...(formData[section] || [])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [section]: newArray });
  };

  const handleAddSkill = () => {
    const skill = prompt("Enter a new skill:");
    if (skill && skill.trim()) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skill.trim()],
      });
    }
  };

  const handleRemoveSkill = (index) => {
    const newSkills = [...(formData.skills || [])];
    newSkills.splice(index, 1);
    setFormData({ ...formData, skills: newSkills });
  };

  const handleAddInterest = () => {
    const interest = prompt("Enter a new interest:");
    if (interest && interest.trim()) {
      setFormData({
        ...formData,
        interests: [...(formData.interests || []), interest.trim()],
      });
    }
  };

  const handleRemoveInterest = (index) => {
    const newInterests = [...(formData.interests || [])];
    newInterests.splice(index, 1);
    setFormData({ ...formData, interests: newInterests });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      studentId: user.studentId || "",
      department: user.department || "",
      role: user.role || "",
      personalInfo: user.personalInfo || {},
      guardianInfo: user.guardianInfo || {},
      academicInfo: user.academicInfo || {},
      skills: user.skills || [],
      interests: user.interests || [],
      experience: user.experience || {},
      careerClubInfo: user.careerClubInfo || {},
    });
    setIsEditing(false);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-500",
      prefect: "bg-blue-500",
      itsecretary: "bg-purple-500",
      moderator: "bg-orange-500",
      student: "bg-green-500",
    };
    return colors[role] || "bg-gray-500";
  };

  // Get role display name
  const getRoleDisplay = (role) => {
    const names = {
      admin: "Administrator",
      prefect: "Prefect",
      itsecretary: "IT Secretary",
      moderator: "Moderator",
      student: "Student",
    };
    return names[role] || role;
  };

  // Render input or display value
  const renderField = (label, value, name, isEditing, type = "text") => {
    if (isEditing) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
          />
        </div>
      );
    }
    return (
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <p className="text-[#3D444C] font-medium">{value || "Not provided"}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              My Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#D3A16D] transition-all duration-300 hover:scale-105 shadow-md"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-400 transition-all duration-300"
                >
                  <FaTimes />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#3D444C] text-[#E7E3D8] px-5 py-2.5 rounded-lg hover:bg-[#994D35] transition-all duration-300 hover:scale-105 shadow-md disabled:opacity-70"
                >
                  {isSaving ? (
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : (
                    <FaSave />
                  )}
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              {/* Cover Image */}
              <div className="h-24 sm:h-32 bg-gradient-to-r from-[#3D444C] to-[#994D35] relative">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1 shadow-xl">
                      <div className="w-full h-full rounded-full bg-[#E7E3D8] flex items-center justify-center text-4xl sm:text-5xl text-[#994D35]">
                        {user?.fullName?.[0] || <FaUserCircle />}
                      </div>
                    </div>
                    <button className="absolute bottom-0 right-0 bg-[#994D35] text-white p-1.5 rounded-full shadow-md hover:bg-[#D3A16D] transition-colors">
                      <FaCamera className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-14 sm:pt-16 pb-6 px-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-[#3D444C]">
                  {user?.fullName}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${user?.isVerified ? "bg-green-500" : "bg-yellow-500"}`}
                  ></span>
                  <span className="text-sm text-gray-600">
                    {user?.isVerified
                      ? "Verified Member"
                      : "Pending Verification"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getRoleBadgeColor(user?.role)}`}
                  >
                    {getRoleDisplay(user?.role)}
                  </span>
                  <span className="px-3 py-1 bg-[#E7E3D8] rounded-full text-xs font-semibold text-[#3D444C]">
                    {user?.studentId}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-left">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MdOutlineEmail className="text-[#994D35] text-lg" />
                    <span className="break-all">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MdPhone className="text-[#994D35] text-lg" />
                    <span>{user?.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaUniversity className="text-[#994D35] text-lg" />
                    <span>{user?.department || "Not specified"}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-400">Member Since</p>
                    <p className="font-semibold text-[#3D444C]">
                      {formatDate(user?.createdAt)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Last Active</p>
                    <p className="font-semibold text-[#3D444C]">
                      {formatDate(user?.lastLogin)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaUser className="text-[#994D35] text-xl" />
                <h3 className="text-xl font-bold text-[#3D444C]">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <p className="text-[#3D444C] font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.phone || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Student ID
                  </label>
                  <p className="text-[#3D444C] font-medium text-gray-500">
                    {user?.studentId} <span className="text-xs text-gray-400">(Cannot be changed)</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.department || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Class/Year
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="classOrYear"
                      value={formData.personalInfo?.classOrYear || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "classOrYear",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.classOrYear || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.personalInfo?.dateOfBirth || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "dateOfBirth",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.dateOfBirth || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Blood Group
                  </label>
                  {isEditing ? (
                    <select
                      name="bloodGroup"
                      value={formData.personalInfo?.bloodGroup || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "bloodGroup",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.bloodGroup || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Facebook ID Link
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="facebookIdLink"
                      value={formData.personalInfo?.facebookIdLink || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "facebookIdLink",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="https://facebook.com/your-profile"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.facebookIdLink || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    LinkedIn ID Link
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="linkedInIdLink"
                      value={formData.personalInfo?.linkedInIdLink || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "linkedInIdLink",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.linkedInIdLink || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Present Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="presentAddress"
                      value={formData.personalInfo?.presentAddress || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "presentAddress",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.presentAddress || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Permanent Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="permanentAddress"
                      value={formData.personalInfo?.permanentAddress || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "permanentAddress",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.permanentAddress || "Not provided"}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.personalInfo?.bio || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "bio",
                          e.target.value,
                        )
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.bio || "No bio added"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBuilding className="text-[#994D35] text-xl" />
                <h3 className="text-xl font-bold text-[#3D444C]">
                  Guardian Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Father's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.guardianInfo?.father?.name || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "father",
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.father?.name || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Father's Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherOccupation"
                      value={formData.guardianInfo?.father?.occupation || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "father",
                          "occupation",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.father?.occupation || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Father's Contact
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherContact"
                      value={formData.guardianInfo?.father?.contactNo || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "father",
                          "contactNo",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.father?.contactNo || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mother's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="motherName"
                      value={formData.guardianInfo?.mother?.name || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "mother",
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.mother?.name || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mother's Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="motherOccupation"
                      value={formData.guardianInfo?.mother?.occupation || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "mother",
                          "occupation",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.mother?.occupation || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mother's Contact
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="motherContact"
                      value={formData.guardianInfo?.mother?.contactNo || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "mother",
                          "contactNo",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.mother?.contactNo || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Emergency Contact Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.guardianInfo?.emergencyContact?.name || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "emergencyContact",
                          "name",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.emergencyContact?.name || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Relation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyRelation"
                      value={formData.guardianInfo?.emergencyContact?.relation || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "emergencyContact",
                          "relation",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.emergencyContact?.relation || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Emergency Contact Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="emergencyContactNo"
                      value={formData.guardianInfo?.emergencyContact?.contactNo || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "guardianInfo",
                          "emergencyContact",
                          "contactNo",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.guardianInfo?.emergencyContact?.contactNo || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaGraduationCap className="text-[#994D35] text-xl" />
                <h3 className="text-xl font-bold text-[#3D444C]">
                  Academic Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    University/College
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="institutionName"
                      value={formData.academicInfo?.university?.institutionName || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "academicInfo",
                          "university",
                          "institutionName",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.university?.institutionName || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Academic Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="academicDepartment"
                      value={formData.academicInfo?.university?.department || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "academicInfo",
                          "university",
                          "department",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.university?.department || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Exam System
                  </label>
                  {isEditing ? (
                    <select
                      name="examSystem"
                      value={formData.academicInfo?.university?.examSystem || "semester"}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "academicInfo",
                          "university",
                          "examSystem",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    >
                      <option value="semester">Semester</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  ) : (
                    <p className="text-[#3D444C] font-medium capitalize">
                      {user?.academicInfo?.university?.examSystem || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Cumulative CGPA
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="cgpa"
                      value={formData.academicInfo?.university?.cumulativeResult?.cgpa || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "academicInfo",
                          "university",
                          "cumulativeResult",
                          { ...formData.academicInfo?.university?.cumulativeResult, cgpa: e.target.value }
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.university?.cumulativeResult?.cgpa || "Not available"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    SSC Result (GPA)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="sscResult"
                      value={formData.academicInfo?.sscOrEquivalent?.result || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "academicInfo",
                          "sscOrEquivalent",
                          "result",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.result || "Not available"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    HSC Result (GPA)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="hscResult"
                      value={formData.academicInfo?.hscOrEquivalent?.result || ""}
                      onChange={(e) =>
                        handleDeepNestedInputChange(
                          "academicInfo",
                          "hscOrEquivalent",
                          "result",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.result || "Not available"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaCode className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">Skills</h3>
                </div>
                {isEditing && (
                  <button
                    onClick={handleAddSkill}
                    className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm"
                  >
                    <FaPlus /> Add Skill
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills?.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#E7E3D8] text-[#3D444C] rounded-full text-sm flex items-center gap-1"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills added</p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaLightbulb className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">Interests</h3>
                </div>
                {isEditing && (
                  <button
                    onClick={handleAddInterest}
                    className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm"
                  >
                    <FaPlus /> Add Interest
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests?.length > 0 ? (
                  formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#D3A16D]/20 text-[#994D35] rounded-full text-sm flex items-center gap-1"
                    >
                      {interest}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveInterest(index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No interests added</p>
                )}
              </div>
            </div>

            {/* Career Club Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBriefcase className="text-[#994D35] text-xl" />
                <h3 className="text-xl font-bold text-[#3D444C]">
                  Career Club Information
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Reason to Join
                  </label>
                  {isEditing ? (
                    <textarea
                      name="reasonToJoin"
                      value={formData.careerClubInfo?.reasonToJoin || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "careerClubInfo",
                          "reasonToJoin",
                          e.target.value,
                        )
                      }
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="Why do you want to join ACC Career Club?"
                    />
                  ) : (
                    <p className="text-[#3D444C]">
                      {user?.careerClubInfo?.reasonToJoin || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Interested Career Organization/Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="interestedCareerOrgOrPos"
                      value={formData.careerClubInfo?.interestedCareerOrgOrPos || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "careerClubInfo",
                          "interestedCareerOrgOrPos",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="e.g., Google, Software Engineer"
                    />
                  ) : (
                    <p className="text-[#3D444C]">
                      {user?.careerClubInfo?.interestedCareerOrgOrPos || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Required Skills for Career
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="requiredSkillsForCareer"
                      value={formData.careerClubInfo?.requiredSkillsForCareer || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "careerClubInfo",
                          "requiredSkillsForCareer",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="Skills you need for your career"
                    />
                  ) : (
                    <p className="text-[#3D444C]">
                      {user?.careerClubInfo?.requiredSkillsForCareer || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Roadmap Planning
                  </label>
                  {isEditing ? (
                    <textarea
                      name="roadmapPlanning"
                      value={formData.careerClubInfo?.roadmapPlanning || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "careerClubInfo",
                          "roadmapPlanning",
                          e.target.value,
                        )
                      }
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="Your career roadmap and planning"
                    />
                  ) : (
                    <p className="text-[#3D444C]">
                      {user?.careerClubInfo?.roadmapPlanning || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileClient;