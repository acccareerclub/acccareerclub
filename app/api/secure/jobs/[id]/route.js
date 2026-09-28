// app/api/secure/jobs/[id]/route.js
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

const makeUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || "job";
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Job.exists(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter++}`;
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
};

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

const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
    return result.result === "ok" || result.result === "not found";
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset "${publicId}":`, err.message);
    return false;
  }
};

// ---------- Auth guard ----------
const requireAdmin = async (request) => {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return { error: "Not authenticated", status: 401 };
  const decoded = getCurrentUser(token);
  const allowedRoles = [
    "prefect",
    "itsecretary",
    "modarator",
    "assistant_prefect",
  ];
  if (!decoded || !allowedRoles.includes(decoded.role)) {
    return { error: "Unauthorized", status: 403 };
  }
  return { decoded };
};

// ============= GET: Fetch single job by id =============
export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const job = await Job.findById(id).lean();
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch job" },
      { status: 500 },
    );
  }
}

// ============= PUT: Update job =============
export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { id } = await params;
    await connectToDatabase();

    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    const formData = await request.formData();

    const jobTitle = (formData.get("jobTitle") || "").toString().trim();
    const sector = formData.get("sector")?.toString() || job.sector;
    const category = formData.get("category")?.toString() || job.category;
    const employmentType =
      formData.get("employmentType")?.toString() || job.employmentType;
    const location = formData.get("location")?.toString().trim() ?? job.location;
    const division = formData.get("division")?.toString() ?? job.division;
    const jobDescription = (formData.get("jobDescription") || "").toString();
    const applyLink = formData.get("applyLink")?.toString().trim() ?? job.applyLink;
    const deadlineRaw = (formData.get("applicationDeadline") || "").toString();
    const isActive = formData.get("isActive") === "true";
    const applicationMode =
      formData.get("applicationMode")?.toString() || job.applicationMode;

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

    // ---- Tags ----
    const tags = (formData.get("tags") || "")
      .toString()
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // ---- Existing images (kept) ----
    // The frontend sends "existingImageIds[]" with publicIds to KEEP.
    const keptIds = formData.getAll("existingImageIds[]").map((v) => v.toString());
    const existingImages = (job.images || []).filter((img) =>
      keptIds.includes(img.publicId),
    );

    // Delete removed images from Cloudinary
    const removedImages = (job.images || []).filter(
      (img) => !keptIds.includes(img.publicId),
    );
    if (removedImages.length > 0) {
      await Promise.allSettled(
        removedImages.map((img) => deleteCloudinaryAsset(img.publicId)),
      );
    }

    // ---- Upload new images ----
    const newImageFiles = formData.getAll("images").filter((f) => f?.size > 0);
    const newImages = [];
    for (const file of newImageFiles) {
      try {
        const result = await uploadToCloudinary(file, "jobs/images");
        if (result) {
          newImages.push({
            publicId: result.publicId,
            url: result.url,
            fileName: file.name || "",
            uploadedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }

    const finalImages = [...existingImages, ...newImages];

    // ---- Parse deadline ----
    let applicationDeadline = job.applicationDeadline;
    if (deadlineRaw === "" && job.applicationDeadline) {
      // explicit clear
      applicationDeadline = null;
    } else if (deadlineRaw) {
      const parsed = new Date(deadlineRaw);
      if (!isNaN(parsed.getTime())) applicationDeadline = parsed;
    }

    // ---- Slug (regenerate if title changed) ----
    if (jobTitle !== job.jobTitle) {
      job.slug = await makeUniqueSlug(slugify(jobTitle), job._id);
    }

    // ---- Apply updates ----
    job.jobTitle = jobTitle;
    job.sector = sector;
    job.category = category;
    job.employmentType = employmentType;
    job.location = location;
    job.division = division;
    job.jobDescription = jobDescription;
    job.applicationDeadline = applicationDeadline;
    job.applyLink = applyLink;
    job.images = finalImages;
    job.isActive = isActive;
    job.tags = tags;
    job.applicationMode = applicationMode;

    await job.save();

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: {
        _id: job._id,
        jobTitle: job.jobTitle,
        slug: job.slug,
        isActive: job.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Update job error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update job",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ============= DELETE: Permanent delete + Cloudinary cleanup =============
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return NextResponse.json(
        { success: false, message: auth.error },
        { status: auth.status },
      );
    }

    const { id } = await params;
    await connectToDatabase();

    // Load first so we have the image publicIds
    const job = await Job.findById(id).lean();
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    // Delete all job images from Cloudinary
    if (job.images?.length) {
      await Promise.allSettled(
        job.images.map((img) => deleteCloudinaryAsset(img.publicId)),
      );
    }

    // Delete the doc
    await Job.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Job deleted permanently",
    });
  } catch (error) {
    console.error("❌ Delete job error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete job" },
      { status: 500 },
    );
  }
}