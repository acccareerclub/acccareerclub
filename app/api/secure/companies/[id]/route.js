// app/api/secure/companies/[id]/route.js
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

const makeUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || "company";
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Company.exists(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter++}`;
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
};

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

// Extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const match = url.match(
      /\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?(?:\?.*)?$/,
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
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

// ============= GET: single company by id =============
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

    const company = await Company.findById(id).lean();
    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error("Get company error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch company" },
      { status: 500 },
    );
  }
}

// ============= PUT: update company =============
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

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 },
      );
    }

    // Capture old logo before overwrite
    const oldLogoUrl = company.companyLogo;

    const formData = await request.formData();

    const title = (formData.get("title") || "").toString().trim();
    const content = (formData.get("content") || "").toString();
    const status = formData.get("status")?.toString() || company.status;

    // ---- Validation ----
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

    // ---- Tags ----
    const rawTags = formData.getAll("tags[]");
    const tags = rawTags.length
      ? rawTags.map((t) => t.toString().trim()).filter(Boolean)
      : (formData.get("tags") || "")
          .toString()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    // ---- Logo (only replace if a new file is uploaded) ----
    let newLogoUrl = null;
    const logoFile = formData.get("companyLogo");
    if (logoFile && logoFile.size > 0) {
      try {
        newLogoUrl = await uploadToCloudinary(logoFile, "companies/logos");
        company.companyLogo = newLogoUrl;
      } catch (err) {
        console.error("Company logo upload failed:", err);
        return NextResponse.json(
          { success: false, message: "Logo upload failed" },
          { status: 500 },
        );
      }
    }

    // ---- Slug (regenerate if title changed) ----
    if (title !== company.title) {
      company.slug = await makeUniqueSlug(slugify(title), company._id);
    }

    // ---- Apply updates ----
    company.title = title;
    company.content = content;
    company.tags = tags;
    company.status = ["draft", "published", "archived"].includes(status)
      ? status
      : company.status;

    await company.save();

    // ---- Clean up OLD logo if it was replaced ----
    if (newLogoUrl && oldLogoUrl && oldLogoUrl !== newLogoUrl) {
      const oldPid = extractPublicId(oldLogoUrl);
      if (oldPid) await deleteCloudinaryAsset(oldPid);
    }

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
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
    console.error("❌ Update company error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update company",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ============= DELETE: permanent delete + logo cleanup =============
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

    // Load first so we have the logo URL
    const company = await Company.findById(id).lean();
    if (!company) {
      return NextResponse.json(
        { success: false, message: "Company not found" },
        { status: 404 },
      );
    }

    // Delete logo from Cloudinary
    if (company.companyLogo) {
      const pid = extractPublicId(company.companyLogo);
      if (pid) await deleteCloudinaryAsset(pid);
    }

    // Delete the doc
    await Company.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Company deleted permanently",
    });
  } catch (error) {
    console.error("❌ Delete company error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete company" },
      { status: 500 },
    );
  }
}