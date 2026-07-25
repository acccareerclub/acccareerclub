// app/profile/page.js
import React from 'react';
import ProfileClient from './ProfileClient';

export const metadata = {
  title: 'ACC Career Club | My Profile - Adamjee Cantonment College',
  description: 'View and manage your ACC Career Club profile. Update your personal information, academic details, skills, and career preferences.',
  keywords: [
    'ACC Career Club Profile',
    'Adamjee Cantonment College',
    'Student Profile',
    'Career Club Member',
    'ACC Member Profile',
    'Student Dashboard',
    'Career Development',
    'Professional Profile',
    'ACC Career Club Member',
    'Student Portfolio'
  ],
  openGraph: {
    title: 'My Profile - ACC Career Club | Adamjee Cantonment College',
    description: 'Manage your ACC Career Club profile, update personal information, and track your career development journey.',
    url: 'https://acccc.vercel.app/profile',
    siteName: 'ACC Career Club',
    images: [
      {
        url: 'https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png',
        width: 1200,
        height: 630,
        alt: 'ACC Career Club - My Profile',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Profile - ACC Career Club',
    description: 'Manage your ACC Career Club profile and career development journey.',
    site: '@ACCCareerClub',
    creator: '@ACCCareerClub',
  },
  robots: {
    index: false, // Don't index user profile pages
    follow: false,
  },
  themeColor: '#3D444C',
};

const Page = () => {
  return <ProfileClient />;
};

export default Page;