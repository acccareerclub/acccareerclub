// app/jobs/page.js
import JobsClient from "./JobsClient";

const SITE_URL = process.env.NEXTAUTH_URL || "https://ccacc.vercel.app";
const SITE_NAME = "ACC Career Club";
const PAGE_TITLE = "Latest Jobs in Bangladesh — Government, Private & NGO";
const PAGE_DESCRIPTION =
  "Browse the latest job circulars in Bangladesh — government, private, NGO and international opportunities. Filter by sector, category, division and employment type. Updated regularly by ACC Career Club.";
const OG_IMAGE =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "jobs in Bangladesh",
    "government jobs",
    "private jobs",
    "NGO jobs",
    "job circular 2026",
    "BD jobs",
    "ACC Career Club",
    "career opportunities",
    "walk-in interview",
    "job vacancies",
  ],
  alternates: {
    canonical: `${SITE_URL}/jobs`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/jobs`,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ---------- JSON-LD for the job listing page ----------
const buildJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}/jobs`,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: OG_IMAGE,
    },
  },
  about: {
    "@type": "Thing",
    name: "Job Listings in Bangladesh",
  },
});

export default function JobsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />
      <JobsClient />
    </>
  );
}