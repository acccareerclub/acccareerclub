// app/api/auth/change-password/send-otp/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import User from '../../../../models/User';
import OTP from '../../../../models/OTP';
import { sendEmail } from '../../../../lib/mailsystem';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { collegeId, userId } = await request.json();

    if (!collegeId) {
      return NextResponse.json({
        success: false,
        message: 'College ID or Email is required'
      }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    // Find user by student ID or email
    let user;
    const isEmail = collegeId.includes('@') && collegeId.includes('.');
    
    if (isEmail) {
      user = await User.findOne({ email: collegeId.toLowerCase().trim() });
    } else {
      user = await User.findOne({ studentId: collegeId.toUpperCase().trim() });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No account found with this College ID or Email'
      }, { status: 404 });
    }

    // If userId provided, verify it matches
    if (userId && user._id.toString() !== userId) {
      return NextResponse.json({
        success: false,
        message: 'User mismatch. Please try again.'
      }, { status: 403 });
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Your account is deactivated. Please contact support.'
      }, { status: 403 });
    }

    // Delete any existing OTPs for this user
    await OTP.deleteMany({ email: user.email });

    // Generate OTP (6 digits)
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Set expiry time (10 minutes from now)
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database
    await OTP.create({
      email: user.email,
      otp: otp,
      userId: user._id,
      expiry: expiryTime,
      verified: false,
      attempts: 0,
    });

    // Mask email for display
    const email = user.email;
    const [localPart, domain] = email.split('@');
    const maskedEmail = localPart.length > 4 
      ? localPart.slice(0, 2) + '****' + localPart.slice(-2) + '@' + domain
      : localPart.slice(0, 1) + '***' + localPart.slice(-1) + '@' + domain;

    // Send OTP via email
    const emailSubject = 'Change Password OTP - ACC Career Club';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
          <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #3D444C; margin-top: 0;">Change Password Request</h2>
          
          <p style="color: #555;">Dear ${user.fullName},</p>
          
          <p style="color: #555;">We received a request to change your password for your ACC Career Club account.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #555; font-size: 14px;">Your OTP for password change is:</p>
            <h2 style="color: #994D35; font-size: 36px; letter-spacing: 5px; margin: 10px 0;">${otp}</h2>
            <p style="margin: 0; color: #777; font-size: 12px;">This OTP will expire in 10 minutes</p>
          </div>
          
          <p style="color: #555; font-size: 14px;">If you didn't request a password change, please contact support immediately.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          
          <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from ACC Career Club. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    const emailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      await OTP.deleteMany({ email: user.email });
      return NextResponse.json({
        success: false,
        message: 'Failed to send OTP. Please try again later.'
      }, { status: 500 });
    }

    console.log(`📧 OTP sent to ${user.email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      maskedEmail: maskedEmail,
      email: user.email
    });

  } catch (error) {
    console.error('❌ Send OTP error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    }, { status: 500 });
  }
}