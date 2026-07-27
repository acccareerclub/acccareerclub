// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { comparePassword, generateToken, setAuthCookie } from '../../../lib/authUtils';

export async function POST(request) {
  try {
    const { identifier, password } = await request.json();
    
    // Validate input
    if (!identifier || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email/Student ID and password are required'
      }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Trim and clean the identifier
    const cleanIdentifier = identifier.trim();
    
    // Check if identifier is an email (contains @) or student ID
    const isEmail = cleanIdentifier.includes('@') && cleanIdentifier.includes('.');
    
    // Build query based on identifier type
    let query = {};
    if (isEmail) {
      query = { email: cleanIdentifier.toLowerCase() };
    } else {
      query = { studentId: cleanIdentifier.toUpperCase() };
    }
    
    console.log(`🔍 Looking for user with ${isEmail ? 'email' : 'student ID'}:`, cleanIdentifier);
    
    // Find user
    const user = await User.findOne(query);
    
    if (!user) {
      console.log('❌ User not found with:', cleanIdentifier);
      return NextResponse.json({
        success: false,
        message: 'Invalid email/student ID or password'
      }, { status: 401 });
    }
    
    console.log('✅ User found:', user.email, user.studentId);
    
    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is deactivated for user:', user.email);
      return NextResponse.json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      }, { status: 403 });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      return NextResponse.json({
        success: false,
        message: 'Invalid email/student ID or password'
      }, { status: 401 });
    }
    
    if (!user.isVerified) {
      console.log('❌ User is not verified!');
      return NextResponse.json({
        success: false,
        message: 'Your account is not verified. Please wait for verification.'
      }, { status: 401 });
    }
    
    // Generate JWT token
    const token = generateToken(user._id, user.email, user.role);
    
    // Update user with session token and last login
    user.sessionToken = token;
    user.lastLogin = new Date();
    await user.save();
    
    // Set cookie
    await setAuthCookie(token);
    
    // Return user data (excluding password)
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
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    console.log('✅ Login successful for:', user.email);
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}