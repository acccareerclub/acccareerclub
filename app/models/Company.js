// models/Company.js
import mongoose from "mongoose";

// Optional: default logo if none uploaded
const DEFAULT_LOGO = "";

const CompanySchema = new mongoose.Schema(
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

    // Main body — company overview, history, values, etc. (HTML from TinyMCE)
    content: {
      type: String,
      required: [true, "Content is required"],
    },

    // ---------- Branding ----------
    companyLogo: {
      type: String,
      default: DEFAULT_LOGO,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// =====================================================================
// Indexes
// =====================================================================

// Full-text search across the fields users will search by
CompanySchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

// Public list: published companies, newest first
CompanySchema.index({ status: 1, publishedAt: -1 });

// =====================================================================
// Hooks
// =====================================================================

// Auto-set publishedAt the first time it becomes "published"
CompanySchema.pre("save", function () {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// =====================================================================
// Export
// =====================================================================
export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);