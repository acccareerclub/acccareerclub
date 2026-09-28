// app/api/secure/articles/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Article from "../../../../models/Article";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import cloudinary from "../../../../lib/cloudinary";

export const runtime = "nodejs";

// =====================================================================
// Helpers — shared with create route
// =====================================================================
const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug || "article";
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Article.exists(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter++}`;
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
};

const uploadToCloudinary = (file, folder = "articles") => {
  if (!file) return Promise.resolve("");
  return file.arrayBuffer().then(
    (ab) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 1600, height: 900, crop: "limit" },
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

// =====================================================================
// Helpers — Cloudinary cleanup
// =====================================================================

/**
 * Extract the Cloudinary public_id from a full secure URL.
 * Examples:
 *   .../upload/v1790448939/DefaultThumnailArticle_wh2voa.jpg
 *     → "DefaultThumnailArticle_wh2voa"
 *   .../upload/v1234567890/articles/thumbnails/abc123.jpg
 *     → "articles/thumbnails/abc123"
 */
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

/**
 * Extract every Cloudinary public_id referenced inside an HTML string.
 * Looks at src="..." and data-mce-src="..." attributes.
 */
const extractPublicIdsFromHtml = (html = "") => {
  const ids = new Set();
  if (!html) return ids;
  const srcRegex = /(?:src|data-mce-src)=["']([^"']+)["']/gi;
  let match;
  while ((match = srcRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes("res.cloudinary.com")) {
      const pid = extractPublicId(url);
      if (pid) ids.add(pid);
    }
  }
  return ids;
};

/**
 * Delete a single Cloudinary asset. Never throws — returns true/false.
 */
const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true, // also purge CDN cache
    });
    return result.result === "ok" || result.result === "not found";
  } catch (err) {
    console.warn(
      `Failed to delete Cloudinary asset "${publicId}":`,
      err.message,
    );
    return false;
  }
};

/**
 * Check whether a public_id is still referenced by another article.
 * Uses the filename fragment to be resilient to folder changes.
 */
const isStillReferenced = async (publicId, excludeArticleId) => {
  const urlFragment = publicId.split("/").pop();
  if (!urlFragment) return false;
  const count = await Article.countDocuments({
    _id: { $ne: excludeArticleId },
    $or: [
      { thumbnail: { $regex: urlFragment, $options: "i" } },
      { "author.profilePicture": { $regex: urlFragment, $options: "i" } },
      { content: { $regex: urlFragment, $options: "i" } },
    ],
  });
  return count > 0;
};

// =====================================================================
// Auth guard
// =====================================================================
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

// =====================================================================
// GET: Fetch single article by id
// =====================================================================
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

    const article = await Article.findOne({ _id: id }).lean();
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    console.error("Get article error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch article" },
      { status: 500 },
    );
  }
}

// =====================================================================
// PUT: Update article
// =====================================================================
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

    const article = await Article.findOne({ _id: id });
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

    // -------- Capture OLD assets BEFORE overwriting --------
    const oldThumbnailUrl = article.thumbnail;
    const oldAuthorPicture =
      article.author?.type === "external"
        ? article.author.profilePicture
        : null;
    const oldContentImageIds = extractPublicIdsFromHtml(article.content);

    const formData = await request.formData();

    const title = (formData.get("title") || "").toString().trim();
    const content = (formData.get("content") || "").toString();
    const category = formData.get("category")?.toString() || article.category;
    const status = formData.get("status")?.toString() || article.status;
    const authorType = formData.get("authorType")?.toString();

    // ---- Basic validation ----
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

    // ---- Author (optional — only overwrite if provided) ----
    let newAuthorPictureUrl = null;
    if (authorType) {
      if (authorType === "internal") {
        const lookupValue = (
          formData.get("authorLookup") ||
          formData.get("authorId") ||
          ""
        )
          .toString()
          .trim();

        if (!lookupValue) {
          return NextResponse.json(
            { success: false, message: "Author lookup value is required" },
            { status: 400 },
          );
        }

        const query = {
          $or: [
            { studentId: lookupValue.toUpperCase() },
            { membershipId: lookupValue },
            { email: lookupValue.toLowerCase() },
            { fullName: { $regex: `^${lookupValue}$`, $options: "i" } },
          ],
        };
        if (/^[a-f\d]{24}$/i.test(lookupValue))
          query.$or.push({ _id: lookupValue });

        const user = await User.findOne(query).lean();
        if (!user) {
          return NextResponse.json(
            { success: false, message: "Internal author not found" },
            { status: 404 },
          );
        }

        article.author = {
          type: "internal",
          _id: user._id,
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "",
          studentId: user.studentId || "",
          membershipId: user.membershipId || "",
          department: user.department || "",
          role: user.role || "",
          institution: "",
          designation: "",
          profilePicture: user.personalInfo?.profilePicture || "",
        };
      } else {
        const fullName = (formData.get("authorFullName") || "")
          .toString()
          .trim();
        if (!fullName) {
          return NextResponse.json(
            { success: false, message: "External author name is required" },
            { status: 400 },
          );
        }

        // Preserve existing picture unless a new one is uploaded
        let profilePicture = article.author?.profilePicture || "";
        const extPic = formData.get("authorProfilePicture");
        if (extPic && extPic.size > 0) {
          try {
            profilePicture = await uploadToCloudinary(
              extPic,
              "articles/authors",
            );
            newAuthorPictureUrl = profilePicture;
          } catch (err) {
            console.error("Author picture upload failed:", err);
          }
        }

        article.author = {
          type: "external",
          _id: null,
          fullName,
          email: (formData.get("authorEmail") || "").toString().trim(),
          phone: (formData.get("authorPhone") || "").toString().trim(),
          studentId: "",
          membershipId: "",
          department: "",
          role: "",
          institution: (formData.get("authorInstitution") || "")
            .toString()
            .trim(),
          designation: (formData.get("authorDesignation") || "")
            .toString()
            .trim(),
          profilePicture,
        };
      }
    }

    // ---- Thumbnail (only replace if new file uploaded) ----
    let newThumbnailUrl = null;
    const thumbnailFile = formData.get("thumbnail");
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        article.thumbnail = await uploadToCloudinary(
          thumbnailFile,
          "articles/thumbnails",
        );
        newThumbnailUrl = article.thumbnail;
      } catch (err) {
        console.error("Thumbnail upload failed:", err);
        return NextResponse.json(
          { success: false, message: "Thumbnail upload failed" },
          { status: 500 },
        );
      }
    }

    // ---- Slug (only regenerate if title changed) ----
    if (title !== article.title) {
      article.slug = await makeUniqueSlug(slugify(title), article._id);
    }

    // ---- Apply updates ----
    article.title = title;
    article.content = content;
    article.category = category;
    article.tags = tags;

    // Handle publishedAt transition
    if (status === "published" && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    article.status = ["draft", "published", "archived"].includes(status)
      ? status
      : article.status;

    await article.save();

    // =========================================================
    // Post-save cleanup — delete OLD Cloudinary assets that
    // were replaced during this update.
    // =========================================================
    const cleanupTargets = new Set();

    // 1. Old thumbnail replaced?
    if (
      newThumbnailUrl &&
      oldThumbnailUrl &&
      oldThumbnailUrl !== Article.DEFAULT_THUMBNAIL &&
      oldThumbnailUrl !== newThumbnailUrl
    ) {
      const pid = extractPublicId(oldThumbnailUrl);
      if (pid) cleanupTargets.add(pid);
    }

    // 2. Old external author picture replaced?
    if (
      newAuthorPictureUrl &&
      oldAuthorPicture &&
      oldAuthorPicture !== newAuthorPictureUrl
    ) {
      const pid = extractPublicId(oldAuthorPicture);
      if (pid) cleanupTargets.add(pid);
    }

    // 3. Old inline images that are no longer present in the new content
    const newContentImageIds = extractPublicIdsFromHtml(content);
    for (const oldPid of oldContentImageIds) {
      if (!newContentImageIds.has(oldPid)) {
        cleanupTargets.add(oldPid);
      }
    }

    // Perform cleanup — skip anything still referenced by another article
    if (cleanupTargets.size > 0) {
      await Promise.allSettled(
        [...cleanupTargets].map(async (pid) => {
          const stillUsed = await isStillReferenced(pid, article._id);
          if (stillUsed) return;
          await deleteCloudinaryAsset(pid);
        }),
      );
    }

    return NextResponse.json({
      success: true,
      message: "Article updated successfully",
      article: {
        _id: article._id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        thumbnail: article.thumbnail,
        publishedAt: article.publishedAt,
      },
    });
  } catch (error) {
    console.error("❌ Update article error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// =====================================================================
// DELETE: Permanent delete + Cloudinary cleanup
// =====================================================================
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

    // ---- 1. Load the article FIRST so we still have its URLs ----
    const article = await Article.findById(id).lean();
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

    // ---- 2. Collect all Cloudinary public_ids to delete ----
    const publicIds = new Set();

    // Thumbnail — skip if it's the shared default
    if (
      article.thumbnail &&
      article.thumbnail !== Article.DEFAULT_THUMBNAIL
    ) {
      const pid = extractPublicId(article.thumbnail);
      if (pid) publicIds.add(pid);
    }

    // External author's picture only — never touch internal (belongs to User)
    if (
      article.author?.type === "external" &&
      article.author?.profilePicture
    ) {
      const pid = extractPublicId(article.author.profilePicture);
      if (pid) publicIds.add(pid);
    }

    // Inline images inside the content HTML
    if (article.content) {
      extractPublicIdsFromHtml(article.content).forEach((pid) =>
        publicIds.add(pid),
      );
    }

    // ---- 3. Delete from Cloudinary (skip anything still referenced) ----
    let deletedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const results = await Promise.allSettled(
      [...publicIds].map(async (pid) => {
        const stillUsed = await isStillReferenced(pid, id);
        if (stillUsed) return "skipped";
        const ok = await deleteCloudinaryAsset(pid);
        return ok ? "deleted" : "failed";
      }),
    );

    for (const r of results) {
      if (r.status === "fulfilled") {
        if (r.value === "deleted") deletedCount++;
        else if (r.value === "skipped") skippedCount++;
        else failedCount++;
      } else {
        failedCount++;
      }
    }

    // ---- 4. Delete the article document ----
    const deleted = await Article.findByIdAndDelete(id);
    if (!deleted) {
      // Extremely rare — the doc vanished between step 1 and step 4
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted permanently",
      cloudinary: {
        attempted: publicIds.size,
        deleted: deletedCount,
        skipped: skippedCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("❌ Delete article error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete article" },
      { status: 500 },
    );
  }
}