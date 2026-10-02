// app/api/users/companies/[slug]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Company from "@/app/models/Company";

export const revalidate = 120;

// ============= GET: single published company by slug =============
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const company = await Company.findOne({
      slug: String(slug).toLowerCase(),
      status: "published",
    }).lean();

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 },
      );
    }

    // ---------- Related companies ----------
    // Priority 1: same tags
    // Priority 2: latest published (fallback)
    const tagList = (company.tags || []).filter(Boolean);

    const [sameTags, latest] = await Promise.all([
      tagList.length
        ? Company.find({
            _id: { $ne: company._id },
            status: "published",
            tags: { $in: tagList },
          })
            .select("title slug companyLogo tags content")
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(8)
            .lean()
        : Promise.resolve([]),
      Company.find({
        _id: { $ne: company._id },
        status: "published",
      })
        .select("title slug companyLogo tags content")
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

    // Merge, dedupe, cap at 8
    const seen = new Set();
    const related = [];
    for (const c of [...sameTags, ...latest]) {
      const key = c._id.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      related.push(c);
      if (related.length >= 8) break;
    }

    // ---------- Distinct tags for filter footer (optional) ----------
    const allTags = await Company.distinct("tags", { status: "published" });

    return NextResponse.json(
      {
        success: true,
        company,
        related,
        tags: allTags.filter(Boolean).sort(),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("❌ Public get company error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load company" },
      { status: 500 },
    );
  }
}