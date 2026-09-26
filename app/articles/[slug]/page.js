// app/articles/[slug]/page.js
import { notFound } from "next/navigation";
import ArticleDetailClient from "./ArticleDetailClient";
import { getArticleBySlug, stripHtml } from "@/app/lib/articles/queries";

const SITE_URL = process.env.NEXTAUTH_URL || "https://ccacc.vercel.app";
const SITE_NAME = "ACC Career Club";
const DEFAULT_THUMB =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790448939/DefaultThumnailArticle_wh2voa.jpg";

// ---- Revalidate every 2 minutes ----
export const revalidate = 120;

// ---------- Dynamic SEO metadata ----------
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);

  if (!data?.article) {
    return {
      title: "Article not found",
      description: "The article you're looking for doesn't exist.",
      robots: { index: false, follow: false },
    };
  }

  const { article } = data;
  const plainText = stripHtml(article.content);
  const description = plainText.slice(0, 160);
  const publishedDate = article.publishedAt || article.createdAt;
  const thumbnail = article.thumbnail || DEFAULT_THUMB;

  return {
    title: article.title,
    description,
    keywords: [
      article.category,
      ...(article.tags || []),
      "ACC Career Club",
      "Adamjee Cantonment College",
      "career advice",
      "student articles",
    ].filter(Boolean),
    authors: [{ name: article.author?.fullName || SITE_NAME }],
    alternates: {
      canonical: `${SITE_URL}/articles/${article.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/articles/${article.slug}`,
      title: article.title,
      description,
      siteName: SITE_NAME,
      publishedTime: publishedDate,
      modifiedTime: article.updatedAt,
      authors: [article.author?.fullName || SITE_NAME],
      tags: article.tags || [],
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
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

// ---------- JSON-LD ----------
function buildArticleJsonLd(article) {
  const publishedDate = article.publishedAt || article.createdAt;
  const thumbnail = article.thumbnail || DEFAULT_THUMB;
  const plainText = stripHtml(article.content);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`,
    },
    headline: article.title,
    description: plainText.slice(0, 160),
    image: [thumbnail],
    datePublished: publishedDate,
    dateModified: article.updatedAt || publishedDate,
    author: {
      "@type": "Person",
      name: article.author?.fullName || SITE_NAME,
      ...(article.author?.profilePicture
        ? { image: article.author.profilePicture }
        : {}),
      ...(article.author?.designation
        ? { jobTitle: article.author.designation }
        : {}),
      ...(article.author?.institution
        ? {
            affiliation: {
              "@type": "Organization",
              name: article.author.institution,
            },
          }
        : {}),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: DEFAULT_THUMB },
    },
    articleSection: article.category,
    keywords: (article.tags || []).join(", "),
    wordCount: plainText.split(/\s+/).filter(Boolean).length,
  };
}

function buildBreadcrumbJsonLd(article) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${SITE_URL}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.category,
        item: `${SITE_URL}/articles?category=${encodeURIComponent(article.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: `${SITE_URL}/articles/${article.slug}`,
      },
    ],
  };
}

// ---------- Page ----------
export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);

  if (!data?.article) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleJsonLd(data.article)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(data.article)),
        }}
      />
      <ArticleDetailClient
        initialArticle={data.article}
        initialRelated={data.related || []}
        initialCategories={data.categories || []}
      />
    </>
  );
}