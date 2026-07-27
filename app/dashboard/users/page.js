// app/dashboard/users/page.js
import React from "react";
import UsersClient from "./UsersClient";

export const metadata = {
  title: "ACC Career Club | User Management - Adamjee Cantonment College",
  description:
    "Manage users, verify registrations, and oversee member accounts at ACC Career Club. Admins can view, edit, verify, and delete user accounts.",
  keywords: [
    "ACC Career Club",
    "User Management",
    "Admin Dashboard",
    "Verify Users",
    "Member Management",
    "ACC Admin",
    "Adamjee Cantonment College",
    "User Verification",
    "Student Management",
    "Career Club Admin",
  ],
  openGraph: {
    title: "User Management - ACC Career Club | Adamjee Cantonment College",
    description:
      "Manage and verify ACC Career Club members. View user profiles, verify registrations, and manage member accounts.",
    url: "https://ccacc.vercel.app/dashboard/users",
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club - User Management Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "User Management - ACC Career Club Dashboard",
    description:
      "Manage and verify ACC Career Club members efficiently.",
    site: "@ACCCareerClub",
    creator: "@ACCCareerClub",
  },
  robots: {
    index: false,
    follow: true,
  },
  themeColor: "#3D444C",
};

const page = () => {
  return <UsersClient />;
};

export default page;