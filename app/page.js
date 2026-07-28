// app/page.js
import React from "react";
import FacebookEmbaded from "./components/home/FacebookEmbaded";
import HomeNotice from "./components/home/HomeNotice";
import CarosolSectors from "./components/home/CarosolSectors";

export const metadata = {
  title: {
    default: "ACC Career Club",
    template: "%s | ACC Career Club",
  },
  description:
    "ACC Career Club at Adamjee Cantonment College empowers students with career guidance, professional development, and networking opportunities. Join us to build your future today!",
  keywords: [
    "ACC Career Club",
    "Adamjee Cantonment College",
    "Career Club",
    "Student Development",
    "Career Guidance",
    "Professional Development",
    "Networking",
    "Student Leadership",
    "ACC",
    "Career Opportunities",
    "Youth Empowerment",
    "College Career Club",
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
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    title:
      "ACC Career Club - Empowering Future Leaders at Adamjee Cantonment College",
    description:
      "Join ACC Career Club at Adamjee Cantonment College for career guidance, professional development, and networking opportunities. Start building your future today!",
    url: "https://ccacc.vercel.app",
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club - Empowering Future Leaders",
      },
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 600,
        height: 315,
        alt: "ACC Career Club - Building Careers, Shaping Futures",
      },
    ],
    locale: "en_US",
    type: "website",
    emails: ["info@acccareerclub.com"],
    phoneNumbers: ["+880123456789"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ACC Career Club - Empowering Future Leaders",
    description:
      "Join ACC Career Club at Adamjee Cantonment College for career guidance, professional development, and networking opportunities.",
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
    title: "ACC Career Club",
    statusBarStyle: "black-translucent",
  },
  applicationName: "ACC Career Club",
  category: "Education",
  classification: "Career Development, Student Organization",
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

const Home = () => {
  return (
    <>
      <div className="mt-5">
        <HomeNotice />
      </div>
      <div className="w-full mt-7">
        <CarosolSectors />
      </div>
      <FacebookEmbaded />
    </>
  );
};

export default Home;
