// app/api/users/update-email/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { verifyToken } from '../../../lib/authUtils';

export async function PUT(request) {
  try {
    const { userId, newEmail } = await request.json();

    if (!userId || !newEmail) {
      return NextResponse.json({
        success: false,
        message: 'User ID and new email are required'
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({
        success: false,
        message: 'Please enter a valid email address'
      }, { status: 400 });
    }

    await connectToDatabase();

    // Check if email already exists
    const existingUser = await User.findOne({ 
      email: newEmail.toLowerCase().trim() 
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Email already in use by another account'
      }, { status: 400 });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    user.email = newEmail.toLowerCase().trim();
    user.updatedAt = new Date();
    await user.save();

    // Clear all sessions (force re-login)
    user.sessionToken = null;
    await user.save();

    console.log(`✅ Email updated for user: ${userId} to ${newEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully. Please login with your new email.'
    });

  } catch (error) {
    console.error('❌ Update email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update email. Please try again.'
    }, { status: 500 });
  }
}