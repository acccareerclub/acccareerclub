// app/api/users/notice/get-home-notices/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";

export async function GET() {
  try {
    await connectToDatabase();
    const notices = await Notice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title priority createdByRole createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      notices,
    });

  } catch (error) {
    console.error("❌ Get home notices error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notices",
      },
      { status: 500 }
    );
  }
}