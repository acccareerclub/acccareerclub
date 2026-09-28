// app/api/users/jobs/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";

export const revalidate = 60;

// ============= GET: Public list of active jobs =============
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    // ---------- Query params ----------
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const skip = (page - 1) * limit;

    const sector = searchParams.get("sector");
    const category = searchParams.get("category");
    const division = searchParams.get("division");
    const employmentType = searchParams.get("employmentType");
    const applicationMode = searchParams.get("applicationMode");
    const search = (searchParams.get("q") || "").trim();
    const sort = searchParams.get("sort") || "deadline"; // "deadline" | "recent"

    const now = new Date();

    // ---------- Build query ----------
    const query = {
      isActive: true,
      $or: [
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gte: now } },
      ],
    };

    if (sector && sector !== "all") query.sector = sector;
    if (category && category !== "all") query.category = category;
    if (division && division !== "all") query.division = division;
    if (employmentType && employmentType !== "all")
      query.employmentType = employmentType;
    if (applicationMode && applicationMode !== "all")
      query.applicationMode = applicationMode;

    if (search) {
      query.$and = [
        {
          $or: [
            { jobTitle: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        },
      ];
    }

    // ---------- Sort ----------
    // Default: nearest deadline first. No-deadline jobs pushed to the end.
    let sortPipeline;
    if (sort === "recent") {
      sortPipeline = { createdAt: -1 };
    } else {
      // Handled via aggregation below (need computed sortKey)
      sortPipeline = null;
    }

    let jobs, total;

    if (sortPipeline) {
      // Simple sort (recent)
      [jobs, total] = await Promise.all([
        Job.find(query)
          .select(
            "jobTitle slug sector category employmentType location division images applicationDeadline applicationMode applyLink tags isActive createdAt",
          )
          .sort(sortPipeline)
          .skip(skip)
          .limit(limit)
          .lean(),
        Job.countDocuments(query),
      ]);
    } else {
      // Aggregation for "nearest deadline"
      const aggResult = await Job.aggregate([
        { $match: query },
        {
          $addFields: {
            sortKey: {
              $ifNull: [
                "$applicationDeadline",
                new Date(8640000000000000), // max date → pushes no-deadline jobs last
              ],
            },
          },
        },
        { $sort: { sortKey: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            jobTitle: 1,
            slug: 1,
            sector: 1,
            category: 1,
            employmentType: 1,
            location: 1,
            division: 1,
            images: 1,
            applicationDeadline: 1,
            applicationMode: 1,
            applyLink: 1,
            tags: 1,
            isActive: 1,
            createdAt: 1,
          },
        },
      ]);

      jobs = aggResult;
      total = await Job.countDocuments(query);
    }

    // ---------- Distinct filter options for the sidebar ----------
    const [sectors, categories, divisions, employmentTypes] = await Promise.all(
      [
        Job.distinct("sector", { isActive: true }),
        Job.distinct("category", { isActive: true }),
        Job.distinct("division", { isActive: true }),
        Job.distinct("employmentType", { isActive: true }),
      ],
    );

    return NextResponse.json(
      {
        success: true,
        jobs,
        filters: {
          sectors: sectors.filter(Boolean).sort(),
          categories: categories.filter(Boolean).sort(),
          divisions: divisions.filter(Boolean).sort(),
          employmentTypes: employmentTypes.filter(Boolean).sort(),
        },
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
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("❌ Public list jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 },
    );
  }
}