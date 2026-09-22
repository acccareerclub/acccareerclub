// app/sessions/page.jsx

import React from "react";
import UserClientSessions from "./UserClientSessions";

export const metadata = {
  title: "Sessions",
  description:
    "Explore upcoming workshops, seminars, webinars, and training sessions hosted by ACC Career Club at Adamjee Cantonment College. Register, learn, and grow with us!",
  keywords: [
    "ACC Career Club Sessions",
    "Adamjee Cantonment College Sessions",
    "Workshops",
    "Seminars",
    "Webinars",
    "Career Development Sessions",
    "Student Training",
    "Skill Development",
    "ACC Events",
    "Professional Growth",
    "Career Club Workshops",
    "Youth Training Programs",
    "ACC",
    "Career Guidance Sessions",
  ],
  authors: [{ name: "ACC Career Club" }],
  creator: "ACC Career Club",
  publisher: "ACC Career Club",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ccacc.vercel.app"),
  alternates: {
    canonical: "/sessions",
    languages: {
      "en-US": "/sessions",
    },
  },
  openGraph: {
    title: "Sessions | ACC Career Club - Workshops, Seminars & Trainings",
    description:
      "Join ACC Career Club's hands-on sessions designed to sharpen your skills. From workshops to webinars, discover events that shape your career at Adamjee Cantonment College.",
    url: "https://ccacc.vercel.app/sessions",
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club Sessions - Empowering Future Leaders",
      },
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 600,
        height: 315,
        alt: "ACC Career Club - Workshops and Seminars",
      },
    ],
    locale: "en_US",
    type: "website",
    emails: ["info@acccareerclub.com"],
    phoneNumbers: ["+880123456789"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sessions | ACC Career Club",
    description:
      "Discover workshops, seminars, and webinars hosted by ACC Career Club. Level up your skills and build your career with us.",
    site: "@ACCCareerClub",
    creator: "@ACCCareerClub",
    images: [
      "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  appleWebApp: {
    capable: true,
    title: "Sessions | ACC Career Club",
    statusBarStyle: "black-translucent",
  },
  applicationName: "ACC Career Club",
  category: "Education",
  classification: "Career Development, Student Organization, Events",
  other: {
    "theme-color": "#3D444C",
    "msapplication-TileColor": "#3D444C",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#3D444C",
      },
    ],
  },
  manifest: "/manifest.json",
};

const UserSessions = () => {
  return (
    <>
      <UserClientSessions />
    </>
  );
};

export default UserSessions;