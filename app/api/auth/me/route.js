// app/api/auth/me/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/authUtils";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";

export async function GET(request) {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    console.log("Token from cookie:", token ? "Present" : "Not present");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = getCurrentUser(token);

    console.log("Decoded token:", decoded);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get full user data
    const user = await User.findById(decoded.userId).select("-password -__v");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Account deactivated",
        },
        { status: 403 },
      );
    }

    // Validate session token matches
    if (user.sessionToken !== token) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired. Please login again.",
        },
        { status: 401 },
      );
    }

    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        studentId: user.studentId,
        department: user.department,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        noticeMail: user.noticeMail,
        personalInfo: user.personalInfo || {},
        profilePicture: user.personalInfo?.profilePicture || null,
        guardianInfo: user.guardianInfo || {},
        academicInfo: user.academicInfo || {},
        skills: user.skills || [],
        interests: user.interests || [],
        experience: user.experience || {},
        careerClubInfo: user.careerClubInfo || {},
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user data",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT method for updating user profile
export async function PUT(request) {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    console.log("Token from cookie:", token ? "Present" : "Not present");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 },
      );
    }

    // Verify token
    const decoded = getCurrentUser(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 },
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get the user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "Account deactivated",
        },
        { status: 403 },
      );
    }

    // Validate session
    if (user.sessionToken !== token) {
      return NextResponse.json(
        {
          success: false,
          message: "Session expired. Please login again.",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Fields that can be updated
    const allowedFields = [
      "fullName",
      "phone",
      "department",
      "personalInfo",
      "guardianInfo",
      "academicInfo",
      "skills",
      "interests",
      "experience",
      "careerClubInfo",
      "noticeMail",
    ];

    // Update only allowed fields
    let hasUpdates = false;
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        user[field] = body[field];
        hasUpdates = true;
      }
    }

    if (!hasUpdates) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid fields to update",
        },
        { status: 400 },
      );
    }

    // Save the updated user
    await user.save();

    // Return updated user data
    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      studentId: user.studentId,
      department: user.department,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      noticeMail: user.noticeMail,
      personalInfo: user.personalInfo || {},
      profilePicture: user.personalInfo?.profilePicture || null,
      guardianInfo: user.guardianInfo || {},
      academicInfo: user.academicInfo || {},
      skills: user.skills || [],
      interests: user.interests || [],
      experience: user.experience || {},
      careerClubInfo: user.careerClubInfo || {},
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
