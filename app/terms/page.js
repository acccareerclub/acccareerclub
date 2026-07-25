// app/terms/page.js
import React from 'react';
import TermsClient from './TermsClient';

export const metadata = {
  title: 'Terms of Service | ACC Career Club - Adamjee Cantonment College',
  description: 'Read the Terms of Service for ACC Career Club at Adamjee Cantonment College. Understand the rules, guidelines, and legal agreements for using our platform.',
  keywords: [
    'ACC Career Club Terms',
    'Adamjee Cantonment College Terms',
    'Career Club Terms of Service',
    'ACC Terms',
    'Student Portal Terms',
    'Legal Agreement ACC',
    'Career Club Rules',
    'ACC Guidelines'
  ],
  openGraph: {
    title: 'Terms of Service | ACC Career Club',
    description: 'Review the Terms of Service for using the ACC Career Club platform at Adamjee Cantonment College.',
    url: 'https://acccc.vercel.app/terms',
    siteName: 'ACC Career Club',
    images: [
      {
        url: 'https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png',
        width: 1200,
        height: 630,
        alt: 'ACC Career Club - Terms of Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | ACC Career Club',
    description: 'Review the Terms of Service for using the ACC Career Club platform.',
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
  return <TermsClient />;
};

export default Page;