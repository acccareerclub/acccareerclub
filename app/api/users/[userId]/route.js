// app/api/users/[userId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { getCurrentUser } from "../../../lib/authUtils";

export async function GET(request, { params }) {
  try {
    // ✅ Fix: Await the params Promise
    const { userId } = await params;

    console.log("Fetching user with ID:", userId);

    // Verify authentication
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
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
        noticeMail: user.noticeMail,
        personalInfo: user.personalInfo || {},
        guardianInfo: user.guardianInfo || {},
        academicInfo: user.academicInfo || {},
        skills: user.skills || [],
        interests: user.interests || [],
        customSkills: user.customSkills || [],
        customInterests: user.customInterests || [],
        experience: user.experience || {},
        careerClubInfo: user.careerClubInfo || {},
        declaration: user.declaration || false,
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
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // ✅ Fix: Await the params Promise
    const { userId } = await params;

    console.log("Updating user with ID:", userId);

    // Verify authentication
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Fields that can be updated
    const allowedFields = [
      'fullName',
      'phone',
      'department',
      'personalInfo',
      'guardianInfo',
      'academicInfo',
      'skills',
      'interests',
      'customSkills',
      'customInterests',
      'experience',
      'careerClubInfo',
      'declaration',
      'noticeMail'
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
        { status: 400 }
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
      noticeMail: user.noticeMail,
      personalInfo: user.personalInfo || {},
      guardianInfo: user.guardianInfo || {},
      academicInfo: user.academicInfo || {},
      skills: user.skills || [],
      interests: user.interests || [],
      customSkills: user.customSkills || [],
      customInterests: user.customInterests || [],
      experience: user.experience || {},
      careerClubInfo: user.careerClubInfo || {},
      declaration: user.declaration || false,
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
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}