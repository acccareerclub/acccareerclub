// app/certificates/[userId]/[certificateId]/page.jsx
import SingleCertificate from "./SingleCertificate";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";

export async function generateMetadata({ params }) {
  const { userId, certificateId } = await params;

  const title = `Certificate ${certificateId}`;
  const description = `View and print certificate ${certificateId} — issued by ACC Career Club. Scan the QR on the certificate to verify its authenticity.`;

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
      canonical: `/certificates/${userId}/${certificateId}`,
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
    openGraph: {
      type: "article",
      title: `${title} | ACC Career Club`,
      description,
      url: `${SITE_URL}/certificates/${userId}/${certificateId}`,
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
  const { userId, certificateId } = await params;
  return (
    <SingleCertificate userId={userId} certificateId={certificateId} />
  );
}