// app/api/users/about-page/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import Job from "@/app/models/Job";
import Company from "@/app/models/Company";
import Event from "@/app/models/Event";
import Session from "@/app/models/Session";
import DynamicRole from "@/app/models/DynamicRole";

export const revalidate = 300;

// ─────────────────────────────────────────────────────────────
// Roles that should NOT appear in the team grid
// (these are "regular" roles, not leadership positions)
// ─────────────────────────────────────────────────────────────
const NON_STAFF_ROLES = new Set(["member", "alumni", ""]);

// ─────────────────────────────────────────────────────────────
// Display priority — leaders first
// Works with BOTH spellings of "moderator"
// ─────────────────────────────────────────────────────────────
const ROLE_PRIORITY = {
  modarator: 0,
  moderator: 0,
  prefect: 1,
  assistant_prefect: 2,
  itsecretary: 3,
  // anything else (custom roles) → 99
};

// Roles that should NOT have their email shown
const HIDE_EMAIL_ROLES = new Set(["modarator", "moderator"]);

// ============= GET: public stats + team =============
export async function GET() {
  try {
    await connectToDatabase();

    // ---------- Stats ----------
    const [
      activeMembers,
      postedJobs,
      companies,
      eventsHosted,
      sessionsConducted,
    ] = await Promise.all([
      User.countDocuments({
        isActive: true,
        role: { $nin: [...NON_STAFF_ROLES] },
      }),
      Job.countDocuments({ isActive: true }),
      Company.countDocuments({ status: "published" }),
      Event.countDocuments({ isActive: true }),
      Session.countDocuments({ isActive: true }),
    ]);

    // ---------- Team ----------
    // ✅ Fetch ALL active users who are NOT members/alumni.
    // This automatically captures any custom role, misspelling, or
    // future role — no hardcoded list required.
    const teamUsers = await User.find({
      isActive: true,
      role: { $nin: [...NON_STAFF_ROLES] },
    })
      .select(
        "fullName email role executiveBranch personalInfo.profilePicture department membershipId",
      )
      .lean();

    console.log(
      `👥 About-page team query returned ${teamUsers.length} users`,
    );

    // ---------- Build role display name lookup ----------
    const dynamicRoles = await DynamicRole.find({}).lean();
    const dynamicRoleMap = {};
    dynamicRoles.forEach((r) => {
      if (r.roleKey) dynamicRoleMap[r.roleKey.toLowerCase()] = r.displayName;
    });

    // ---------- Build the team array ----------
    const team = teamUsers.map((u) => {
      const roleKey = (u.role || "").toLowerCase();

      const priority =
        ROLE_PRIORITY[roleKey] !== undefined
          ? ROLE_PRIORITY[roleKey]
          : 99; // custom / unknown roles go last

      const hideEmail = HIDE_EMAIL_ROLES.has(roleKey);

      // Display name priority: DynamicRole > hardcoded label > title-cased role
      const roleDisplay =
        dynamicRoleMap[roleKey] ||
        roleLabel(roleKey) ||
        titleCase(roleKey);

      return {
        _id: u._id,
        fullName: u.fullName || "",
        email: hideEmail ? null : u.email || "",
        role: u.role || "",
        roleDisplay,
        executiveBranch: u.executiveBranch || "",
        department: u.department || "",
        membershipId: u.membershipId || "",
        profilePicture: u.personalInfo?.profilePicture || "",
        priority,
      };
    });

    // Sort: priority first, then name
    team.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });

    return NextResponse.json(
      {
        success: true,
        stats: {
          activeMembers,
          postedJobs,
          companies,
          eventsHosted,
          sessionsConducted,
        },
        team,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("❌ About page API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load about page data" },
      { status: 500 },
    );
  }
}

// ---------- Helpers ----------
function roleLabel(role) {
  const map = {
    modarator: "Moderator",
    moderator: "Moderator",
    prefect: "Prefect",
    assistant_prefect: "Assistant Prefect",
    itsecretary: "IT Secretary",
    admin: "Administrator",
    treasurer: "Treasurer",
    secretary: "Secretary",
    president: "President",
    vice_president: "Vice President",
    "vice-president": "Vice President",
  };
  return map[role] || null;
}

function titleCase(str = "") {
  return String(str)
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}