// app/components/CompactProgressRing.jsx
"use client";

import React, { useMemo } from "react";

/**
 * Compute completion percentage only.
 * Excludes accCareerClubAchievements (admin-managed, not user-fillable).
 * This mirrors the logic in ProfileCompletionRing.jsx.
 */
const computeCompletion = (user) => {
  if (!user) return 0;

  const sections = [
    // PERSONAL INFO
    {
      weight: 4,
      check: () =>
        !!user.fullName && !!user.email && !!user.phone && !!user.department,
    },
    {
      weight: 4,
      check: () =>
        !!user.personalInfo?.dateOfBirth &&
        !!user.personalInfo?.bloodGroup &&
        !!user.personalInfo?.religion &&
        !!user.personalInfo?.maritalStatus,
    },
    {
      weight: 4,
      check: () =>
        !!user.personalInfo?.presentAddress &&
        !!user.personalInfo?.permanentAddress,
    },
    {
      weight: 4,
      check: () => !!user.personalInfo?.profilePicture,
    },
    {
      weight: 4,
      check: () =>
        !!user.personalInfo?.bio && user.personalInfo.bio.trim().length > 20,
    },

    // GUARDIAN INFO
    {
      weight: 4,
      check: () =>
        !!user.guardianInfo?.father?.name &&
        !!user.guardianInfo?.father?.occupation,
    },
    {
      weight: 4,
      check: () =>
        !!user.guardianInfo?.mother?.name &&
        !!user.guardianInfo?.mother?.occupation,
    },
    {
      weight: 4,
      check: () =>
        !!user.guardianInfo?.emergencyContact?.name &&
        !!user.guardianInfo?.emergencyContact?.contactNo,
    },

    // ACADEMIC
    {
      weight: 8,
      check: () =>
        !!user.academicInfo?.sscOrEquivalent?.institutionName &&
        !!user.academicInfo?.sscOrEquivalent?.board &&
        !!user.academicInfo?.sscOrEquivalent?.rollNumber &&
        !!user.academicInfo?.sscOrEquivalent?.result,
    },
    {
      weight: 8,
      check: () =>
        !!user.academicInfo?.hscOrEquivalent?.institutionName &&
        !!user.academicInfo?.hscOrEquivalent?.board &&
        !!user.academicInfo?.hscOrEquivalent?.rollNumber &&
        !!user.academicInfo?.hscOrEquivalent?.result,
    },
    {
      weight: 8,
      check: () => {
        const u = user.academicInfo?.university;
        if (!u) return false;
        const hasBasics =
          !!u.registrationNumber && !!u.session && !!u.examSystem;
        const hasSemesters =
          Array.isArray(u.semesters) && u.semesters.length > 0;
        const hasYears = Array.isArray(u.years) && u.years.length > 0;
        return hasBasics && (hasSemesters || hasYears);
      },
    },

    // SKILLS & INTERESTS
    {
      weight: 6,
      check: () => {
        const total =
          (user.skills?.length || 0) + (user.customSkills?.length || 0);
        return total >= 3;
      },
    },
    {
      weight: 6,
      check: () => {
        const total =
          (user.interests?.length || 0) + (user.customInterests?.length || 0);
        return total >= 2;
      },
    },

    // EXPERIENCE
    {
      weight: 8,
      check: () =>
        Array.isArray(user.experience?.clubExperience) &&
        user.experience.clubExperience.length > 0,
    },
    {
      weight: 8,
      check: () =>
        Array.isArray(user.experience?.jobOrInternship) &&
        user.experience.jobOrInternship.length > 0,
    },

    // ACHIEVEMENTS (personal, NOT accCareerClubAchievements)
    {
      weight: 10,
      check: () =>
        Array.isArray(user.achievements) && user.achievements.length >= 2,
    },
    {
      weight: 6,
      check: () =>
        !!user.experience?.extraCurricularActivities &&
        user.experience.extraCurricularActivities.trim().length > 10,
    },
  ];

  let totalWeight = 0;
  let earned = 0;
  sections.forEach((s) => {
    totalWeight += s.weight;
    if (s.check()) earned += s.weight;
  });

  return Math.round((earned / totalWeight) * 100);
};

/** Color tier — continuous red → green gradient. */
const getRingColor = (pct) => {
  // Clamp 0–100
  const p = Math.max(0, Math.min(100, pct));
  // Hue: 0 (red) → 120 (green)
  const hue = (p / 100) * 120;
  // Saturation & Lightness tuned for readable contrast on white
  return `hsl(${hue}, 70%, 42%)`;
};

/**
 * Compact circular progress ring — ring + number only.
 * No message, no title, no chips.
 */
const CompactProgressRing = ({ user, size = 30, stroke = 4 }) => {
  const percentage = useMemo(() => computeCompletion(user), [user]);
  const color = getRingColor(percentage);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`Profile completion: ${percentage}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E7E3D8"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <span
        className="absolute text-[10px] font-extrabold tabular-nums"
        style={{ color }}
      >
        {percentage}
      </span>
    </div>
  );
};

export default CompactProgressRing;