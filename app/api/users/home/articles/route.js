// app/api/users/home/articles/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Article from "@/app/models/Article";

// Cache for 60s on the CDN
export const revalidate = 60;

// ============= GET: Latest 2 published articles for the homepage =============
export async function GET() {
  try {
    await connectToDatabase();

    // Prefer featured first, then most recent published
    let articles = await Article.find({
      status: "published",
      isFeatured: true,
    })
      .select(
        "title slug thumbnail category tags content author.fullName author.type author.profilePicture author.designation publishedAt createdAt",
      )
      .sort({ publishedAt: -1 })
      .limit(2)
      .lean();

    // Top up with the latest published articles if we don't have 2 featured ones
    if (articles.length < 2) {
      const excludeIds = articles.map((a) => a._id);
      const fallback = await Article.find({
        _id: { $nin: excludeIds },
        status: "published",
      })
        .select(
          "title slug thumbnail category tags content author.fullName author.type author.profilePicture author.designation publishedAt createdAt",
        )
        .sort({ publishedAt: -1 })
        .limit(2 - articles.length)
        .lean();
      articles = [...articles, ...fallback];
    }

    return NextResponse.json(
      { success: true, articles },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("❌ Home articles error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load articles" },
      { status: 500 },
    );
  }
}