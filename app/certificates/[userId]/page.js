// app/certificates/[userId]/page.jsx
import MyCertificates from "./MyCertificates";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";

export async function generateMetadata({ params }) {
  const { userId } = await params;

  return {
    title: "My Certificates | ACC Career Club",
    description:
      "View, preview, and print all certificates earned with ACC Career Club — participation, achievements, and recognition.",
    keywords: [
      "ACC Career Club",
      "certificates",
      "my certificates",
      "achievement",
      "participation certificate",
      "Adamjee Cantonment College",
    ],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/certificates/${userId}`,
    },
    robots: {
      index: false, // personal page — keep out of search engines
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
    openGraph: {
      type: "website",
      title: "My Certificates | ACC Career Club",
      description:
        "A personal gallery of certificates earned with ACC Career Club.",
      url: `${SITE_URL}/certificates/${userId}`,
      siteName: "ACC Career Club",
      images: [
        {
          url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
          width: 1200,
          height: 630,
          alt: "ACC Career Club Certificates",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "My Certificates | ACC Career Club",
      description: "A personal gallery of certificates earned with us.",
      images: [
        "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
      ],
    },
  };
}

export default async function Page({ params }) {
  const { userId } = await params;
  return <MyCertificates userId={userId} />;
}