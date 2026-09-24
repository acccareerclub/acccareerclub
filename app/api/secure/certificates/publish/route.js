// app/api/secure/certificates/publish/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";
import { getCurrentUser } from "../../../../lib/authUtils";

const ALLOWED_ROLES = [
  "prefect",
  "itsecretary",
  "modarator",
  "assistant_prefect",
];

export async function PATCH(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || !ALLOWED_ROLES.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { certificateIds, published } = body;

    if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "certificateIds array is required" },
        { status: 400 },
      );
    }
    if (typeof published !== "boolean") {
      return NextResponse.json(
        { success: false, message: "`published` must be a boolean" },
        { status: 400 },
      );
    }
    if (certificateIds.length > 500) {
      return NextResponse.json(
        { success: false, message: "Cannot update more than 500 at once" },
        { status: 400 },
      );
    }

    const result = await Certificate.updateMany(
      { _id: { $in: certificateIds } },
      { $set: { published } },
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} certificate${
        result.modifiedCount !== 1 ? "s" : ""
      } ${published ? "published" : "unpublished"}`,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      published,
    });
  } catch (error) {
    console.error("Publish certificates error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update publish state" },
      { status: 500 },
    );
  }
}