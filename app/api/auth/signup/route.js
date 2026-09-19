// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';
import { hashPassword } from '../../../lib/authUtils';
import { 
  sendVerificationRequestToPrefects, 
  sendStudentConfirmationEmail 
} from '../../../lib/mailsystem';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { fullName, email, phone, studentId, department, password } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !studentId || !department || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'All fields are required' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please enter a valid email address' 
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Password must be at least 8 characters' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { studentId: studentId.trim().toUpperCase() }] 
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase().trim()) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email is already registered. Please use a different email or sign in.' 
          },
          { status: 409 }
        );
      }
      if (existingUser.studentId === studentId.trim().toUpperCase()) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Student ID is already registered. Please contact support if you need assistance.' 
          },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with pending verification
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      studentId: studentId.trim().toUpperCase(),
      department: department.trim(),
      password: hashedPassword,
      role: 'member',
      isVerified: false, // Account is pending verification
      lastLogin: new Date()
    };

    console.log('📝 Creating user:', { 
      email: userData.email, 
      studentId: userData.studentId,
      department: userData.department 
    });

    // Create and save user
    let user;
    try {
      user = new User(userData);
      await user.save();
    } catch (saveError) {
      if (saveError.code === 11000) {
        const field = Object.keys(saveError.keyPattern)[0];
        const value = saveError.keyValue[field];
        return NextResponse.json(
          { 
            success: false, 
            message: `The ${field} "${value}" is already taken. Please use a different one.` 
          },
          { status: 409 }
        );
      }
      throw saveError;
    }

    console.log('✅ User created successfully:', user._id);

    // Send email notifications (don't await to avoid blocking response)
    // Get all prefects and IT secretaries
    const admins = await User.find({
      role: { $in: ['prefect', 'itsecretary'] }
    }).select('email');

    const adminEmails = admins.map(admin => admin.email);

    // Send verification request to admins
    if (adminEmails.length > 0) {
      await sendVerificationRequestToPrefects(userData, adminEmails);
    } else {
      console.warn('⚠️ No prefects or IT secretaries found to send verification email.');
    }

    // Send confirmation email to student
    await sendStudentConfirmationEmail(userData);

    // Return success response
    const userResponse = user.toJSON();
    
    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully! Your account is pending verification. You will receive an email once verified.',
      user: userResponse,
      requiresVerification: true
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { 
          success: false, 
          message: `The ${field} is already taken. Please use a different one.` 
        },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error',
          errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during signup. Please try again.' 
      },
      { status: 500 }
    );
  }
}