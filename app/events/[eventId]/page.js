// app/events/[eventId]/page.js
import SingleEvent from "./SingleEvent";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://ccacc.vercel.app";

export async function generateMetadata({ params }) {
  const { eventId } = await params;

  try {
    const res = await fetch(`${SITE_URL}/api/users/events/${eventId}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();

    if (data?.success) {
      const ev = data.event;
      const title = `${ev.eventTitle} | ACC Career Club`;
      const description =
        ev.eventDescription?.replace(/<[^>]*>/g, "").slice(0, 160) ||
        "Join us for this event hosted by ACC Career Club.";

      return {
        title,
        description,
        metadataBase: new URL(SITE_URL),
        alternates: { canonical: `/events/${eventId}` },
        openGraph: {
          type: "article",
          title,
          description,
          url: `${SITE_URL}/events/${eventId}`,
          siteName: "ACC Career Club",
          images: ev.eventThumbnail?.url
            ? [{ url: ev.eventThumbnail.url, width: 1200, height: 630 }]
            : [
                {
                  url: "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
                  width: 1200,
                  height: 630,
                },
              ],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: ev.eventThumbnail?.url
            ? [ev.eventThumbnail.url]
            : [
                "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
              ],
        },
      };
    }
  } catch {
    // fall through to defaults
  }

  return {
    title: "Event | ACC Career Club",
    description: "View event details at ACC Career Club.",
    metadataBase: new URL(SITE_URL),
  };
}

export default async function Page({ params }) {
  const { eventId } = await params;
  return <SingleEvent eventId={eventId} />;
}