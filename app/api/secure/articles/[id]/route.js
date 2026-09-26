// app/api/secure/articles/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Article from "../../../../models/Article";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import cloudinary from "../../../../lib/cloudinary";

export const runtime = "nodejs";

// ---------- Helpers (shared with create) ----------
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

// ============= GET: Fetch single article by id =============
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

    const article = await Article.findOne({ _id: id, isDeleted: false }).lean();
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

// ============= PUT: Update article =============
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

    const article = await Article.findOne({ _id: id, isDeleted: false });
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

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
    if (authorType) {
      if (authorType === "internal") {
        const lookupValue = (
          formData.get("authorLookup") || formData.get("authorId") || ""
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
        if (/^[a-f\d]{24}$/i.test(lookupValue)) query.$or.push({ _id: lookupValue });

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
    const thumbnailFile = formData.get("thumbnail");
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        article.thumbnail = await uploadToCloudinary(
          thumbnailFile,
          "articles/thumbnails",
        );
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

// ============= DELETE: Soft delete =============
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

    const { searchParams } = new URL(request.url);
    const hard = searchParams.get("hard") === "true";

    if (hard) {
      // Permanent delete
      const deleted = await Article.findByIdAndDelete(id);
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: "Article not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        success: true,
        message: "Article permanently deleted",
      });
    }

    // Soft delete (default)
    const article = await Article.findByIdAndUpdate(
      id,
      { isDeleted: true, status: "archived" },
      { new: true },
    );
    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted",
    });
  } catch (error) {
    console.error("❌ Delete article error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete article" },
      { status: 500 },
    );
  }
}