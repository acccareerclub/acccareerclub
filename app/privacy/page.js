// app/privacy/page.js
import React from 'react';
import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy | ACC Career Club - Adamjee Cantonment College',
  description: 'Read the Privacy Policy for ACC Career Club at Adamjee Cantonment College. Learn how we collect, use, and protect your personal information.',
  keywords: [
    'ACC Career Club Privacy',
    'Adamjee Cantonment College Privacy',
    'Career Club Privacy Policy',
    'ACC Privacy',
    'Student Portal Privacy',
    'Data Protection ACC',
    'Career Club Privacy Terms',
    'ACC Data Policy'
  ],
  openGraph: {
    title: 'Privacy Policy | ACC Career Club',
    description: 'Learn how ACC Career Club at Adamjee Cantonment College protects your privacy and handles your personal information.',
    url: 'https://acccc.vercel.app/privacy',
    siteName: 'ACC Career Club',
    images: [
      {
        url: 'https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png',
        width: 1200,
        height: 630,
        alt: 'ACC Career Club - Privacy Policy',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | ACC Career Club',
    description: 'Learn how ACC Career Club protects your privacy and handles your personal information.',
    site: '@ACCCareerClub',
    creator: '@ACCCareerClub',
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: '#3D444C',
};

const Page = () => {
  return <PrivacyClient />;
};

export default Page;