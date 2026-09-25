// app/profile/[userId]/ProfileClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaSave,
  FaTimes,
  FaUniversity,
  FaUserCircle,
  FaEdit,
  FaCode,
  FaLightbulb,
  FaBuilding,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaBook,
  FaPencilAlt,
  FaCamera,
  FaSpinner,
  FaKey,
  FaTrophy,
  FaMedal,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdOutlineEmail, MdPhone as MdPhoneIcon } from "react-icons/md";
import {
  AddSemesterModal,
  EditBoardExamModal,
  EditSemesterModal,
} from "../../components/AcademicModals";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import EditEmailModal from "../../components/EditEmailModal";
import { SkillsModal } from "../../components/SkillsModal";
import ProfileCompletionBar from "../../components/ProfileCompletionRing";
import Image from "next/image";
import Link from "next/link";
import ReactDOMServer from "react-dom/server";
import CVGenerator from "../../components/CVGenerator";
import UniversalCVGenerator from "../../components/UniversalCVGenerator";
import ExperienceModal from "../../components/ExperienceModal";
import AchievementsModal from "../../components/AchievementsModal";
import ModernCVGenerator from "../../components/ModernCVGenerator";
import ClassicCVGenerator from "../../components/ClassicCVGenerator";

// Department options (same as signup)
const DEPARTMENTS = [
  "Department of BBA",
  "Department of Accounting",
  "Department of Management",
  "Department of English",
  "Department of Political Science",
  "Department of Economics",
  "Masters",
];

// Shimmer Loading Component
const ShimmerLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-5 w-48 bg-gray-200 rounded-lg animate-pulse mt-2"></div>
          </div>
          <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="h-24 sm:h-32 bg-gray-200 animate-pulse"></div>
              <div className="pt-14 sm:pt-16 pb-6 px-4 text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 animate-pulse mx-auto"></div>
                <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse mx-auto mt-3"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse mx-auto mt-2"></div>
                <div className="mt-4 space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-4 w-24 bg-gray-200 rounded-lg animate-pulse mb-1"></div>
                      <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileClient = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [error, setError] = useState(null);

  // Image upload states
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Modal states
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [showEditSemesterModal, setShowEditSemesterModal] = useState(false);
  const [showEditYearModal, setShowEditYearModal] = useState(false);
  const [showEditSSCModal, setShowEditSSCModal] = useState(false);
  const [showEditHSCModal, setShowEditHSCModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditEmailModal, setShowEditEmailModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showClubAchievementsModal, setShowClubAchievementsModal] =
    useState(false);
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [signatureOptions, setSignatureOptions] = useState({
    teacher: false, // left
    coModerator: false, // middle
    moderator: false, // right
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        setError("No user ID provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setFormData(data.user);

          if (authUser && authUser.id === userId) {
            setIsOwnProfile(true);
          }
        } else {
          setError(data.message || "Failed to load profile");
          toast.error(data.message || "Failed to load profile");
          if (data.message === "User not found") {
            setTimeout(() => router.push("/"), 2000);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load profile. Please try again.");
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, authUser, router]);

  // Set image preview when user data loads
  useEffect(() => {
    if (user?.personalInfo?.profilePicture) {
      setImagePreview(user.personalInfo.profilePicture);
    }
  }, [user]);

  const handleExperienceSave = (experienceData) => {
    setFormData({
      ...formData,
      experience: experienceData,
    });
    setUser((prev) => ({
      ...prev,
      experience: experienceData,
    }));
  };

  const handleAchievementsSave = (achievementsData) => {
    setFormData({
      ...formData,
      achievements: achievementsData,
    });
    setUser((prev) => ({
      ...prev,
      achievements: achievementsData,
    }));
  };

  const handleClubAchievementsSave = (achievementsData) => {
    setFormData({
      ...formData,
      accCareerClubAchievements: achievementsData,
    });
    setUser((prev) => ({
      ...prev,
      accCareerClubAchievements: achievementsData,
    }));
  };
  // Image upload handlers
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profilePicture: data.imageUrl,
          },
        }));
        setImagePreview(data.imageUrl);
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(data.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?"))
      return;

    setUploading(true);

    try {
      const response = await fetch(`/api/upload?userId=${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profilePicture: null,
          },
        }));
        setImagePreview(null);
        toast.success("Profile picture removed successfully!");
      } else {
        toast.error(data.message || "Failed to remove image");
      }
    } catch (error) {
      console.error("Remove image error:", error);
      toast.error("Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  // Handlers
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

  const handlePresentAddressChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        presentAddress: value,
        // If "same as present" is ticked, mirror the value live
        permanentAddress: sameAsPresent
          ? value
          : prev.personalInfo?.permanentAddress || "",
      },
    }));
  };

  const handlePermanentAddressChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        permanentAddress: value,
      },
    }));
  };

  const handleToggleSameAsPresent = (checked) => {
    setSameAsPresent(checked);
    if (checked) {
      // Copy present → permanent immediately
      setFormData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          permanentAddress: prev.personalInfo?.presentAddress || "",
        },
      }));
    }
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

  const handleRemoveArrayItem = (section, arrayName, index) => {
    // Only academicInfo.university has semesters/years arrays.
    // Everything else falls back to the shallow path for safety.
    if (section === "academicInfo" && arrayName !== "university") {
      const current = formData.academicInfo?.university?.[arrayName] || [];
      const newArray = [...current];
      newArray.splice(index, 1);
      setFormData({
        ...formData,
        academicInfo: {
          ...formData.academicInfo,
          university: {
            ...formData.academicInfo?.university,
            [arrayName]: newArray,
          },
        },
      });
      return;
    }

    // Fallback for any other shape
    const newArray = [...(formData[section]?.[arrayName] || [])];
    newArray.splice(index, 1);
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [arrayName]: newArray,
      },
    });
  };

  // Check if user is trying to view someone else's profile
  if (authUser?.role === "student" && authUser?.id !== userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-[#3D444C] to-[#994D35] px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D3A16D] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              </div>

              {/* Lock Icon */}
              <div className="relative z-10">
                <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">
                  Access Denied
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  You don't have permission to view this profile
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="text-center">
                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#3D444C] mb-2">
                  You Cannot Peek at Others' Profiles
                </h3>

                <p className="text-gray-600 text-sm mb-6">
                  This profile belongs to another student. Please respect their
                  privacy.
                </p>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400">
                    Student Access Only
                  </span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* User Info Card */}
                <div className="bg-[#E7E3D8]/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#994D35] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {authUser?.fullName?.[0] || "U"}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[#3D444C]">
                        {authUser?.fullName || "Student"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {authUser?.email || "No email"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Student
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {authUser?.studentId || "No ID"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/"
                    className="w-full bg-[#3D444C] text-white py-3 rounded-xl font-semibold hover:bg-[#994D35] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Go to Home
                  </Link>

                  <Link
                    href={`/profile/${authUser?.id}`}
                    className="w-full border-2 border-[#994D35] text-[#994D35] py-3 rounded-xl font-semibold hover:bg-[#994D35] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    View My Profile
                  </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                  If you need access to this profile, please contact the club
                  administration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getOrdinalSuffix = (n) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  };

  // Modal handlers
  const handleAddSemesterModal = (newSemester) => {
    const semesters = [...(formData.academicInfo?.university?.semesters || [])];
    semesters.push(newSemester);
    setFormData({
      ...formData,
      academicInfo: {
        ...formData.academicInfo,
        university: {
          ...formData.academicInfo?.university,
          semesters: semesters,
        },
      },
    });
  };

  const handleAddYearModal = (newYear) => {
    const years = [...(formData.academicInfo?.university?.years || [])];
    years.push(newYear);
    setFormData({
      ...formData,
      academicInfo: {
        ...formData.academicInfo,
        university: {
          ...formData.academicInfo?.university,
          years: years,
        },
      },
    });
  };

  const handleEditSemester = (index, updatedData) => {
    const semesters = [...(formData.academicInfo?.university?.semesters || [])];
    semesters[index] = { ...semesters[index], ...updatedData };
    setFormData({
      ...formData,
      academicInfo: {
        ...formData.academicInfo,
        university: {
          ...formData.academicInfo?.university,
          semesters: semesters,
        },
      },
    });
  };

  const handleEditYear = (index, updatedData) => {
    const years = [...(formData.academicInfo?.university?.years || [])];
    years[index] = { ...years[index], ...updatedData };
    setFormData({
      ...formData,
      academicInfo: {
        ...formData.academicInfo,
        university: {
          ...formData.academicInfo?.university,
          years: years,
        },
      },
    });
  };

  const handleEditSSC = (data) => {
    setFormData({
      ...formData,
      academicInfo: {
        ...formData.academicInfo,
        sscOrEquivalent: data,
      },
    });
    // ✅ Also update the displayed user object so UI reflects the change
    setUser((prev) => ({
      ...prev,
      academicInfo: {
        ...prev.academicInfo,
        sscOrEquivalent: data,
      },
    }));
  };

  const handleEditHSC = (data) => {
    setFormData({
      ...formData,
      academicInfo: {
        ...formData.academicInfo,
        hscOrEquivalent: data,
      },
    });
    setUser((prev) => ({
      ...prev,
      academicInfo: {
        ...prev.academicInfo,
        hscOrEquivalent: data,
      },
    }));
  };
  const handleSkillsSave = (skillsData) => {
    const next = {
      skills: skillsData.skills,
      interests: skillsData.interests,
      customSkills: skillsData.customSkills,
      customInterests: skillsData.customInterests,
    };
    setFormData({ ...formData, ...next });
    setUser((prev) => ({ ...prev, ...next }));
  };

  const openEditModal = (type, index) => {
    setEditingIndex(index);
    if (type === "semester") {
      const data = formData.academicInfo?.university?.semesters?.[index] || {};
      setEditingData(data);
      setShowEditSemesterModal(true);
    } else if (type === "year") {
      const data = formData.academicInfo?.university?.years?.[index] || {};
      setEditingData(data);
      setShowEditYearModal(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setFormData(data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? All unsaved changes will be lost.",
      )
    ) {
      setFormData(user);
      setIsEditing(false);
    }
  };

  // Scroll to a section and briefly highlight it
  const handleJumpToSection = (sectionId) => {
    if (typeof document === "undefined" || !sectionId) return;

    // If we're not editing yet, enter edit mode so the fields are editable
    if (!isEditing) setIsEditing(true);

    // Wait one frame so the DOM updates with edit inputs, then scroll
    requestAnimationFrame(() => {
      const el = document.getElementById(sectionId);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "start" });

      // Highlight pulse
      el.classList.add(
        "ring-4",
        "ring-[#D3A16D]",
        "ring-offset-2",
        "rounded-2xl",
        "transition-all",
        "duration-500",
      );
      setTimeout(() => {
        el.classList.remove(
          "ring-4",
          "ring-[#D3A16D]",
          "ring-offset-2",
          "rounded-2xl",
        );
      }, 2000);
    });
  };

  const downloadCV = (format) => {
    if (!user) {
      toast.error("Profile not loaded");
      return;
    }

    const componentMap = {
      universal: UniversalCVGenerator,
      modern: ModernCVGenerator,
      classic: ClassicCVGenerator,
    };

    const Generator = componentMap[format] || UniversalCVGenerator;

    const cvHTML = ReactDOMServer.renderToStaticMarkup(
      <Generator user={user} />,
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to download the CV");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(cvHTML);
    printWindow.document.close();
  };

  const handleDownloadProfile = () => {
    if (!user) {
      toast.error("Profile not loaded");
      return;
    }

    const cvHTML = ReactDOMServer.renderToStaticMarkup(
      <CVGenerator user={user} signatures={signatureOptions} />,
    );

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to download the CV");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(cvHTML);
    printWindow.document.close();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  if (loading || authLoading) {
    return <ShimmerLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex flex-col items-center justify-center py-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      {/* Add bottom padding when editing so floating bar doesn't cover content */}
      <div className={`max-w-7xl mx-auto ${isEditing ? "pb-32" : ""}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              {isOwnProfile ? "My Profile" : `${user.fullName}'s Profile`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isOwnProfile
                ? "Manage your personal information and preferences"
                : "View member profile information"}
            </p>
          </div>
          {
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => {
                    const p = user?.personalInfo?.presentAddress || "";
                    const q = user?.personalInfo?.permanentAddress || "";
                    setSameAsPresent(!!p && p === q);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#D3A16D] transition-all duration-300 hover:scale-105 shadow-md"
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="hidden lg:flex gap-3">
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
                </div>
              )}
            </div>
          }
        </div>

        {/* Profile Completion Bar — click a missing chip to jump */}
        <ProfileCompletionBar
          user={isEditing ? formData : user}
          onJumpTo={handleJumpToSection}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-[2px]">
              <div
                id="profile-photo"
                className="h-24 sm:h-32 bg-gradient-to-r from-[#3D444C] to-[#994D35] relative"
              >
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1 shadow-xl">
                      <div
                        className="w-full h-full rounded-full bg-[#E7E3D8] flex items-center justify-center text-4xl sm:text-5xl text-[#994D35] relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          if (imagePreview) {
                            setShowImageModal(true);
                          }
                        }}
                      >
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt={user?.fullName || "Profile"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 96px, 112px"
                            priority
                          />
                        ) : (
                          user?.fullName?.[0] || <FaUserCircle />
                        )}
                      </div>
                    </div>
                    {/* Upload button */}
                    {
                      <div className="absolute -bottom-1 -right-1">
                        <label className="cursor-pointer">
                          <div
                            className={`w-8 h-8 rounded-full bg-[#994D35] text-white flex items-center justify-center shadow-md hover:bg-[#D3A16D] transition-colors duration-200 ${
                              uploading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                          >
                            {uploading ? (
                              <FaSpinner className="animate-spin text-xs" />
                            ) : (
                              <FaCamera className="text-xs" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div className="pt-14 sm:pt-16 pb-1 px-4 text-center">
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
                    <MdPhoneIcon className="text-[#994D35] text-lg" />
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

                {isOwnProfile && (
                  <div className="flex mt-2">
                    <button
                      onClick={() => setShowChangePasswordModal(true)}
                      className="flex m-auto items-center gap-2 bg-[#3D444C] text-white px-5 py-2.5 rounded-lg hover:bg-[#994D35] transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      <FaKey />
                      <span>Change Password</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Download Buttons */}
              <div className="p-3 space-y-2">
                {/* Role-based Profile Download — only for admins */}
                {["itsecretary", "prefect", "assistant_prefect"].includes(
                  authUser?.role,
                ) && (
                  <>
                    {/* Signature options — only for admin roles who see the Official download */}
                    {["itsecretary", "prefect", "assistant_prefect"].includes(
                      authUser?.role,
                    ) && (
                      <div className="bg-[#F5F2EA] border border-[#D3A16D] rounded-xl p-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#994D35] mb-2">
                          Signature Fields (optional)
                        </p>

                        <div className="space-y-1.5">
                          {/* Left */}
                          <label className="flex items-center gap-2 text-xs font-semibold text-[#3D444C] cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={signatureOptions.teacher}
                              onChange={(e) =>
                                setSignatureOptions((prev) => ({
                                  ...prev,
                                  teacher: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 accent-[#994D35]"
                            />
                            Club Teacher Member Signature (left)
                          </label>

                          {/* Middle */}
                          <label className="flex items-center gap-2 text-xs font-semibold text-[#3D444C] cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={signatureOptions.coModerator}
                              onChange={(e) =>
                                setSignatureOptions((prev) => ({
                                  ...prev,
                                  coModerator: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 accent-[#994D35]"
                            />
                            Co-Moderator Signature (middle)
                          </label>

                          {/* Right */}
                          <label className="flex items-center gap-2 text-xs font-semibold text-[#3D444C] cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={signatureOptions.moderator}
                              onChange={(e) =>
                                setSignatureOptions((prev) => ({
                                  ...prev,
                                  moderator: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 accent-[#994D35]"
                            />
                            Moderator Signature (right)
                          </label>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleDownloadProfile}
                      className="w-full flex items-center justify-center gap-3 bg-[#3D444C] text-[#E7E3D8] px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] hover:bg-[#994D35] transition-all duration-300 group cursor-pointer"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Download Profile (Official)</span>
                    </button>
                  </>
                )}

                {/* CV Format Chooser */}
                <details className="relative group">
                  <summary className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#D3A16D] to-[#994D35] text-white px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer list-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Download CV</span>
                    <svg
                      className="w-4 h-4 group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>

                  <div className="mt-2 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => downloadCV("universal")}
                      className="w-full text-left flex items-center gap-3 bg-white border border-[#D3A16D] text-[#3D444C] px-4 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-colors text-sm font-semibold"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#994D35]" />
                      Universal — Sidebar Right
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCV("modern")}
                      className="w-full text-left flex items-center gap-3 bg-white border border-[#D3A16D] text-[#3D444C] px-4 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-colors text-sm font-semibold"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#3D444C]" />
                      Modern — Dark Left Rail
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCV("classic")}
                      className="w-full text-left flex items-center gap-3 bg-white border border-[#D3A16D] text-[#3D444C] px-4 py-2.5 rounded-lg hover:bg-[#E7E3D8] transition-colors text-sm font-semibold"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#8B7355]" />
                      Classic — Single Column
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div
              id="profile-personal"
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <FaUser className="text-[#994D35] text-xl" />
                <h3 className="text-xl font-bold text-[#3D444C]">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-[#3D444C] font-medium">{user?.email}</p>

                    <button
                      onClick={() => setShowEditEmailModal(true)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FaPencilAlt className="text-xs" /> Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Student ID
                  </label>
                  <p className="text-[#3D444C] font-medium text-gray-500">
                    {user?.studentId}{" "}
                    <span className="text-xs text-gray-400">
                      (Cannot be changed)
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Department
                  </label>
                  {isEditing ? (
                    <select
                      name="department"
                      value={formData.department || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white appearance-none"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.department || "Not specified"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Class/Year
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="classOrYear"
                      value={formData.personalInfo?.classOrYear || ""}
                      placeholder="1st Year, 2nd Semester "
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Religion
                  </label>
                  {isEditing ? (
                    <select
                      name="religion"
                      value={formData.personalInfo?.religion || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "religion",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    >
                      <option value="">Select Religion</option>
                      <option value="Islam">Islam</option>
                      <option value="Hinduism">Hinduism</option>
                      <option value="Christianity">Christianity</option>
                      <option value="Buddhism">Buddhism</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.religion || "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Marital Status
                  </label>
                  {isEditing ? (
                    <select
                      name="maritalStatus"
                      value={formData.personalInfo?.maritalStatus || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "maritalStatus",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                    >
                      <option value="">Select Status</option>
                      <option value="Unmarried">Unmarried</option>
                      <option value="Married">Married</option>
                    </select>
                  ) : (
                    <p className="text-[#3D444C] font-medium">
                      {user?.personalInfo?.maritalStatus || "Not provided"}
                    </p>
                  )}
                </div>
                {/* Bio / About Me */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Bio / About Me
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={formData.personalInfo?.bio || ""}
                      onChange={(e) =>
                        handleNestedInputChange(
                          "personalInfo",
                          "bio",
                          e.target.value,
                        )
                      }
                      placeholder="Write a short paragraph about yourself — your background, interests, what drives you, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white resize-y"
                    />
                  ) : (
                    <p className="text-[#3D444C] font-medium whitespace-pre-wrap">
                      {user?.personalInfo?.bio || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
              {/* Address Information */}
              <div id="profile-address" className="mt-4">
                <div className="flex items-center gap-3 mb-4">
                  <FaBuilding className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">
                    Address Information
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Present Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Present Address
                    </label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={formData.personalInfo?.presentAddress || ""}
                        onChange={(e) =>
                          handlePresentAddressChange(e.target.value)
                        }
                        placeholder="House / Road / Area, City, Postal Code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white resize-y"
                      />
                    ) : (
                      <p className="text-[#3D444C] font-medium whitespace-pre-wrap">
                        {user?.personalInfo?.presentAddress || "Not provided"}
                      </p>
                    )}
                  </div>

                  {/* Permanent Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <label className="block text-sm font-medium text-gray-400 italic">
                        Permanent Address
                      </label>

                      {/* Checkbox only meaningful while editing */}
                      {isEditing && (
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-[#3D444C] bg-[#E7E3D8] px-2.5 py-1 rounded-lg hover:bg-[#D3A16D]/30 transition-colors">
                          <input
                            type="checkbox"
                            checked={sameAsPresent}
                            onChange={(e) =>
                              handleToggleSameAsPresent(e.target.checked)
                            }
                            className="w-4 h-4 accent-[#994D35]"
                          />
                          Same as Present Address
                        </label>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={formData.personalInfo?.permanentAddress || ""}
                        onChange={(e) =>
                          handlePermanentAddressChange(e.target.value)
                        }
                        disabled={sameAsPresent}
                        placeholder="House / Road / Area, City, Postal Code"
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white resize-y ${
                          sameAsPresent
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-70"
                            : ""
                        }`}
                      />
                    ) : (
                      <p className="text-[#3D444C] font-medium whitespace-pre-wrap">
                        {user?.personalInfo?.permanentAddress || "Not provided"}
                      </p>
                    )}
                  </div>
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Father's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Father's Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Father's Contact
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Mother's Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Mother's Occupation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Mother's Contact
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
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
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaGraduationCap className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">
                    Academic Information
                  </h3>
                </div>
              </div>

              {/* University Section */}
              <div id="profile-university" className="mb-6">
                <h4 className="font-semibold text-[#3D444C] mb-3 flex items-center gap-2">
                  <FaUniversity className="text-[#994D35]" />
                  University/College
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      University
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.university?.institutionName ||
                        "National University"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      College
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.university?.collegeName ||
                        "Adamjee Cantonment College"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Registration Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          formData.academicInfo?.university
                            ?.registrationNumber || ""
                        }
                        onChange={(e) =>
                          handleDeepNestedInputChange(
                            "academicInfo",
                            "university",
                            "registrationNumber",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      />
                    ) : (
                      <p className="text-[#3D444C] font-medium">
                        {user?.academicInfo?.university?.registrationNumber ||
                          "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Exam System
                    </label>
                    {isEditing ? (
                      <select
                        value={
                          formData.academicInfo?.university?.examSystem ||
                          "semester"
                        }
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
                        {user?.academicInfo?.university?.examSystem ||
                          "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Session
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.academicInfo?.university?.session || ""}
                        onChange={(e) =>
                          handleDeepNestedInputChange(
                            "academicInfo",
                            "university",
                            "session",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      />
                    ) : (
                      <p className="text-[#3D444C] font-medium">
                        {user?.academicInfo?.university?.session ||
                          "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Cumulative CGPA
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={
                          formData.academicInfo?.university?.cumulativeResult
                            ?.cgpa || ""
                        }
                        onChange={(e) =>
                          handleDeepNestedInputChange(
                            "academicInfo",
                            "university",
                            "cumulativeResult",
                            {
                              ...formData.academicInfo?.university
                                ?.cumulativeResult,
                              cgpa: e.target.value,
                            },
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      />
                    ) : (
                      <p className="text-[#3D444C] font-medium">
                        {user?.academicInfo?.university?.cumulativeResult
                          ?.cgpa || "Not available"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  {formData.academicInfo?.university?.examSystem ===
                    "semester" && (
                    <button
                      onClick={() => setShowAddSemesterModal(true)}
                      className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm bg-[#E7E3D8] px-3 py-1 rounded-lg"
                    >
                      <FaPlus /> Add Semester
                    </button>
                  )}
                  {formData.academicInfo?.university?.examSystem ===
                    "yearly" && (
                    <button
                      onClick={() => setShowAddYearModal(true)}
                      className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm bg-[#E7E3D8] px-3 py-1 rounded-lg"
                    >
                      <FaPlus /> Add Year
                    </button>
                  )}
                </div>
              )}

              {/* Semester Results */}
              {formData.academicInfo?.university?.examSystem === "semester" && (
                <div className="mb-6">
                  <h4 className="font-semibold text-[#3D444C] mb-3">
                    Semester Results
                  </h4>

                  {formData.academicInfo?.university?.semesters?.length > 0 ? (
                    formData.academicInfo.university.semesters.map(
                      (semester, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-[#994D35]">
                              {semester.examName ||
                                `Semester ${semester.semesterNumber}`}
                            </h5>
                            <div className="flex gap-2">
                              {isEditing && (
                                <>
                                  <button
                                    onClick={() =>
                                      openEditModal("semester", index)
                                    }
                                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    <FaPencilAlt className="text-xs" /> Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRemoveArrayItem(
                                        "academicInfo",
                                        "semesters",
                                        index,
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500">
                                Year
                              </label>
                              <p className="text-sm font-medium">
                                {semester.year || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">
                                Roll Number
                              </label>
                              <p className="text-sm font-medium">
                                {semester.rollNumber || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">
                                Result (GPA)
                              </label>
                              <p className="text-sm font-medium">
                                {semester.result || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500">
                                Remarks
                              </label>
                              <p className="text-sm font-medium">
                                {semester.remarks || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No semesters added yet. Click "Add Semester" to add your
                      results.
                    </p>
                  )}
                </div>
              )}

              {/* Yearly Results */}
              {formData.academicInfo?.university?.examSystem === "yearly" && (
                <div className="mb-6">
                  <h4 className="font-semibold text-[#3D444C] mb-3">
                    Yearly Results
                  </h4>
                  {formData.academicInfo?.university?.years?.length > 0 ? (
                    formData.academicInfo.university.years.map(
                      (year, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-medium text-[#994D35]">
                              {year.examName || `Year ${year.yearNumber}`}
                            </h5>
                            <div className="flex gap-2">
                              {isEditing && (
                                <>
                                  <button
                                    onClick={() => openEditModal("year", index)}
                                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                                  >
                                    <FaPencilAlt className="text-xs" /> Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRemoveArrayItem(
                                        "academicInfo",
                                        "years",
                                        index,
                                      )
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500">
                                Year
                              </label>
                              <p className="text-sm font-medium">
                                {year.year || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">
                                Roll Number
                              </label>
                              <p className="text-sm font-medium">
                                {year.rollNumber || "N/A"}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">
                                Result (GPA)
                              </label>
                              <p className="text-sm font-medium">
                                {year.result || "N/A"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500">
                                Remarks
                              </label>
                              <p className="text-sm font-medium">
                                {year.remarks || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No years added yet. Click "Add Year" to add your results.
                    </p>
                  )}
                </div>
              )}

              {/* SSC Section */}
              <div id="profile-ssc" className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-[#3D444C] flex items-center gap-2">
                    <FaBook className="text-[#994D35]" />
                    SSC/Equivalent
                  </h4>
                  {isEditing && (
                    <button
                      onClick={() => setShowEditSSCModal(true)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FaPencilAlt className="text-xs" /> Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Institution
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.institutionName ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Group
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.group ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Board
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.board ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Roll Number
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.rollNumber ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Year
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.year ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Result (GPA)
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.sscOrEquivalent?.result ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              {/* HSC Section */}
              <div id="profile-hsc">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-[#3D444C] flex items-center gap-2">
                    <FaBook className="text-[#994D35]" />
                    HSC/Equivalent
                  </h4>
                  {isEditing && (
                    <button
                      onClick={() => setShowEditHSCModal(true)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FaPencilAlt className="text-xs" /> Edit
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Institution
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.institutionName ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Group
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.group ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Board
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.board ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Roll Number
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.rollNumber ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Year
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.year ||
                        "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 italic mb-1">
                      Result (GPA)
                    </label>
                    <p className="text-[#3D444C] font-medium">
                      {user?.academicInfo?.hscOrEquivalent?.result ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Interests */}
            <div
              id="profile-skills"
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaCode className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">
                    Skills & Interests
                  </h3>
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowSkillsModal(true)}
                    className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm bg-[#E7E3D8] px-3 py-1 rounded-lg"
                  >
                    <FaPencilAlt className="text-xs" /> Edit
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#E7E3D8] text-[#3D444C] rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No skills added</p>
                    )}
                    {user?.customSkills?.map((skill, index) => (
                      <span
                        key={`custom-${index}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.interests?.length > 0 ? (
                      user.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#D3A16D]/20 text-[#994D35] rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No interests added
                      </p>
                    )}
                    {user?.customInterests?.map((interest, index) => (
                      <span
                        key={`custom-${index}`}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience & Activities */}
            <div
              id="profile-experience"
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaBriefcase className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">
                    Experience & Activities
                  </h3>
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowExperienceModal(true)}
                    className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm bg-[#E7E3D8] px-3 py-1 rounded-lg"
                  >
                    <FaPencilAlt className="text-xs" /> Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {user?.experience?.clubExperience?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Club Experience
                    </h4>
                    <div className="space-y-2">
                      {user.experience.clubExperience.map((club, i) => (
                        <div
                          key={i}
                          className="border-l-4 border-[#D3A16D] pl-3 py-1"
                        >
                          <p className="font-semibold text-[#3D444C]">
                            {club.position || "Member"} — {club.clubName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {club.duration}
                          </p>
                          {club.responsibility && (
                            <p className="text-sm text-gray-600 mt-1">
                              {club.responsibility}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {user?.experience?.jobOrInternship?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Job / Internship
                    </h4>
                    <div className="space-y-2">
                      {user.experience.jobOrInternship.map((job, i) => (
                        <div
                          key={i}
                          className="border-l-4 border-[#994D35] pl-3 py-1"
                        >
                          <p className="font-semibold text-[#3D444C]">
                            {job.designation} — {job.organization}
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.duration}
                          </p>
                          {job.responsibility && (
                            <p className="text-sm text-gray-600 mt-1">
                              {job.responsibility}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {user?.experience?.extraCurricularActivities && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Extra-Curricular Activities
                    </h4>
                    <p className="text-sm text-[#3D444C]">
                      {user.experience.extraCurricularActivities}
                    </p>
                  </div>
                )}

                {!user?.experience?.clubExperience?.length &&
                  !user?.experience?.jobOrInternship?.length &&
                  !user?.experience?.extraCurricularActivities && (
                    <p className="text-gray-500 text-sm italic">
                      No experience added yet.
                    </p>
                  )}
              </div>
            </div>

            {/* Achievements (user-editable) */}
            <div
              id="profile-achievements"
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaTrophy className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">
                    Achievements
                  </h3>
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowAchievementsModal(true)}
                    className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm bg-[#E7E3D8] px-3 py-1 rounded-lg"
                  >
                    <FaPencilAlt className="text-xs" /> Edit
                  </button>
                )}
              </div>

              {user?.achievements?.length > 0 ? (
                <div className="space-y-3">
                  {user.achievements.map((ach, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-[#D3A16D] pl-3 py-1"
                    >
                      <p className="font-semibold text-[#3D444C]">
                        {ach.title}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                        {ach.position && <span>🏆 {ach.position}</span>}
                        {ach.organizer && <span>🏛 {ach.organizer}</span>}
                        {ach.level && (
                          <span className="capitalize">📍 {ach.level}</span>
                        )}
                        {ach.date && <span>📅 {ach.date}</span>}
                        {ach.location && <span>🗺 {ach.location}</span>}
                      </div>
                      {ach.projectOrCompetitionName && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Project/Contest:</strong>{" "}
                          {ach.projectOrCompetitionName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No achievements added yet.
                </p>
              )}
            </div>

            {/* ACC Career Club Achievements (admin-only editing) */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaMedal className="text-[#994D35] text-xl" />
                  <h3 className="text-xl font-bold text-[#3D444C]">
                    ACC Career Club Achievements
                  </h3>
                </div>
                {[
                  "prefect",
                  "assistant_prefect",
                  "modarator",
                  "itsecretary",
                ].includes(authUser?.role) && (
                  <button
                    onClick={() => setShowClubAchievementsModal(true)}
                    className="flex items-center gap-1 text-[#994D35] hover:text-[#D3A16D] transition-colors text-sm bg-[#E7E3D8] px-3 py-1 rounded-lg"
                  >
                    <FaPencilAlt className="text-xs" /> Edit
                  </button>
                )}
              </div>

              {user?.accCareerClubAchievements?.length > 0 ? (
                <div className="space-y-3">
                  {user.accCareerClubAchievements.map((ach, i) => (
                    <div
                      key={i}
                      className="border-l-4 border-[#994D35] pl-3 py-1"
                    >
                      <p className="font-semibold text-[#3D444C]">
                        {ach.eventName || "Club Achievement"}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                        {ach.position && <span>🏆 {ach.position}</span>}
                        {ach.organizer && <span>🏛 {ach.organizer}</span>}
                        {ach.date && <span>📅 {ach.date}</span>}
                        {ach.certificateId && (
                          <span>📜 {ach.certificateId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No ACC Career Club achievements yet.
                </p>
              )}
            </div>

            {/* Career Club Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBriefcase className="text-[#994D35] text-xl" />
                <h3 className="text-xl font-bold text-[#3D444C]">
                  Career Club Information
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Reason to Join
                  </label>
                  {isEditing ? (
                    <textarea
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
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Interested Career Organization/Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        formData.careerClubInfo?.interestedCareerOrgOrPos || ""
                      }
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
                      {user?.careerClubInfo?.interestedCareerOrgOrPos ||
                        "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Required Skills for Career
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        formData.careerClubInfo?.requiredSkillsForCareer || ""
                      }
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
                      {user?.careerClubInfo?.requiredSkillsForCareer ||
                        "Not provided"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Roadmap Planning
                  </label>
                  {isEditing ? (
                    <textarea
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
                <div>
                  <label className="block text-sm font-medium text-gray-400 italic mb-1">
                    Career Prospects of Your Department
                  </label>
                  {isEditing ? (
                    <textarea
                      value={
                        formData.careerClubInfo?.careerProspectsOfDept || ""
                      }
                      onChange={(e) =>
                        handleNestedInputChange(
                          "careerClubInfo",
                          "careerProspectsOfDept",
                          e.target.value,
                        )
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent text-[#3D444C] bg-white"
                      placeholder="What are the career prospects of your department?"
                    />
                  ) : (
                    <p className="text-[#3D444C]">
                      {user?.careerClubInfo?.careerProspectsOfDept ||
                        "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-start gap-3">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={formData.declaration || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        declaration: e.target.checked,
                      })
                    }
                    className="mt-1 w-5 h-5 text-[#994D35] border-gray-300 rounded focus:ring-[#D3A16D]"
                  />
                ) : (
                  <FaCheckCircle
                    className={`text-xl ${user?.declaration ? "text-green-500" : "text-gray-300"}`}
                  />
                )}
                <div>
                  <p className="text-[#3D444C] font-medium">
                    I declare that all the information provided is correct and
                    complete to the best of my knowledge.
                  </p>
                  {user?.declaration && (
                    <p className="text-sm text-green-600 mt-1">✓ Declared</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          FLOATING ACTION BAR (Edit Mode)
          ============================================ */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <div className="pointer-events-auto bg-[#3D444C] rounded-2xl shadow-2xl border border-[#D3A16D]/30 p-4 sm:p-5 animate-[slideUp_0.3s_ease-out]">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                {/* Warning message */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#D3A16D]/20 flex items-center justify-center shrink-0">
                    <FaExclamationTriangle className="text-[#D3A16D] text-lg" />
                  </div>
                  <div className="text-[#E7E3D8] text-sm">
                    <p className="font-bold text-[#D3A16D]">
                      You're in Edit Mode
                    </p>
                    <p className="text-[#E7E3D8]/80 text-xs mt-0.5">
                      Without final saving, all changes will be lost.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/10 text-[#E7E3D8] px-3 py-2 md:px-5 md:py-3 rounded-xl hover:bg-white/20 transition-all duration-300 font-medium disabled:opacity-50"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-[#D3A16D] to-[#994D35] text-white px-3 py-2 md:px-5 md:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && imagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2 hover:bg-black/70"
            >
              <FaTimes className="text-xl" />
            </button>
            <div className="relative w-full h-full max-h-[80vh] aspect-square">
              <Image
                src={imagePreview}
                alt="Profile Picture"
                fill
                className="object-contain rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <button
              onClick={handleRemoveImage}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg"
            >
              <FaTrash className="text-sm" />
              Remove Picture
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSemesterModal
        isOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        onAdd={handleAddSemesterModal}
        examType="semester"
      />

      <AddSemesterModal
        isOpen={showAddYearModal}
        onClose={() => setShowAddYearModal(false)}
        onAdd={handleAddYearModal}
        examType="year"
      />

      <EditSemesterModal
        isOpen={showEditSemesterModal}
        onClose={() => {
          setShowEditSemesterModal(false);
          setEditingIndex(null);
          setEditingData(null);
        }}
        onSave={(data) => {
          handleEditSemester(editingIndex, data);
          setEditingIndex(null);
          setEditingData(null);
        }}
        title="Edit Semester"
        data={editingData}
        examType="Semester"
      />

      <EditSemesterModal
        isOpen={showEditYearModal}
        onClose={() => {
          setShowEditYearModal(false);
          setEditingIndex(null);
          setEditingData(null);
        }}
        onSave={(data) => {
          handleEditYear(editingIndex, data);
          setEditingIndex(null);
          setEditingData(null);
        }}
        title="Edit Year"
        data={editingData}
        examType="Year"
      />

      <EditBoardExamModal
        isOpen={showEditSSCModal}
        onClose={() => setShowEditSSCModal(false)}
        onSave={handleEditSSC}
        title="Edit SSC Result"
        data={user?.academicInfo?.sscOrEquivalent}
        examType="SSC"
      />

      <EditBoardExamModal
        isOpen={showEditHSCModal}
        onClose={() => setShowEditHSCModal(false)}
        onSave={handleEditHSC}
        title="Edit HSC Result"
        data={user?.academicInfo?.hscOrEquivalent}
        examType="HSC"
      />

      <SkillsModal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        onSave={handleSkillsSave}
        skills={user?.skills || []}
        interests={user?.interests || []}
        customSkills={user?.customSkills || []}
        customInterests={user?.customInterests || []}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        userEmail={user?.email}
        userId={userId}
      />

      <EditEmailModal
        isOpen={showEditEmailModal}
        onClose={() => setShowEditEmailModal(false)}
        currentEmail={user?.email}
        userId={userId}
      />

      <ExperienceModal
        isOpen={showExperienceModal}
        onClose={() => setShowExperienceModal(false)}
        onSave={handleExperienceSave}
        experience={user?.experience || {}}
      />

      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        onSave={handleAchievementsSave}
        achievements={user?.achievements || []}
        isAdminMode={false}
      />

      <AchievementsModal
        isOpen={showClubAchievementsModal}
        onClose={() => setShowClubAchievementsModal(false)}
        onSave={handleClubAchievementsSave}
        achievements={user?.accCareerClubAchievements || []}
        isAdminMode={true}
      />
    </div>
  );
};

export default ProfileClient;
