// app/jobs/[slug]/page.js
import { notFound } from "next/navigation";
import SingleJobClient from "./SingleJobClient";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";

const SITE_URL = process.env.NEXTAUTH_URL || "https://ccacc.vercel.app";
const SITE_NAME = "ACC Career Club";
const DEFAULT_OG =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png";

// ---------- Server-side data fetch ----------
async function fetchJob(slug) {
  try {
    await connectToDatabase();

    const job = await Job.findOne({
      slug: String(slug).toLowerCase(),
      isActive: true,
    }).lean();

    if (!job) return null;

    // Related jobs (simplified for metadata — full list fetched client-side)
    const now = new Date();
    const activeFilter = {
      isActive: true,
      _id: { $ne: job._id },
      $or: [
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gte: now } },
      ],
    };

    const related = await Job.find({
      ...activeFilter,
      category: job.category,
    })
      .select("jobTitle slug thumbnail images category sector")
      .sort({ applicationDeadline: 1, createdAt: -1 })
      .limit(6)
      .lean();

    // Compute daysRemaining
    let daysRemaining = null;
    if (job.applicationDeadline) {
      const diff = new Date(job.applicationDeadline).getTime() - Date.now();
      daysRemaining = diff < 0 ? 0 : Math.ceil(diff / 86400000);
    }

    // ✅ Serialize to plain JSON-safe objects before returning.
    //    ObjectId → string, Date → ISO string, drops __v & other internals.
    return {
      job: JSON.parse(JSON.stringify({ ...job, daysRemaining })),
      related: JSON.parse(JSON.stringify(related)),
    };
  } catch (err) {
    console.error("Server fetch job error:", err);
    return null;
  }
}

// Strip HTML for meta descriptions
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
  const data = await fetchJob(slug);

  if (!data?.job) {
    return {
      title: "Job not found",
      description: "The job you're looking for doesn't exist.",
      robots: { index: false, follow: false },
    };
  }

  const { job } = data;
  const plainText = stripHtml(job.jobDescription);
  const description = plainText.slice(0, 160);
  const thumbnail = job.images?.[0]?.url || DEFAULT_OG;

  const deadline = job.applicationDeadline
    ? new Date(job.applicationDeadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const titleSuffix = deadline
    ? ` — Apply ${job.applicationMode === "walk-in" ? "Walk-in" : "before"} ${deadline}`
    : "";

  return {
    title: `${job.jobTitle}${titleSuffix}`,
    description,
    keywords: [
      job.jobTitle,
      job.category,
      job.sector,
      job.location,
      job.division,
      ...(job.tags || []),
      "job circular",
      "jobs in Bangladesh",
      "BD jobs",
      "ACC Career Club",
    ].filter(Boolean),
    alternates: {
      canonical: `${SITE_URL}/jobs/${job.slug}`,
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/jobs/${job.slug}`,
      title: job.jobTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
          alt: job.jobTitle,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: job.jobTitle,
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

// ============= JSON-LD JobPosting schema (Google Jobs) =============
function buildJobPostingJsonLd(job) {
  const salary = null; // extend if you add salary later
  const employmentMap = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    internship: "INTERN",
    freelance: "CONTRACTOR",
    temporary: "TEMPORARY",
  };

  const base = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.jobTitle,
    description: stripHtml(job.jobDescription),
    datePosted: job.createdAt,
    validThrough: job.applicationDeadline,
    employmentType: employmentMap[job.employmentType] || "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: "ACC Career Club",
      sameAs: SITE_URL,
      logo: DEFAULT_OG,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location || "Dhaka",
        addressRegion: job.division || "Dhaka",
        addressCountry: "BD",
      },
    },
    industry: job.category,
  };

  if (job.applyLink) {
    base.directApply = true;
    base.url = job.applyLink;
  } else {
    base.url = `${SITE_URL}/jobs/${job.slug}`;
  }

  return base;
}

function buildBreadcrumbJsonLd(job) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jobs",
        item: `${SITE_URL}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.category,
        item: `${SITE_URL}/jobs?category=${encodeURIComponent(job.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: job.jobTitle,
        item: `${SITE_URL}/jobs/${job.slug}`,
      },
    ],
  };
}

// ============= Page =============
export default async function JobPage({ params }) {
  const { slug } = await params;
  const data = await fetchJob(slug);

  if (!data?.job) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJobPostingJsonLd(data.job)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(data.job)),
        }}
      />
      <SingleJobClient
        initialJob={JSON.parse(JSON.stringify(data.job))}
        initialRelated={JSON.parse(JSON.stringify(data.related))}
      />
    </>
  );
}
