// app/components/ProfileCompletionRing.jsx
"use client";

import React, { useMemo } from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaTrophy,
  FaStar,
} from "react-icons/fa";

/**
 * Compute the completion percentage and breakdown for a user profile.
 * Excludes accCareerClubAchievements because that's admin-managed,
 * not something the user can fill in themselves.
 */
const computeCompletion = (user) => {
  if (!user) return { percentage: 0, sections: [], missing: [] };

  const sections = [
    // ---------- PERSONAL INFO (weight: 20%) ----------
    {
      key: "personalBasic",
      label: "Basic Contact",
      weight: 4,
      scrollTo: "profile-personal", // 👈 DOM id
      check: () =>
        !!user.fullName && !!user.email && !!user.phone && !!user.department,
    },
    {
      key: "personalDetails",
      label: "Personal Details",
      weight: 4,
      scrollTo: "profile-personal",
      check: () =>
        !!user.personalInfo?.dateOfBirth &&
        !!user.personalInfo?.bloodGroup &&
        !!user.personalInfo?.religion &&
        !!user.personalInfo?.maritalStatus,
    },
    {
      key: "personalAddress",
      label: "Address Info",
      weight: 4,
      scrollTo: "profile-address",
      check: () =>
        !!user.personalInfo?.presentAddress &&
        !!user.personalInfo?.permanentAddress,
    },
    {
      key: "profilePicture",
      label: "Profile Picture",
      weight: 4,
      scrollTo: "profile-photo",
      check: () => !!user.personalInfo?.profilePicture,
    },
    {
      key: "bio",
      label: "Bio / About Me",
      weight: 4,
      scrollTo: "profile-personal",
      check: () =>
        !!user.personalInfo?.bio && user.personalInfo.bio.trim().length > 20,
    },

    // ---------- GUARDIAN INFO (weight: 12%) ----------
    {
      key: "guardianFather",
      label: "Father's Info",
      weight: 4,
      scrollTo: "profile-guardian",
      check: () =>
        !!user.guardianInfo?.father?.name &&
        !!user.guardianInfo?.father?.occupation,
    },
    {
      key: "guardianMother",
      label: "Mother's Info",
      weight: 4,
      scrollTo: "profile-guardian",
      check: () =>
        !!user.guardianInfo?.mother?.name &&
        !!user.guardianInfo?.mother?.occupation,
    },
    {
      key: "emergencyContact",
      label: "Emergency Contact",
      weight: 4,
      scrollTo: "profile-guardian",
      check: () =>
        !!user.guardianInfo?.emergencyContact?.name &&
        !!user.guardianInfo?.emergencyContact?.contactNo,
    },

    // ---------- ACADEMIC (weight: 24%) ----------
    {
      key: "ssc",
      label: "SSC",
      weight: 8,
      scrollTo: "profile-ssc",
      check: () =>
        !!user.academicInfo?.sscOrEquivalent?.institutionName &&
        !!user.academicInfo?.sscOrEquivalent?.board &&
        !!user.academicInfo?.sscOrEquivalent?.rollNumber &&
        !!user.academicInfo?.sscOrEquivalent?.result,
    },
    {
      key: "hsc",
      label: "HSC",
      weight: 8,
      scrollTo: "profile-hsc",
      check: () =>
        !!user.academicInfo?.hscOrEquivalent?.institutionName &&
        !!user.academicInfo?.hscOrEquivalent?.board &&
        !!user.academicInfo?.hscOrEquivalent?.rollNumber &&
        !!user.academicInfo?.hscOrEquivalent?.result,
    },
    {
      key: "university",
      label: "University",
      weight: 8,
      scrollTo: "profile-university",
      check: () => {
        const u = user.academicInfo?.university;
        if (!u) return false;
        const hasBasics =
          !!u.registrationNumber && !!u.session && !!u.examSystem;
        const hasSemesters =
          Array.isArray(u.semesters) && u.semesters.length > 0;
        const hasYears = Array.isArray(u.years) && u.years.length > 0;
        const hasResults = hasSemesters || hasYears;
        return hasBasics && hasResults;
      },
    },

    // ---------- SKILLS & INTERESTS (weight: 12%) ----------
    {
      key: "skills",
      label: "Skills",
      weight: 6,
      scrollTo: "profile-skills",
      check: () => {
        const total =
          (user.skills?.length || 0) + (user.customSkills?.length || 0);
        return total >= 3;
      },
    },
    {
      key: "interests",
      label: "Interests",
      weight: 6,
      scrollTo: "profile-skills",
      check: () => {
        const total =
          (user.interests?.length || 0) + (user.customInterests?.length || 0);
        return total >= 2;
      },
    },

    // ---------- EXPERIENCE (weight: 16%) ----------
    {
      key: "clubExperience",
      label: "Club Experience",
      weight: 8,
      scrollTo: "profile-experience",
      check: () =>
        Array.isArray(user.experience?.clubExperience) &&
        user.experience.clubExperience.length > 0,
    },
    {
      key: "jobOrInternship",
      label: "Job / Internship",
      weight: 8,
      scrollTo: "profile-experience",
      check: () =>
        Array.isArray(user.experience?.jobOrInternship) &&
        user.experience.jobOrInternship.length > 0,
    },

    // ---------- ACHIEVEMENTS (weight: 16%) ----------
    {
      key: "achievements",
      label: "Achievements (2+)",
      weight: 10,
      scrollTo: "profile-achievements",
      check: () =>
        Array.isArray(user.achievements) && user.achievements.length >= 2,
    },
    {
      key: "extracurricular",
      label: "Extracurricular",
      weight: 6,
      scrollTo: "profile-experience",
      check: () =>
        !!user.experience?.extraCurricularActivities &&
        user.experience.extraCurricularActivities.trim().length > 10,
    },
  ];

  let totalWeight = 0;
  let earned = 0;
  const missing = [];

  sections.forEach((s) => {
    totalWeight += s.weight;
    if (s.check()) {
      earned += s.weight;
    } else {
      missing.push(s);
    }
  });

  const percentage = Math.round((earned / totalWeight) * 100);
  return { percentage, sections, missing };
};

/**
 * Short, honest, motivation-heavy feedback per tier.
 * Low tiers explicitly flag CV weakness.
 */
const getFeedback = (percentage) => {
  if (percentage >= 100) {
    return {
      title: "CV-Ready",
      message: "Fully complete. Ready to impress any recruiter.",
      icon: FaTrophy,
      color: "#16A34A",
      barFrom: "#22C55E",
      barTo: "#4ADE80",
    };
  }
  if (percentage >= 85) {
    return {
      title: "Nearly Perfect",
      message: "A few details left — fill them to stand out.",
      icon: FaStar,
      color: "#16A34A",
      barFrom: "#4ADE80",
      barTo: "#22C55E",
    };
  }
  if (percentage >= 70) {
    return {
      title: "Good, But Weak CV",
      message: "Gaps here will make your CV look average. Fix them.",
      icon: FaCheckCircle,
      color: "#0891B2",
      barFrom: "#22D3EE",
      barTo: "#06B6D4",
    };
  }
  if (percentage >= 50) {
    return {
      title: "Thin CV",
      message: "Recruiters will skip past this. Fill more sections.",
      icon: FaLightbulb,
      color: "#D97706",
      barFrom: "#FBBF24",
      barTo: "#F59E0B",
    };
  }
  if (percentage >= 30) {
    return {
      title: "Bad CV",
      message: "This won't land interviews. Start filling now.",
      icon: FaExclamationTriangle,
      color: "#EA580C",
      barFrom: "#F97316",
      barTo: "#EA580C",
    };
  }
  return {
    title: "CV Is Empty",
    message: "A recruiter would dismiss this instantly. Fill it.",
    icon: FaExclamationTriangle,
    color: "#DC2626",
    barFrom: "#EF4444",
    barTo: "#DC2626",
  };
};

const ProfileCompletionBar = ({ user, onJumpTo }) => {
  const { percentage, missing } = useMemo(
    () => computeCompletion(user),
    [user],
  );

  const feedback = useMemo(() => getFeedback(percentage), [percentage]);

  const FeedbackIcon = feedback.icon;

  const handleChipClick = (section) => {
    if (typeof onJumpTo === "function") {
      onJumpTo(section.scrollTo);
      return;
    }
    // Fallback: scroll natively if parent didn't pass a handler
    if (typeof document !== "undefined" && section.scrollTo) {
      const el = document.getElementById(section.scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#3D444C]/10 p-4 mb-6">
      {/* ---------- Top row ---------- */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-2xl font-extrabold leading-none shrink-0 tabular-nums"
          style={{ color: feedback.color }}
        >
          {percentage}%
        </span>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: feedback.color }}
        >
          <FeedbackIcon className="text-xs" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-bold leading-tight truncate"
            style={{ color: feedback.color }}
          >
            {feedback.title}
          </p>
          <p className="text-xs text-gray-500 leading-tight truncate">
            {feedback.message}
          </p>
        </div>

        {missing.length > 0 && (
          <span className="hidden sm:inline text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">
            {missing.length} missing
          </span>
        )}
      </div>

      {/* ---------- Progress Bar ---------- */}
      <div className="w-full h-2.5 bg-[#E7E3D8] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${feedback.barFrom}, ${feedback.barTo})`,
          }}
        />
      </div>

      {/* ---------- Clickable missing chips ---------- */}
      {missing.length > 0 && percentage < 100 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {missing.slice(0, 4).map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => handleChipClick(section)}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C] font-medium hover:bg-[#994D35] hover:text-white transition-colors cursor-pointer"
              title={`Jump to ${section.label}`}
            >
              {section.label} →
            </button>
          ))}
          {missing.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7E3D8] text-[#3D444C]/60 font-medium">
              +{missing.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionBar;
