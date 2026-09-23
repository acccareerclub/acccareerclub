// app/api/secure/certificates/get-certificates/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function GET(request) {
  try {
    // ==========================================
    // AUTH
    // ==========================================
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

    // ==========================================
    // PARSE QUERY PARAMS
    // ==========================================
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10), 1),
      100,
    );
    const skip = Math.max(parseInt(searchParams.get("skip") || "0", 10), 0);
    const search = (searchParams.get("search") || "").trim();

    // ==========================================
    // BUILD QUERY
    // ==========================================
    const query = {};

    if (search) {
      // Escape regex special characters
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");

      query.$or = [
        { certificateId: rx },
        { title: rx },
        { description: rx },
        { achievementTitle: rx },
        { "recipient.fullName": rx },
        { "recipient.email": rx },
        { "recipient.studentId": rx },
        { "recipient.externalId": rx },
        { "recipient.externalOrganization": rx },
        { "event.eventName": rx },
      ];
    }

    // ==========================================
    // COUNT + FETCH
    // ==========================================
    const [total, certificates] = await Promise.all([
      Certificate.countDocuments(query),
      Certificate.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const hasMore = skip + certificates.length < total;

    return NextResponse.json({
      success: true,
      count: certificates.length,
      total,
      skip,
      limit,
      hasMore,
      search: search || null,
      certificates,
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch certificates" },
      { status: 500 },
    );
  }
}