// app/api/users/contact/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";

// Cache for 5 minutes — contact roles rarely change
export const revalidate = 300;

// Which roles we expose on the contact page, and how to label them
const ROLE_META = {
  itsecretary: {
    key: "itsecretary",
    label: "IT Secretary",
    tagline: "Technical help & platform support",
    icon: "it",
    accent: "#994D35",
  },
  prefect: {
    key: "prefect",
    label: "Prefect",
    tagline: "Administrative & club operations",
    icon: "prefect",
    accent: "#3D444C",
  },
  assistant_prefect: {
    key: "assistant_prefect",
    label: "Assistant Prefect",
    tagline: "Administrative support & coordination",
    icon: "assistant",
    accent: "#D3A16D",
  },
  modarator: {
    key: "modarator",
    label: "Moderator (Teacher)",
    tagline: "Club moderator & faculty advisor",
    icon: "moderator",
    accent: "#994D35",
  },
};

const SAFE_FIELDS =
  "fullName email phone studentId department role executiveBranch personalInfo.profilePicture";

export async function GET() {
  try {
    await connectToDatabase();

    const roles = Object.keys(ROLE_META);

    const users = await User.find({
      role: { $in: roles },
      isActive: true,
    })
      .select(SAFE_FIELDS)
      .sort({ fullName: 1 })
      .lean();

    // Group by role
    const grouped = {};
    for (const role of roles) grouped[role] = [];

    for (const u of users) {
      const bucket = grouped[u.role];
      if (!bucket) continue;
      bucket.push({
        _id: String(u._id),
        fullName: u.fullName || "",
        email: u.email || "",
        phone: u.phone || "",
        department: u.department || "",
        executiveBranch: u.executiveBranch || "",
        profilePicture: u.personalInfo?.profilePicture || "",
        role: u.role,
      });
    }

    // Build the ordered list of "helpers" for the page
    const helpers = Object.values(ROLE_META).map((meta) => ({
      ...meta,
      members: grouped[meta.key] || [],
      isEmpty: (grouped[meta.key] || []).length === 0,
    }));

    // Fallback info used by the UI when every role is empty
    const hasAnyMember = helpers.some((h) => h.members.length > 0);

    return NextResponse.json({
      success: true,
      hasAnyMember,
      helpers,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Contact fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        hasAnyMember: false,
        helpers: [],
        message: "Failed to load contact information",
      },
      { status: 200 }, // 200 so the page still renders the fallback
    );
  }
}