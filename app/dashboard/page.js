// app/dashboard/page.js
import React from 'react';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: "ACC Career Club | Dashboard - Adamjee Cantonment College",
  description:
    "Access your ACC Career Club dashboard at Adamjee Cantonment College. Manage your profile, track career progress, explore opportunities, and connect with the community.",
  keywords: [
    "ACC Career Club",
    "Adamjee Cantonment College",
    "Student Dashboard",
    "Career Club Dashboard",
    "ACC Dashboard",
    "Adamjee College Career",
    "Student Portal",
    "Career Management",
    "Professional Development",
    "ACC Career Club Dashboard",
    "Student Success",
    "Career Tracking",
  ],
  openGraph: {
    title:
      "ACC Career Club - Student Dashboard | Adamjee Cantonment College",
    description:
      "Manage your career journey with ACC Career Club. Access resources, track progress, and connect with opportunities at Adamjee Cantonment College.",
    url: "https://ccacc.vercel.app/dashboard",
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club Dashboard - Adamjee Cantonment College",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ACC Career Club Dashboard - Student Career Portal",
    description:
      "Access your career dashboard, manage your profile, and explore opportunities at Adamjee Cantonment College Career Club.",
    site: "@ACCCareerClub",
    creator: "@ACCCareerClub",
  },
  robots: {
    index: false, // Dashboard pages should not be indexed
    follow: true,
  },
  themeColor: "#3D444C",
};

const Dashboard = () => {
  return <DashboardClient />;
};

export default Dashboard;