// app/models/Event.js
import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    eventTitle: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    eventThumbnail: {
      publicId: { type: String },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/ffuatrrt/image/upload/v1790148020/event-invitation_alzpch.jpg",
      },
    },
    eventDescription: {
      type: String, // TinyMCE HTML content
    },
    eventType: {
      type: String,
      enum: [
        "workshop",
        "seminar",
        "webinar",
        "meeting",
        "training",
        "competition",
        "talent hunt",
        "other",
      ],
      default: "competition",
    },
    location: {
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
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        externalEmail: {
          type: String,
          trim: true,
          lowercase: true,
          default: "",
        },
        externalName: {
          type: String,
          trim: true,
          default: "",
        },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    eventDate: {
      type: Date,
    },
    // CHANGED: Now a String to hold "Saturday", "Sunday", etc.
    eventDay: {
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
    eventStatus: {
      type: String,
      default: "upcoming",
      enum: ["upcoming", "completed", "cancelled"],
    },
    preRegistrationRequired: {
      type: Boolean,
      default: false,
    },
    preRegistrationDeadline: {
      type: Date,
    },
    externalPreRegistrationAllowed: {
      type: Boolean,
      default: false,
    },
    preRegistrationUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: Number,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
        },
        institution: {
          type: String,
          trim: true,
          default: "", // e.g., "BRAC University", "Notre Dame College"
        },
        identificationNo: {
          type: String,
          trim: true,
        },
      },
    ],
    eventSpeakerAvailability: {
      type: Boolean,
      default: false,
    },
    eventSpeakerCredentials: {
      speakerName: { type: String },
      speakerDescription: { type: String },
    },
    eventAttendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // ✅ NEW: External (non-member) attendees
    externalAttendees: [
      {
        name: {
          type: String,
          trim: true,
          required: true,
        },
        email: {
          type: String,
          trim: true,
          default: "",
        },
        phone: {
          type: Number,
          trim: true,
          default: "",
        },
        institution: {
          type: String,
          trim: true,
          default: "", // Their college/university
        },
        identificationNo: {
          type: String,
          trim: true,
          default: "",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    achievers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null, // null for external achievers
        },
        // ✅ NEW: rank/position label
        position: {
          type: String,
          trim: true,
          default: "", // "1st", "2nd", "3rd", "Special Mention", etc.
        },
        name: {
          type: String,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
        },
        institution: {
          type: String,
          trim: true,
          default: "",
        },
        identificationNo: {
          type: String,
          trim: true,
        },
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

EventSchema.index({ createdAt: -1 });
EventSchema.index({ isActive: 1 });
EventSchema.index({ eventDate: 1 });

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);
export default Event;
