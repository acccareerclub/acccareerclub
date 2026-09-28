// app/api/secure/jobs/list/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";
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
    const sector = searchParams.get("sector");
    const category = searchParams.get("category");
    const division = searchParams.get("division");
    const employmentType = searchParams.get("employmentType");
    const activeOnly = searchParams.get("activeOnly") === "true";
    const search = (searchParams.get("q") || "").trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
    );
    const skip = (page - 1) * limit;

    // ---------- Build query ----------
    const query = {};
    if (sector && sector !== "all") query.sector = sector;
    if (category && category !== "all") query.category = category;
    if (division && division !== "all") query.division = division;
    if (employmentType && employmentType !== "all")
      query.employmentType = employmentType;
    if (activeOnly) query.isActive = true;

    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // ---------- Fetch ----------
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select(
          "jobTitle slug sector category employmentType location division images isActive applicationDeadline tags createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("List jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 },
    );
  }
}