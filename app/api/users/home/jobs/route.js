// app/api/users/home/jobs/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";

export const revalidate = 60;

// ============= GET: Latest 2 active jobs for the homepage =============
export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    // Sort by nearest deadline first.
    // Jobs with NO deadline sort last (treated as +Infinity).
    // Jobs with a PAST deadline are excluded (nothing to apply to).
    const jobs = await Job.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { applicationDeadline: null },
            { applicationDeadline: { $exists: false } },
            { applicationDeadline: { $gte: now } },
          ],
        },
      },
      {
        $addFields: {
          // Sort key: deadline timestamp, or a very large number if no deadline
          sortKey: {
            $ifNull: ["$applicationDeadline", new Date(8640000000000000)],
          },
        },
      },
      { $sort: { sortKey: 1, createdAt: -1 } },
      { $limit: 2 },
      {
        $project: {
          jobTitle: 1,
          slug: 1,
          sector: 1,
          category: 1,
          employmentType: 1,
          location: 1,
          division: 1,
          images: 1,
          applicationDeadline: 1,
          applyLink: 1,
          tags: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
    ]);

    return NextResponse.json(
      { success: true, jobs },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("❌ Home jobs error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load jobs" },
      { status: 500 },
    );
  }
}