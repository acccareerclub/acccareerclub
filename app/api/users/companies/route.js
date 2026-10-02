// app/api/users/companies/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Company from "@/app/models/Company";

export const revalidate = 120;

// ============= GET: Public list of published companies =============
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // ---------- Query params ----------
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      60,
      Math.max(1, parseInt(searchParams.get("limit") || "40", 10)),
    );
    const skip = (page - 1) * limit;

    const search = (searchParams.get("q") || "").trim();
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "recent";

    // ---------- Build query ----------
    const query = { status: "published" };
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // ---------- Sort ----------
    let sortObj = { publishedAt: -1, createdAt: -1 };
    if (sort === "oldest") sortObj = { publishedAt: 1, createdAt: 1 };
    if (sort === "title") sortObj = { title: 1 };

    // ---------- Fetch ----------
    const [companies, total] = await Promise.all([
      Company.find(query)
                .select("title slug companyLogo tags content publishedAt createdAt")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    // ---------- Distinct tags for filter UI ----------
    const allTags = await Company.distinct("tags", { status: "published" });

    return NextResponse.json(
      {
        success: true,
        companies,
        tags: allTags.filter(Boolean).sort(),
        pagination: {
          page,
          limit,
          total,
          pages: Math.max(1, Math.ceil(total / limit)),
          hasMore: page * limit < total,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("❌ Public list companies error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load companies" },
      { status: 500 },
    );
  }
}