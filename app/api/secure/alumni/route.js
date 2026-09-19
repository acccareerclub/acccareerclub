// app/api/secure/alumni/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { getCurrentUser } from "../../../lib/authUtils";

// ==================== GET: Fetch alumni with search/filter/pagination ====================
export async function GET(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const allowedRoles = [
      "prefect",
      "assistant_prefect",
      "itsecretary",
      "modarator",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 100;
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const batch = searchParams.get("batch") || "";
    const jobStatus = searchParams.get("jobStatus") || ""; // "employed" | "unemployed" | ""

    const skip = (page - 1) * limit;

    // Base query: only alumni
    const query = { role: "alumni" };

    // Department filter
    if (department) {
      query.department = department;
    }

    // Batch filter
    if (batch) {
      query["alumniInfo.batch"] = batch;
    }

    // Job status filter
    if (jobStatus === "unemployed") {
      query["alumniInfo.isUnemployed"] = true;
    } else if (jobStatus === "employed") {
      query["alumniInfo.isUnemployed"] = { $ne: true };
    }

    // Search filter (backend)
    if (search) {
      const searchConditions = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "alumniInfo.contactPhone": { $regex: search, $options: "i" } },
        { "alumniInfo.batch": { $regex: search, $options: "i" } },
        { "alumniInfo.currentJobCompany": { $regex: search, $options: "i" } },
        { "alumniInfo.currentDesignation": { $regex: search, $options: "i" } },
      ];

      // If search also has a department name match, include it
      query.$and = [
        { role: "alumni" },
        { $or: searchConditions },
      ];

      // Remove role from top level since it's in $and
      delete query.role;

      // Reapply other filters alongside $and
      if (department) query.$and.push({ department });
      if (batch) query.$and.push({ "alumniInfo.batch": batch });
      if (jobStatus === "unemployed")
        query.$and.push({ "alumniInfo.isUnemployed": true });
      if (jobStatus === "employed")
        query.$and.push({ "alumniInfo.isUnemployed": { $ne: true } });
    }

    const total = await User.countDocuments(query);

    const alumni = await User.find(query)
      .select(
        "fullName email phone studentId department personalInfo.profilePicture alumniInfo role isVerified isActive createdAt",
      )
      .sort({ "alumniInfo.batch": -1, fullName: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get unique departments and batches for filter dropdowns
    const departments = await User.distinct("department", { role: "alumni" });
    const batches = await User.distinct("alumniInfo.batch", {
      role: "alumni",
      "alumniInfo.batch": { $ne: "" },
    });

    // Sort batches descending (newest first)
    const sortedBatches = batches.sort((a, b) =>
      String(b).localeCompare(String(a)),
    );

    return NextResponse.json({
      success: true,
      alumni,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      filters: {
        departments,
        batches: sortedBatches,
      },
    });
  } catch (error) {
    console.error("Get alumni error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch alumni",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ==================== PUT: Update alumni info or change role ====================
export async function PUT(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const allowedRoles = [
      "prefect",
      "assistant_prefect",
      "itsecretary",
      "modarator",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { userId, action, alumniInfo } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Action: make a user an alumni
    if (action === "makeAlumni") {
      user.role = "alumni";
      user.executiveBranch = null;
      if (!user.alumniInfo) user.alumniInfo = {};
      await user.save();

      return NextResponse.json({
        success: true,
        message: `${user.fullName} is now marked as alumni`,
        user,
      });
    }

    // Action: update alumni info
    if (action === "updateAlumniInfo") {
      if (!user.alumniInfo) user.alumniInfo = {};

      user.alumniInfo = {
        ...user.alumniInfo.toObject?.() || user.alumniInfo,
        ...alumniInfo,
      };

      // If unemployed is checked, clear company and designation
      if (alumniInfo.isUnemployed) {
        user.alumniInfo.currentJobCompany = "";
        user.alumniInfo.currentDesignation = "";
      }

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Alumni info updated successfully",
        user,
      });
    }

    // Action: restore to member
    if (action === "restoreMember") {
      user.role = "member";
      await user.save();

      return NextResponse.json({
        success: true,
        message: `${user.fullName} is now a regular member`,
        user,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Alumni action error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process request",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}