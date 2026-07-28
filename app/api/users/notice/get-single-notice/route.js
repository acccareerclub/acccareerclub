// app/api/users/notice/get-single-notice/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const noticeId = searchParams.get("noticeId");

    if (!noticeId) {
      return NextResponse.json(
        { success: false, message: "Notice ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const notice = await Notice.findById(noticeId)
      .populate('createdBy', 'fullName email studentId role personalInfo.profilePicture')
      .lean();

    if (!notice) {
      return NextResponse.json(
        { success: false, message: "Notice not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await Notice.findByIdAndUpdate(noticeId, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      notice,
    });

  } catch (error) {
    console.error("❌ Get single notice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notice",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}