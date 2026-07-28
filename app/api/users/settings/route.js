// app/api/users/settings/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import { getCurrentUser } from "../../../lib/authUtils";

// GET user settings
export async function GET(request) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

    // Verify token and get user
    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user
    const user = await User.findById(decoded.userId).select(
      'noticeMail jobMail newsletterMail fullName email studentId role'
    );

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        noticeMail: user.noticeMail,
        jobMail: user.jobMail,
        newsletterMail: user.newsletterMail,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch settings"
    }, { status: 500 });
  }
}

// PUT update user settings
export async function PUT(request) {
  try {
    // Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

    // Verify token and get user
    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired token"
      }, { status: 401 });
    }

    // Get the userId from the request body
    const { userId, settings } = await request.json();

    // Verify that the user is updating their own settings
    if (userId !== decoded.userId) {
      return NextResponse.json({
        success: false,
        message: "You can only update your own settings"
      }, { status: 403 });
    }

    // Validate settings
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({
        success: false,
        message: "Invalid settings data"
      }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    // Update only the fields that are provided
    if (typeof settings.noticeMail === 'boolean') {
      user.noticeMail = settings.noticeMail;
    }
    if (typeof settings.jobMail === 'boolean') {
      user.jobMail = settings.jobMail;
    }
    if (typeof settings.newsletterMail === 'boolean') {
      user.newsletterMail = settings.newsletterMail;
    }

    // Save the user
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        noticeMail: user.noticeMail,
        jobMail: user.jobMail,
        newsletterMail: user.newsletterMail
      }
    });

  } catch (error) {
    console.error('❌ Error updating settings:', error);
    return NextResponse.json({
      success: false,
      message: "Failed to update settings"
    }, { status: 500 });
  }
}