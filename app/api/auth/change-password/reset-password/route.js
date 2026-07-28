// app/api/auth/change-password/reset-password/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import OTP from '../../../../models/OTP';
import { hashPassword } from '../../../../lib/authUtils';

export async function POST(request) {
  try {
    const { email, newPassword, confirmPassword } = await request.json();

    if (!email || !newPassword || !confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Passwords do not match'
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 });
    }

    await connectToDatabase();

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      verified: true
    });

    if (!otpRecord) {
      return NextResponse.json({
        success: false,
        message: 'OTP not verified. Please verify your OTP first.'
      }, { status: 400 });
    }

    if (new Date() > otpRecord.expiry) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Delete all OTPs for this user
    await OTP.deleteMany({ email: email.toLowerCase() });

    console.log(`✅ Password changed successfully for: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully. Please login with your new password.'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to change password. Please try again.'
    }, { status: 500 });
  }
}