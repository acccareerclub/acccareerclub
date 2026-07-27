// app/login/page.js
import React from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "ACC Career Club | Sign In - Adamjee Cantonment College",
  description:
    "Sign in to your ACC Career Club account at Adamjee Cantonment College. Access career resources, job opportunities, networking events, and professional development tools.",
  keywords: [
    "ACC Career Club",
    "Adamjee Cantonment College",
    "Career Club Login",
    "Student Career Portal",
    "ACC Login",
    "Adamjee College Career",
    "Student Networking",
    "Career Development",
    "Job Opportunities ACC",
    "Professional Growth",
  ],
  openGraph: {
    title:
      "ACC Career Club - Student Career Portal | Adamjee Cantonment College",
    description:
      "Empowering Adamjee Cantonment College students with career opportunities, networking, and professional development resources.",
    url: "https://ccacc.vercel.app/login",
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club - Adamjee Cantonment College Login",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ACC Career Club - Student Career Portal",
    description:
      "Sign in to access career resources and opportunities at Adamjee Cantonment College Career Club.",
    site: "@ACCCareerClub",
    creator: "@ACCCareerClub",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Move themeColor to viewport export
export const viewport = {
  themeColor: "#3D444C",
};

const Page = () => {
  return <LoginClient />;
};

export default Page;