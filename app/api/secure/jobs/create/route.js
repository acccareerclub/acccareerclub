// app/api/secure/jobs/create/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";
import { getCurrentUser } from "@/app/lib/authUtils";
import cloudinary from "@/app/lib/cloudinary";

export const runtime = "nodejs";

// ---------- Helpers ----------
const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeUniqueSlug = async (baseSlug) => {
  let slug = baseSlug || "job";
  let counter = 1;
  while (await Job.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
};

// Upload a single File to Cloudinary, returns { publicId, url }
const uploadToCloudinary = (file, folder = "jobs") => {
  if (!file) return Promise.resolve(null);
  return file.arrayBuffer().then(
    (ab) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 1600, height: 1600, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
            });
          },
        );
        stream.end(Buffer.from(ab));
      }),
  );
};

// ============= POST: Create job =============
export async function POST(request) {
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

    // ---------- Parse multipart form ----------
    const formData = await request.formData();

    const jobTitle = (formData.get("jobTitle") || "").toString().trim();
    const sector = (formData.get("sector") || "private").toString();
    const category = (formData.get("category") || "Other").toString();
    const employmentType = (
      formData.get("employmentType") || "full-time"
    ).toString();
    const location = (formData.get("location") || "").toString().trim();
    const division = (formData.get("division") || "").toString().trim();
    const jobDescription = (
      formData.get("jobDescription") || ""
    ).toString();
    const applyLink = (formData.get("applyLink") || "").toString().trim();
    const deadlineRaw = (formData.get("applicationDeadline") || "").toString();
    const isActive = formData.get("isActive") === "true";

    const applicationMode = (
      formData.get("applicationMode") || "apply-before"
    ).toString();

    // Tags — comma-separated
    const tags = (formData.get("tags") || "")
      .toString()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // ---- Validation ----
    if (!jobTitle) {
      return NextResponse.json(
        { success: false, message: "Job title is required" },
        { status: 400 },
      );
    }
    if (!jobDescription || !jobDescription.trim() || jobDescription === "<p></p>") {
      return NextResponse.json(
        { success: false, message: "Job description is required" },
        { status: 400 },
      );
    }
    if (!applyLink && formData.getAll("images").filter((f) => f?.size > 0).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide at least one apply link or an image",
        },
        { status: 400 },
      );
    }

    // ---- Upload images ----
    const imageFiles = formData.getAll("images").filter((f) => f?.size > 0);
    const uploadedImages = [];

    for (const file of imageFiles) {
      try {
        const result = await uploadToCloudinary(file, "jobs/images");
        if (result) {
          uploadedImages.push({
            publicId: result.publicId,
            url: result.url,
            fileName: file.name || "",
            uploadedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        // Continue with the rest — don't abort the whole create
      }
    }

    // ---- Parse deadline ----
    let applicationDeadline = null;
    if (deadlineRaw) {
      const parsed = new Date(deadlineRaw);
      if (!isNaN(parsed.getTime())) applicationDeadline = parsed;
    }

    // ---- Slug ----
    const baseSlug = slugify(jobTitle);
    const slug = await makeUniqueSlug(baseSlug);

    // ---- Create ----
    const job = await Job.create({
      jobTitle,
      slug,
      sector,
      category,
      employmentType,
      location,
      division,
      jobDescription,
      applicationDeadline,
      applyLink,
      images: uploadedImages,
      isActive,
      tags,
      applicationMode,
      postedBy: {
        _id: decoded.userId || decoded.id || null,
        fullName: decoded.fullName || "",
        role: decoded.role || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job created successfully",
      job: {
        _id: job._id,
        jobTitle: job.jobTitle,
        slug: job.slug,
        isActive: job.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Create job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create job",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}