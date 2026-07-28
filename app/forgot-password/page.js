// app/forgot-password/page.js
import React from 'react';
import ForgotPasswordClient from './ForgotPasswordClient';
import { redirect } from 'next/navigation';
import { getAuthToken, verifyToken } from '../lib/authUtils';

export const metadata = {
  title: 'Forgot Password - ACC Career Club | Adamjee Cantonment College',
  description: 'Reset your ACC Career Club account password. Enter your College ID to receive a verification code and set a new password.',
  keywords: [
    'Forgot Password ACC',
    'Reset Password ACC Career Club',
    'Adamjee Cantonment College Password Reset',
    'ACC Account Recovery',
    'Student Password Reset',
    'ACC Career Club',
  ],
  openGraph: {
    title: 'Forgot Password - ACC Career Club | Adamjee Cantonment College',
    description: 'Reset your password for ACC Career Club account. Secure password recovery with OTP verification.',
    url: 'https://ccacc.vercel.app/forgot-password',
    siteName: 'ACC Career Club',
    images: [
      {
        url: 'https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png',
        width: 1200,
        height: 630,
        alt: 'ACC Career Club - Forgot Password',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password - ACC Career Club',
    description: 'Reset your password for ACC Career Club account with secure OTP verification.',
    site: '@ACCCareerClub',
    creator: '@ACCCareerClub',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Move themeColor to viewport export
export const viewport = {
  themeColor: '#3D444C',
};

// Server-side check to redirect if logged in
const Page = async () => {
  try {
    const token = await getAuthToken();
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // User is logged in, redirect to home
        redirect('/');
      }
    }
  } catch (error) {
    // Token verification failed, allow access to forgot password page
    console.log('User not authenticated, showing forgot password page');
  }

  return <ForgotPasswordClient />;
};

export default Page;