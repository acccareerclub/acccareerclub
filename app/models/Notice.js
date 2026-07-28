// app/models/Notice.js
import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "academic", "event", "career", "important", "club"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    images: [
      {
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["prefect", "itsecretary", "modarator"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    // For tracking who has seen this notice
    seenBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        seenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
NoticeSchema.index({ createdAt: -1 });
NoticeSchema.index({ category: 1 });
NoticeSchema.index({ priority: 1 });
NoticeSchema.index({ isActive: 1 });
NoticeSchema.index({ createdBy: 1 });

console.log("✅ Notice schema created");

// Hide sensitive fields in JSON responses
NoticeSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Notice = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);

export default Notice;