// app/companies/[slug]/page.js
import { notFound } from "next/navigation";
import SingleCompanyClient from "./SingleCompanyClient";
import { connectToDatabase } from "@/app/lib/mongodb";
import Company from "@/app/models/Company";

const SITE_URL = process.env.NEXTAUTH_URL || "https://ccacc.vercel.app";
const SITE_NAME = "ACC Career Club";
const DEFAULT_OG =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png";

// Serialize Mongoose docs to plain JSON-safe objects
const serialize = (obj) => JSON.parse(JSON.stringify(obj));

// ---------- Server-side data fetch ----------
async function fetchCompany(slug) {
  try {
    await connectToDatabase();

    const company = await Company.findOne({
      slug: String(slug).toLowerCase(),
      status: "published",
    }).lean();

    if (!company) return null;

    // Related companies (same logic as API — simplified)
    const tagList = (company.tags || []).filter(Boolean);

    const [sameTags, latest] = await Promise.all([
      tagList.length
        ? Company.find({
            _id: { $ne: company._id },
            status: "published",
            tags: { $in: tagList },
          })
            .select("title slug companyLogo tags content")
            .sort({ publishedAt: -1 })
            .limit(8)
            .lean()
        : Promise.resolve([]),
      Company.find({ _id: { $ne: company._id }, status: "published" })
        .select("title slug companyLogo tags content")
        .sort({ publishedAt: -1 })
        .limit(8)
        .lean(),
    ]);

    const seen = new Set();
    const related = [];
    for (const c of [...sameTags, ...latest]) {
      const key = c._id.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      related.push(c);
      if (related.length >= 8) break;
    }

    return serialize({ company, related });
  } catch (err) {
    console.error("Server fetch company error:", err);
    return null;
  }
}

// Strip HTML for descriptions / JSON-LD
const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

// ============= SEO metadata =============
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await fetchCompany(slug);

  if (!data?.company) {
    return {
      title: "Company not found",
      description: "The company profile you're looking for doesn't exist.",
      robots: { index: false, follow: false },
    };
  }

  const { company } = data;
  const plainText = stripHtml(company.content);
  const description = plainText.slice(0, 160);
  const thumbnail = company.companyLogo || DEFAULT_OG;

  return {
    title: `${company.title} — Company Profile`,
    description,
    keywords: [
      company.title,
      ...(company.tags || []),
      "company profile",
      "employer",
      "career insights",
      "ACC Career Club",
      "jobs in Bangladesh",
      "hiring company",
    ].filter(Boolean),
    alternates: {
      canonical: `${SITE_URL}/companies/${company.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/companies/${company.slug}`,
      title: company.title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: company.title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: company.title,
      description,
      images: [thumbnail],
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
}

// ============= JSON-LD =============
function buildOrganizationJsonLd(company) {
  const plainText = stripHtml(company.content);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.title,
    url: `${SITE_URL}/companies/${company.slug}`,
    description: plainText.slice(0, 300),
    ...(company.companyLogo ? { logo: company.companyLogo } : {}),
    ...(company.tags?.length ? { keywords: company.tags.join(", ") } : {}),
    ...(company.publishedAt ? { foundingDate: company.publishedAt } : {}),
  };
}

function buildBreadcrumbJsonLd(company) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Companies",
        item: `${SITE_URL}/companies`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: company.title,
        item: `${SITE_URL}/companies/${company.slug}`,
      },
    ],
  };
}

// ============= Page =============
export default async function CompanyPage({ params }) {
  const { slug } = await params;
  const data = await fetchCompany(slug);

  if (!data?.company) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationJsonLd(data.company)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(data.company)),
        }}
      />
      <SingleCompanyClient
        initialCompany={data.company}
        initialRelated={data.related}
      />
    </>
  );
}