// app/signup/page.js
import React from 'react';
import SignupClient from './SignupClient';

export const metadata = {
  title: 'ACC Career Club | Sign Up - Join Adamjee Cantonment College',
  description: 'Join the ACC Career Club at Adamjee Cantonment College. Create your account to access career resources, job opportunities, networking events, and professional development tools.',
  keywords: [
    'ACC Career Club',
    'Adamjee Cantonment College',
    'Career Club Sign Up',
    'Student Career Portal',
    'ACC Registration',
    'Adamjee College Career',
    'Student Networking',
    'Career Development',
    'Join ACC Career Club',
    'Professional Growth'
  ],
  openGraph: {
    title: 'ACC Career Club - Join the Community | Adamjee Cantonment College',
    description: 'Create your ACC Career Club account and unlock career opportunities, networking, and professional development resources.',
    url: 'https://ccacc.vercel.app/signup',
    siteName: 'ACC Career Club',
    images: [
      {
        url: 'https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png',
        width: 1200,
        height: 630,
        alt: 'ACC Career Club - Adamjee Cantonment College Sign Up',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACC Career Club - Join the Community',
    description: 'Sign up to access career resources and opportunities at Adamjee Cantonment College Career Club.',
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
  return <SignupClient />;
};

export default Page;