// app/certificates/certificateId/page.jsx
import OpenCertificate from "./OpenCertificate";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";

export async function generateMetadata({ params }) {
  const { certificateId } = await params;

  const title = `Certificate ${certificateId}`;
  const description = `Verify and print certificate ${certificateId} — issued by ACC Career Club. Scan the QR on the certificate to confirm its authenticity.`;

  return {
    title: `${title} | ACC Career Club`,
    description,
    keywords: [
      "ACC Career Club",
      "certificate",
      certificateId,
      "certificate verification",
      "print certificate",
      "achievement",
    ],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/certificates/${certificateId}`,
    },
    robots: {
      // Public sharing page — allow indexing
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      title: `${title} | ACC Career Club`,
      description,
      url: `${SITE_URL}/certificates/${certificateId}`,
      siteName: "ACC Career Club",
      images: [
        {
          url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
          width: 1200,
          height: 630,
          alt: `Certificate ${certificateId}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ACC Career Club`,
      description,
      images: [
        "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
      ],
    },
  };
}

export default async function Page({ params }) {
  const { certificateId } = await params;
  return <OpenCertificate certificateId={certificateId} />;
}