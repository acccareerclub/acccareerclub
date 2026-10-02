// app/companies/page.js
import CompaniesClient from "./CompaniesClient";

const SITE_URL = process.env.NEXTAUTH_URL || "https://ccacc.vercel.app";
const SITE_NAME = "ACC Career Club";
const PAGE_TITLE = "Companies — Career Insights & Company Profiles";
const PAGE_DESCRIPTION =
  "Explore detailed company profiles curated by ACC Career Club — learn about top employers, their culture, hiring process, and career opportunities in Bangladesh.";
const OG_IMAGE =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png";

export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "companies in Bangladesh",
    "company profiles",
    "top employers",
    "career insights",
    "employer research",
    "ACC Career Club",
    "Adamjee Cantonment College",
    "hiring companies",
    "company culture",
    "job opportunities",
  ],
  alternates: {
    canonical: `${SITE_URL}/companies`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/companies`,
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

// ---------- JSON-LD ----------
const buildJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}/companies`,
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
    name: "Companies in Bangladesh",
  },
});

export default function CompaniesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />
      <CompaniesClient />
    </>
  );
}