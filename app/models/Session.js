// app/models/Session.js
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    sessionTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    sessionThumbnail: {
      publicId: { type: String },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/ffuatrrt/image/upload/v1790075521/invitation_seminar_j2xrio.jpg",
      },
    },
    sessionDescription: {
      type: String, // TinyMCE HTML content
    },
    sessionType: {
      type: String,
      enum: [
        "workshop",
        "seminar",
        "webinar",
        "meeting",
        "training",
        "competition",
        "other",
      ],
      default: "seminar",
    },
    meetingType: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    preResources: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        fileName: { type: String }, // Added to display nice names
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    postResources: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        fileName: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    feedback: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionDate: {
      type: Date,
    },
    // CHANGED: Now a String to hold "Saturday", "Sunday", etc.
    sessionDay: {
      type: String,
      enum: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "",
      ],
      default: "",
    },
    sessionStatus: {
      type: String,
      default: "upcoming",
      enum: ["upcoming", "completed", "cancelled"],
    },
    sessionAttendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Track who created/edited it
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String },
    createdByRole: { type: String },
  },
  { timestamps: true },
);

SessionSchema.index({ createdAt: -1 });
SessionSchema.index({ isActive: 1 });
SessionSchema.index({ sessionDate: 1 });

const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
export default Session;
