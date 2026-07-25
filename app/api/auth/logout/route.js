// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { removeAuthCookie } from '../../../lib/authUtils';

export async function POST(request) {
  try {
    // Remove the authentication cookie
    await removeAuthCookie();
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}