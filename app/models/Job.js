// models/Job.js
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    // ---------- Core info ----------
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [200, "Job title cannot exceed 200 characters"],
    },

    // Slug for SEO-friendly URLs: /jobs/senior-software-engineer-at-bkash
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ---------- Classification ----------
    // Govt vs Private vs NGO etc.
    sector: {
      type: String,
      enum: ["government", "private", "ngo", "international", "autonomous"],
      default: "private",
      required: true,
      index: true,
    },

    // Job category — covers most Bangladesh job markets
    category: {
      type: String,
      enum: [
        "IT & Software",
        "Engineering",
        "Banking & Finance",
        "Education & Teaching",
        "Healthcare & Medical",
        "Government Service",
        "Marketing & Sales",
        "Accounting & Finance",
        "Human Resources",
        "Customer Service",
        "Garments & Textile",
        "Construction & Real Estate",
        "Telecommunication",
        "Logistics & Transport",
        "Media & Journalism",
        "Legal",
        "Hospitality & Tourism",
        "Agriculture",
        "NGO & Development",
        "Research & Development",
        "Management",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    // Full-time / part-time / contract / internship etc.
    employmentType: {
      type: String,
      enum: [
        "full-time",
        "part-time",
        "contract",
        "internship",
        "freelance",
        "temporary",
      ],
      default: "full-time",
      index: true,
    },

    // ---------- Location ----------
    location: {
      type: String,
      trim: true,
      default: "",
    },

    // Bangladesh divisions (for filtering)
    division: {
      type: String,
      enum: [
        "Dhaka",
        "Chattogram",
        "Rajshahi",
        "Khulna",
        "Barishal",
        "Sylhet",
        "Rangpur",
        "Mymensingh",
        "All",
        "",
      ],
      default: "",
      index: true,
    },

    // ---------- Description ----------
    // Main body — TinyMCE HTML or Markdown
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },

    // ---------- Application info ----------
    applicationDeadline: {
      type: Date,
      default: null,
      index: true,
    },

    applicationMode: {
      type: String,
      enum: ["apply-before", "walk-in"],
      default: "apply-before",
      index: true,
    },

    applyLink: {
      type: String,
      trim: true,
      default: "",
    },

    // ---------- Uploaded images ----------
    // Multiple JPG/PNG images — circulars, flyers, organograms, etc.
    images: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        fileName: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ---------- Meta / publishing ----------
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ---------- Tags / keywords ----------
    tags: {
      type: [String],
      default: [],
    },

    // ---------- Who posted it ----------
    // Snapshot — so the job survives even if the poster is removed
    postedBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      fullName: { type: String, default: "" },
      role: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// =====================================================================
// Indexes — only the ones that match real query patterns
// =====================================================================

// Full-text search across the fields users search by
JobSchema.index({
  jobTitle: "text",
  jobDescription: "text",
  tags: "text",
});

// Public list: active jobs, newest first
JobSchema.index({ isActive: 1, createdAt: -1 });

// Filter combinations used by the list page
JobSchema.index({ sector: 1, category: 1, createdAt: -1 });
JobSchema.index({ division: 1, createdAt: -1 });
JobSchema.index({ employmentType: 1, createdAt: -1 });

// =====================================================================
// Virtuals
// =====================================================================

// Days remaining until deadline (null if no deadline, 0 if already past)
JobSchema.virtual("daysRemaining").get(function () {
  if (!this.applicationDeadline) return null;
  const diff = new Date(this.applicationDeadline).getTime() - Date.now();
  if (diff < 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// =====================================================================
// Export
// =====================================================================
export default mongoose.models.Job || mongoose.model("Job", JobSchema);