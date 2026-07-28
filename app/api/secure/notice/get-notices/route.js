// app/api/secure/notice/get-notices/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function GET(request) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 100;
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";

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

    // Count total
    const total = await Notice.countDocuments(query);

    // Fetch notices with pagination
    const notices = await Notice.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'fullName email studentId role');

    // Get unique categories for filter
    const categories = await Notice.distinct("category");

    return NextResponse.json({
      success: true,
      notices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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