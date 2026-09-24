// app/api/secure/certificates/user/[userId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import Certificate from "../../../../../models/Certificate";
import { getCurrentUser } from "../../../../../lib/authUtils";

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    // ==========================================
    // AUTH GUARD
    // ==========================================
    const isOwn = String(decoded.userId) === String(userId);
    const ADMIN_ROLES = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    const isAdmin = ADMIN_ROLES.includes(decoded.role);

    if (!isOwn && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // ==========================================
    // OPTIONAL: filter by certificateId
    // ==========================================
    const { searchParams } = new URL(request.url);
    const certificateIdFilter = searchParams.get("certificateId");

    const query = { "recipient.userId": userId, published: true };
    if (certificateIdFilter) {
      query.certificateId = certificateIdFilter;
    }

    const certificates = await Certificate.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Get user certificates error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch certificates" },
      { status: 500 },
    );
  }
}
