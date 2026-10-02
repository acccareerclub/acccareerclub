// app/api/secure/companies/list/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Company from "@/app/models/Company";
import { getCurrentUser } from "@/app/lib/authUtils";

export async function GET(request) {
  try {
    // ---------- Auth ----------
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }
    const decoded = getCurrentUser(token);
    const allowedRoles = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // ---------- Query params ----------
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = (searchParams.get("q") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const skip = (page - 1) * limit;

    // ---------- Build query ----------
    const query = {};
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // ---------- Fetch ----------
    const [companies, total] = await Promise.all([
      Company.find(query)
        .select(
          "title slug companyLogo tags status publishedAt createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("List companies error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load companies" },
      { status: 500 },
    );
  }
}