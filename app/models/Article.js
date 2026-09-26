// models/Article.js
import mongoose from "mongoose";

// Default thumbnail used when the author doesn't upload one
const DEFAULT_THUMBNAIL =
  "https://res.cloudinary.com/ffuatrrt/image/upload/v1790448939/DefaultThumnailArticle_wh2voa.jpg";

const ArticleSchema = new mongoose.Schema(
  {
    // ---------- Core content ----------
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Main body of the article (HTML or Markdown string)
    content: {
      type: String,
      required: [true, "Content is required"],
    },

    // ---------- Thumbnail ----------
    thumbnail: {
      type: String,
      default: DEFAULT_THUMBNAIL,
      trim: true,
    },

    // ---------- Categorization ----------
    category: {
      type: String,
      trim: true,
      default: "General",
    },

    tags: {
      type: [String],
      default: [],
    },

    // ---------- Author snapshot ----------
    author: {
      // "internal" = registered member, "external" = guest / non-member
      type: {
        type: String,
        enum: ["internal", "external"],
        default: "internal",
      },

      // Only set for internal authors. Optional so externals don't need it.
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        index: true,
      },

      // Always required — even externals need a name on the article
      fullName: { type: String, required: true, trim: true },

      email: { type: String, trim: true, lowercase: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      studentId: { type: String, trim: true, default: "" },
      membershipId: { type: String, trim: true, default: "" },
      department: { type: String, trim: true, default: "" },
      role: { type: String, trim: true, default: "" },

      // Optional external-only fields
      institution: { type: String, trim: true, default: "" },
      designation: { type: String, trim: true, default: "" },

      profilePicture: { type: String, default: "" },
    },

    // ---------- Publishing ----------
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },

    // ---------- Soft delete ----------
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ---------- Indexes ----------
// Text search across title, excerpt, content, tags
ArticleSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  tags: "text",
});

// Common query pattern: list published articles, newest first
ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ "author._id": 1, createdAt: -1 });

// ---------- Virtuals ----------
// Human-readable read-time estimate (≈200 wpm)
ArticleSchema.virtual("readTimeMinutes").get(function () {
  if (!this.content) return 0;
  // Strip HTML tags if content is HTML, then count words
  const plain = String(this.content).replace(/<[^>]*>/g, " ");
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
});

// ---------- Hooks ----------
// Ensure thumbnail always has a value
ArticleSchema.pre("save", function () {
  if (!this.thumbnail || !this.thumbnail.trim()) {
    this.thumbnail = DEFAULT_THUMBNAIL;
  }

  // Auto-set publishedAt the first time it becomes "published"
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // No next() needed — sync hook, mongoose resolves automatically
});

// ---------- Statics ----------
ArticleSchema.statics.DEFAULT_THUMBNAIL = DEFAULT_THUMBNAIL;

// ---------- Export ----------
export default mongoose.models.Article ||
  mongoose.model("Article", ArticleSchema);
