// app/verify-certificate/[certificateId]/page.jsx
import VerifyCertificate from "./VerifyCertificate";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";

export async function generateMetadata({ params }) {
  const { certificateId } = await params;

  const title = `Verify Certificate ${certificateId}`;
  const description = `Verify the authenticity of certificate ${certificateId} issued by ACC Career Club. Anyone with the certificate ID can confirm its authenticity.`;

  return {
    title: `${title} | ACC Career Club`,
    description,
    keywords: [
      "ACC Career Club",
      "certificate verification",
      certificateId,
      "verify certificate",
      "authenticity check",
    ],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/verify-certificate/${certificateId}`,
    },
    robots: {
      // Public verification — allow indexing so search engines can
      // surface the verification page when someone searches the ID.
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      title: `${title} | ACC Career Club`,
      description,
      url: `${SITE_URL}/verify-certificate/${certificateId}`,
      siteName: "ACC Career Club",
      images: [
        {
          url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
          width: 1200,
          height: 630,
          alt: "Certificate Verification",
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
  return <VerifyCertificate certificateId={certificateId} />;
}