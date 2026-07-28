// app/api/auth/change-password/verify-otp/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import OTP from '../../../../models/OTP';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({
        success: false,
        message: 'Email and OTP are required'
      }, { status: 400 });
    }

    await connectToDatabase();

    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(),
      otp: otp
    });

    if (!otpRecord) {
      return NextResponse.json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      }, { status: 400 });
    }

    if (new Date() > otpRecord.expiry) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      }, { status: 400 });
    }

    if (otpRecord.verified) {
      return NextResponse.json({
        success: false,
        message: 'This OTP has already been used. Please request a new one.'
      }, { status: 400 });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      }, { status: 400 });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    }, { status: 500 });
  }
}