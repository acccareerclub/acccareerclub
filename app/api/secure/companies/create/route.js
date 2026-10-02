// app/api/secure/companies/create/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Company from "@/app/models/Company";
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
  let slug = baseSlug || "company";
  let counter = 1;
  while (await Company.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
};

// Upload a single File to Cloudinary, returns secure URL
const uploadToCloudinary = (file, folder = "companies") => {
  if (!file) return Promise.resolve("");
  return file.arrayBuffer().then(
    (ab) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          },
        );
        stream.end(Buffer.from(ab));
      }),
  );
};

// ============= POST: Create company =============
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

    const title = (formData.get("title") || "").toString().trim();
    const content = (formData.get("content") || "").toString();
    const status = (formData.get("status") || "draft").toString();

    // Tags — comma-separated or array
    const rawTags = formData.getAll("tags[]");
    const tagsFromList = rawTags.length
      ? rawTags.map((t) => t.toString().trim()).filter(Boolean)
      : (formData.get("tags") || "")
          .toString()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    // ---------- Validation ----------
    if (!title) {
      return NextResponse.json(
        { success: false, message: "Title is required" },
        { status: 400 },
      );
    }
    if (!content || !content.trim() || content === "<p></p>") {
      return NextResponse.json(
        { success: false, message: "Content is required" },
        { status: 400 },
      );
    }

    // ---------- Company logo (optional) ----------
    let companyLogo = "";
    const logoFile = formData.get("companyLogo");
    if (logoFile && logoFile.size > 0) {
      try {
        companyLogo = await uploadToCloudinary(logoFile, "companies/logos");
      } catch (err) {
        console.error("Company logo upload failed:", err);
        return NextResponse.json(
          { success: false, message: "Logo upload failed" },
          { status: 500 },
        );
      }
    }

    // ---------- Slug ----------
    const baseSlug = slugify(title);
    const slug = await makeUniqueSlug(baseSlug);

    // ---------- Create ----------
    const company = await Company.create({
      title,
      slug,
      content,
      companyLogo,
      tags: tagsFromList,
      status: ["draft", "published", "archived"].includes(status)
        ? status
        : "draft",
    });

    return NextResponse.json({
      success: true,
      message: "Company created successfully",
      company: {
        _id: company._id,
        title: company.title,
        slug: company.slug,
        status: company.status,
        companyLogo: company.companyLogo,
        publishedAt: company.publishedAt,
      },
    });
  } catch (error) {
    console.error("❌ Create company error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create company",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}