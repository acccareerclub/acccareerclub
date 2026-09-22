// app/sessions/[sessionId]/page.js
import React from "react";
import SingleSessionClient from "./SingleSessionClient";
import { connectToDatabase } from "@/app/lib/mongodb";
import Session from "@/app/models/Session";
import { format } from "date-fns";

const DEFAULT_BANNER =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg";
const SITE_URL = "https://ccacc.vercel.app";

export async function generateMetadata({ params }) {
  try {
    await connectToDatabase();

    // ✅ Await params first
    const { sessionId } = await params;

    const session = await Session.findOne({
      _id: sessionId,
      isActive: true,
    })
      .select(
        "sessionTitle sessionDescription sessionThumbnail sessionType sessionDate sessionDay meetingType location createdByName",
      )
      .lean();

    // Fallback metadata if session not found
    if (!session) {
      return {
        title: "Session Not Found",
        description: "...",
        robots: { index: false, follow: true },
      };
    }

    // Strip HTML from TinyMCE content and truncate for meta description
    const plainDescription =
      session.sessionDescription
        ?.replace(/<[^>]*>?/gm, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&mdash;/g, "—")
        .replace(/&rsquo;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim() || "";

    const metaDescription =
      plainDescription.length > 155
        ? plainDescription.substring(0, 152) + "..."
        : plainDescription ||
          `Join ACC Career Club for a ${session.sessionType} on ${format(
            new Date(session.sessionDate),
            "MMMM d, yyyy",
          )}.`;

    const bannerUrl = session.sessionThumbnail?.url || DEFAULT_BANNER;

    // Nice-looking full title
    const fullTitle = `${session.sessionTitle} | ACC Career Club`;
    const shortTitle = session.sessionTitle;

    return {
      title: shortTitle,
      description: metaDescription,
      keywords: [
        session.sessionTitle,
        session.sessionType,
        "ACC Career Club",
        "Adamjee Cantonment College",
        "Career Club Sessions",
        "Workshops",
        "Seminars",
        "Student Events",
        session.location || "ACC",
        session.createdByName || "ACC",
      ],
      authors: [{ name: "ACC Career Club" }],
      creator: "ACC Career Club",
      publisher: "ACC Career Club",
      metadataBase: new URL(SITE_URL),
      alternates: {
        canonical: `/sessions/${sessionId}`,
        languages: { "en-US": `/sessions/${sessionId}` },
      },
      openGraph: {
        title: fullTitle,
        description: metaDescription,
        url: `${SITE_URL}/sessions/${params.sessionId}`,
        siteName: "ACC Career Club",
        images: [
          {
            url: bannerUrl,
            width: 1200,
            height: 630,
            alt: session.sessionTitle,
          },
        ],
        locale: "en_US",
        type: "article",
        publishedTime: session.createdAt,
        authors: [session.createdByName || "ACC Career Club"],
      },
      twitter: {
        card: "summary_large_image",
        title: fullTitle,
        description: metaDescription,
        site: "@ACCCareerClub",
        creator: "@ACCCareerClub",
        images: [bannerUrl],
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
      other: {
        "theme-color": "#3D444C",
        "msapplication-TileColor": "#3D444C",
      },
      manifest: "/manifest.json",
    };
  } catch (error) {
    console.error("❌ Metadata generation error:", error);
    return {
      title: "Session | ACC Career Club",
      description:
        "Explore upcoming sessions, workshops, and seminars at ACC Career Club.",
    };
  }
}

const SingleSession = () => {
  return (
    <>
      <SingleSessionClient />
    </>
  );
};

export default SingleSession;
