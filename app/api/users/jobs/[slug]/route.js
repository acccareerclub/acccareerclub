// app/api/users/jobs/[slug]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";

export const revalidate = 120;

// ============= GET: single public job by slug =============
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const job = await Job.findOne({
      slug: String(slug).toLowerCase(),
      isActive: true,
    }).lean();

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    // ---------- Related jobs ----------
    // Priority 1: same category, excluding this job
    // Priority 2: same sector
    // Fallback: latest active jobs
    const now = new Date();
    const activeFilter = {
      isActive: true,
      _id: { $ne: job._id },
      $or: [
        { applicationDeadline: null },
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: { $gte: now } },
      ],
    };

    const [sameCategory, sameSector] = await Promise.all([
      Job.find({ ...activeFilter, category: job.category })
        .select(
          "jobTitle slug sector category employmentType location division images applicationDeadline applicationMode isActive",
        )
        .sort({ applicationDeadline: 1, createdAt: -1 })
        .limit(6)
        .lean(),
      Job.find({ ...activeFilter, sector: job.sector })
        .select(
          "jobTitle slug sector category employmentType location division images applicationDeadline applicationMode isActive",
        )
        .sort({ applicationDeadline: 1, createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // Dedupe & cap at 6
    const seen = new Set();
    const related = [];
    for (const r of [...sameCategory, ...sameSector]) {
      const key = r._id.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      related.push(r);
      if (related.length >= 6) break;
    }

    // Top up with latest active jobs if short
    if (related.length < 6) {
      const latest = await Job.find({
        ...activeFilter,
        _id: { $ne: job._id, $nin: related.map((r) => r._id) },
      })
        .select(
          "jobTitle slug sector category employmentType location division images applicationDeadline applicationMode isActive",
        )
        .sort({ applicationDeadline: 1, createdAt: -1 })
        .limit(6 - related.length)
        .lean();
      related.push(...latest);
    }

    // ---------- Compute days remaining ----------
    let daysRemaining = null;
    if (job.applicationDeadline) {
      const diff =
        new Date(job.applicationDeadline).getTime() - Date.now();
      daysRemaining = diff < 0 ? 0 : Math.ceil(diff / 86400000);
    }

    return NextResponse.json(
      {
        success: true,
        job: { ...job, daysRemaining },
        related,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("❌ Public get job error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load job" },
      { status: 500 },
    );
  }
}