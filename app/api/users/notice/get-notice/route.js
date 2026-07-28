// app/api/users/notice/get-notice/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, priority

    await connectToDatabase();

    // Build query
    let query = { isActive: true };
    
    if (category !== "all") {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "priority":
        sortOptions = { 
          priority: -1, // urgent, high, medium, low
          createdAt: -1 
        };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Get total count for pagination
    const total = await Notice.countDocuments(query);

    // Fetch notices
    const notices = await Notice.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'fullName email studentId role')
      .lean();

    // Get all categories for filter
    const categories = await Notice.distinct("category", { isActive: true });

    return NextResponse.json({
      success: true,
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      categories,
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