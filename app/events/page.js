// app/events/page.js
import EventsClient from "./EventsClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";

export const metadata = {
  title: "Events | ACC Career Club",
  description:
    "Discover upcoming and past events hosted by ACC Career Club — workshops, seminars, competitions, talent hunts, and more at Adamjee Cantonment College.",
  keywords: [
    "ACC Career Club",
    "events",
    "workshops",
    "seminars",
    "competitions",
    "talent hunt",
    "Adamjee Cantonment College",
    "career events",
  ],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/events",
  },
  openGraph: {
    type: "website",
    title: "Events | ACC Career Club",
    description:
      "Discover upcoming and past events hosted by ACC Career Club.",
    url: `${SITE_URL}/events`,
    siteName: "ACC Career Club",
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
        width: 1200,
        height: 630,
        alt: "ACC Career Club Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | ACC Career Club",
    description:
      "Discover upcoming and past events hosted by ACC Career Club.",
    images: [
      "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
    ],
  },
};

export default function Page() {
  return <EventsClient />;
}