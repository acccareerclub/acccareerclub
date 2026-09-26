// app/api/users/articles/list/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Article from "@/app/models/Article";

// Cache the response on the CDN for 60s, allow stale-while-revalidate
export const revalidate = 60;

// ============= GET: Public list of published articles =============
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // ---- Query params ----
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "50", 10)),
    );
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = (searchParams.get("q") || "").trim();
    const sort = searchParams.get("sort") || "recent";

    // ---- Build query ----
    const query = {
      status: "published",
      isDeleted: false,
    };

    if (category && category !== "all") query.category = category;
    if (tag) query.tags = tag;

    if (search) {
      // Use $text if the index is built, fallback to regex for flexibility
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "author.fullName": { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // ---- Sort ----
    let sortObj = { publishedAt: -1, createdAt: -1 };
    if (sort === "oldest") sortObj = { publishedAt: 1, createdAt: 1 };
    if (sort === "title") sortObj = { title: 1 };

    // ---- Fetch ----
    const [articles, total] = await Promise.all([
      Article.find(query)
        // Only the fields the list page actually needs
        .select(
          "title slug thumbnail category tags content author.fullName author.type author.profilePicture author.designation publishedAt createdAt",
        )
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(query),
    ]);

    // ---- Distinct categories for filter UI ----
    const categories = await Article.distinct("category", {
      status: "published",
      isDeleted: false,
    });

    return NextResponse.json(
      {
        success: true,
        articles,
        categories: categories.filter(Boolean).sort(),
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      {
        headers: {
          // Public, cacheable response
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("❌ Public list articles error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load articles" },
      { status: 500 },
    );
  }
}
