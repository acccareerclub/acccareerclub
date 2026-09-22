// app/api/users/notice/get-notice/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Parse URL Query Parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sortBy = searchParams.get("sortBy") || "newest";

    // 2. Build the Database Query (Filter)
    const query = { isActive: true };

    // Filter by Category if provided and not "all"
    if (category && category !== "all") {
      query.category = category;
    }

    // Search Filter (Case-insensitive Regex on Title and Content)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Build the Sort Object
    let sortOptions = {};
    if (sortBy === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === "priority") {
      // NOTE: MongoDB cannot easily sort by a custom enum order (e.g., urgent > high) 
      // using standard sort. The best approach is to sort by createdAt, 
      // but we will use a specialized aggregation pipeline below if needed.
      // For now, we will handle "priority" sorting using an Aggregation Pipeline.
      sortOptions = { createdAt: -1 }; // Default fallback
    } else {
      // Default: "newest"
      sortOptions = { createdAt: -1 };
    }

    // 4. Execute the Query
    let notices;
    let total;

    if (sortBy === "priority") {
      // Advanced Aggregation Pipeline for Priority Sorting
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            priorityWeight: {
              $switch: {
                branches: [
                  { case: { $eq: ["$priority", "urgent"] }, then: 4 },
                  { case: { $eq: ["$priority", "high"] }, then: 3 },
                  { case: { $eq: ["$priority", "medium"] }, then: 2 },
                  { case: { $eq: ["$priority", "low"] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        // Sort by priority weight (descending), then by date (descending)
        { $sort: { priorityWeight: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $project: {
            title: 1,
            content: 1,
            category: 1,
            priority: 1,
            images: 1,
            createdByName: 1,
            createdByRole: 1,
            createdAt: 1,
          },
        },
      ];

      // We need to run two queries: one for total count, one for the data
      const [dataResult, countResult] = await Promise.all([
        Notice.aggregate(pipeline),
        Notice.countDocuments(query),
      ]);

      notices = dataResult;
      total = countResult;
    } else {
      // Standard Query for "newest" and "oldest"
      const [dataResult, countResult] = await Promise.all([
        Notice.find(query)
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(limit)
          .select("title content category priority images createdByName createdByRole createdAt")
          .lean(), // .lean() improves performance since we don't need Mongoose document methods
        Notice.countDocuments(query),
      ]);

      notices = dataResult;
      total = countResult;
    }

    // 5. Calculate Pagination Metadata
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // 6. Return the Response
    return NextResponse.json({
      success: true,
      notices,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore,
      },
    });

  } catch (error) {
    console.error("❌ Get notices error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notices",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}