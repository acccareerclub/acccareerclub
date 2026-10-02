// app/api/secure/jobs/create/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Job from "@/app/models/Job";
import User from "@/app/models/User";
import { getCurrentUser } from "@/app/lib/authUtils";
import cloudinary from "@/app/lib/cloudinary";
import { sendJobNotificationEmail } from "@/app/lib/mailsystem";

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
    const jobDescription = (formData.get("jobDescription") || "").toString();
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
    if (
      !jobDescription ||
      !jobDescription.trim() ||
      jobDescription === "<p></p>"
    ) {
      return NextResponse.json(
        { success: false, message: "Job description is required" },
        { status: 400 },
      );
    }
    if (
      !applyLink &&
      formData.getAll("images").filter((f) => f?.size > 0).length === 0
    ) {
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

    // ---------- Notify members (only if the job is live) ----------
    let emailReport = null;

    if (isActive) {
      try {
        // Only active members who kept jobMail enabled
        const recipients = await User.find({
          isActive: true,
          jobMail: true,
          // Only members (skip admins/staff so we don't spam them)
          role: { $nin: ["modarator"] },
        })
          .select("_id fullName email")
          .lean();

        if (recipients.length > 0) {
          const recipientEmails = recipients
            .map((u) => u.email)
            .filter(Boolean);
          const recipientIds = recipients.map((u) => u._id.toString());

          if (recipientEmails.length > 0) {
            emailReport = await sendJobNotificationEmail({
              jobTitle,
              jobCategory: category,
              jobSector: sector,
              employmentType,
              location,
              division,
              applicationDeadline,
              applicationMode,
              applyLink,
              jobSlug: slug,
              jobId: job._id.toString(),
              recipientEmails,
              recipientIds,
            });

            console.log(
              `📧 Job notification sent to ${emailReport.totalRecipients} members`,
            );
          }
        } else {
          console.log("ℹ️ No recipients with jobMail enabled");
        }
      } catch (mailErr) {
        // Don't fail the request if email sending fails — the job is already created
        console.error("❌ Job notification email failed:", mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Job created successfully",
      job: {
        _id: job._id,
        jobTitle: job.jobTitle,
        slug: job.slug,
        isActive: job.isActive,
      },
      emailsSent: emailReport?.totalRecipients || 0,
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
