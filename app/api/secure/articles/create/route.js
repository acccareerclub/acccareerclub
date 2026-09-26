// app/api/secure/articles/create/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Article from "../../../../models/Article";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import cloudinary from "../../../../lib/cloudinary";

// Force Node.js runtime (Cloudinary SDK needs it)
export const runtime = "nodejs";

// ============= Helpers =============

// Slugify a title: "Hello, World!" → "hello-world"
const slugify = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // drop punctuation
    .replace(/[\s_-]+/g, "-")   // spaces → dashes
    .replace(/^-+|-+$/g, "");   // trim leading/trailing dashes

// Ensure the slug is unique in the DB; append -1, -2, … if taken
const makeUniqueSlug = async (baseSlug) => {
  let slug = baseSlug || "article";
  let counter = 1;
  // Loop until we find a free slug (or give up after 50 tries)
  while (await Article.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
    if (counter > 50) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  return slug;
};

// Upload a File to Cloudinary and return the secure URL
const uploadToCloudinary = async (file, folder = "articles") => {
  if (!file) return "";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Wrap in a promise — Cloudinary SDK is callback-based
  return new Promise((resolve, reject) => {
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
    stream.end(buffer);
  });
};

// ============= POST: Create article =============
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
    const category = (formData.get("category") || "General").toString();
    const status = (formData.get("status") || "draft").toString();
    const authorType = (formData.get("authorType") || "internal").toString();

    // tags may arrive as comma-separated or as multiple entries
    const rawTags = formData.getAll("tags[]");
    const tagsFromList = rawTags.length
      ? rawTags.map((t) => t.toString().trim()).filter(Boolean)
      : (formData.get("tags") || "")
          .toString()
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

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

    // ---------- Build author snapshot ----------
    let author = null;

    if (authorType === "internal") {
      // Internal author: look up by studentId / membershipId / email / _id
      const lookupValue = (
        formData.get("authorLookup") || formData.get("authorId") || ""
      )
        .toString()
        .trim();

      if (!lookupValue) {
        return NextResponse.json(
          {
            success: false,
            message: "Author lookup value (student ID, membership ID, email) is required",
          },
          { status: 400 },
        );
      }

      // Build a flexible query
      const query = {
        $or: [
          { studentId: lookupValue.toUpperCase() },
          { membershipId: lookupValue },
          { email: lookupValue.toLowerCase() },
          { fullName: { $regex: `^${lookupValue}$`, $options: "i" } },
        ],
      };

      // If it looks like an ObjectId, try _id too
      if (/^[a-f\d]{24}$/i.test(lookupValue)) {
        query.$or.push({ _id: lookupValue });
      }

      const user = await User.findOne(query).lean();

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Internal author not found" },
          { status: 404 },
        );
      }

      author = {
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
      // External author: all fields come from the form
      const fullName = (formData.get("authorFullName") || "").toString().trim();
      if (!fullName) {
        return NextResponse.json(
          { success: false, message: "External author name is required" },
          { status: 400 },
        );
      }

      author = {
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
        profilePicture: "",
      };
    }

    // ---------- Thumbnail upload (optional) ----------
    const thumbnailFile = formData.get("thumbnail");
    let thumbnailUrl = "";
    if (thumbnailFile && thumbnailFile.size > 0) {
      try {
        thumbnailUrl = await uploadToCloudinary(
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

    // ---------- External author profile picture (optional) ----------
    if (author.type === "external") {
      const extPic = formData.get("authorProfilePicture");
      if (extPic && extPic.size > 0) {
        try {
          author.profilePicture = await uploadToCloudinary(
            extPic,
            "articles/authors",
          );
        } catch (err) {
          console.error("Author picture upload failed:", err);
          // non-fatal — continue
        }
      }
    }

    // ---------- Slug ----------
    const baseSlug = slugify(title);
    const slug = await makeUniqueSlug(baseSlug);

    // ---------- Create ----------
    const article = await Article.create({
      title,
      slug,
      content,
      category,
      tags: tagsFromList,
      thumbnail: thumbnailUrl || Article.DEFAULT_THUMBNAIL,
      author,
      status: ["draft", "published", "archived"].includes(status)
        ? status
        : "draft",
    });

    return NextResponse.json({
      success: true,
      message: "Article created successfully",
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
    console.error("❌ Create article error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create article",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}