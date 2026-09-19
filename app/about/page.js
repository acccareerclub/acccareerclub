// app/about/page.js
import React from "react";
import AboutUsClient from "./AboutUsClient";

export const metadata = {
  title: "About Us - ACC Career Club | Adamjee Cantonment College",
  description:
    "Learn about ACC Career Club at Adamjee Cantonment College. Discover our mission, vision, and how we empower students with career opportunities, networking, and professional development.",
  keywords: [
    "About ACC Career Club",
    "Adamjee Cantonment College",
    "Career Club Mission",
    "Student Career Portal",
    "ACC About",
    "Adamjee College Career",
    "Student Networking",
    "Career Development",
    "Job Opportunities ACC",
    "Professional Growth",
  ],
  openGraph: {
    title:
      "About Us - ACC Career Club | Adamjee Cantonment College",
    description:
      "Empowering Adamjee Cantonment College students with career opportunities, networking, and professional development resources.",
    url: "https://ccacc.vercel.app/about",
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club - About Adamjee Cantonment College",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - ACC Career Club",
    description:
      "Learn about ACC Career Club at Adamjee Cantonment College - our mission, vision, and impact.",
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
  return <AboutUsClient />;
};

export default Page;