// app/articles/page.js
import ArticlesClient from "./ArticlesClient";

const SITE_URL = process.env.NEXTAUTH_URL || "https://ccacc.vercel.app";
const SITE_NAME = "ACC Career Club";
const PAGE_TITLE = "Articles — Insights, Stories & Career Tips";
const PAGE_DESCRIPTION =
  "Explore articles from ACC Career Club — career advice, event recaps, success stories, interview tips, and insights from Adamjee Cantonment College.";

// ---- SEO metadata ----
export const metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ACC Career Club",
    "Adamjee Cantonment College",
    "career articles",
    "student career tips",
    "interview preparation",
    "success stories",
    "career guidance Bangladesh",
  ],
  alternates: {
    canonical: `${SITE_URL}/articles`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/articles`,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784884999/cld-sample-5.jpg",
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
    images: [
      "https://res.cloudinary.com/ffuatrrt/image/upload/v1784884999/cld-sample-5.jpg",
    ],
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

// ---- Structured data for the listing page ----
const buildJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}/articles`,
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
      url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784884999/cld-sample-5.jpg",
    },
  },
});

export default function ArticlesPage() {
  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />
      <ArticlesClient />
    </>
  );
}