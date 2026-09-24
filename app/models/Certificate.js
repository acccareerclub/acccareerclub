// app/models/Certificate.js
import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: [true, "Certificate ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    certificateType: {
      type: String,
      required: true,
      enum: [
        "participation",
        "achievement",
        "completion",
        "appreciation",
        "recognition",
        "membership",
        "alumni",
        "organizer",
        "speaker",
        "judge",
        "mentor",
        "excellence",
        "custom",
        "special",
      ],
      default: "participation",
    },
    event: {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      eventName: {
        type: String,
        trim: true,
        default: "",
      },
      eventType: {
        type: String,
        trim: true,
        default: "",
      },
      eventDate: {
        type: Date,
      },
      eventLocation: {
        type: String,
        trim: true,
        default: "",
      },
    },
    recipient: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      isClubMember: {
        type: Boolean,
        default: true,
      },
      fullName: {
        type: String,
        required: true,
        trim: true,
      },
      studentId: {
        type: String,
        trim: true,
        default: "",
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
      phone: {
        type: String,
        trim: true,
        default: "",
      },
      department: {
        type: String,
        trim: true,
        default: "",
      },
      roleAtIssue: {
        type: String,
        trim: true,
        default: "",
      },
      externalOrganization: {
        type: String,
        trim: true,
        default: "",
      },
      externalId: {
        type: String,
        trim: true,
        default: "",
      },
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    achievementTitle: {
      type: String,
      trim: true,
      default: "",
    },
    achievementPosition: {
      type: String,
      enum: [
        "1st",
        "2nd",
        "3rd",
        "champion",
        "runner_up",
        "finalist",
        "honorable_mention",
        "special_mention",
        "participant",
        "",
      ],
      default: "",
    },
    issuedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      fullName: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        default: "",
      },
      designation: {
        type: String,
        default: "",
      },
    },
    signatureType: {
      type: String,
      enum: [
        "system_generated",
        "moderator_signed",
        "moderator_and_principal_signed",
      ],
      default: "system_generated",
    },
    signatories: [
      {
        name: { type: String, required: true },
        designation: { type: String, required: true },
        signatureUrl: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    background: {
      publicId: { type: String, default: "" },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/ffuatrrt/image/upload/v1790161104/certificate_back_1_sxzqf8.jpg",
      },
    },
    templateUsed: {
      type: String,
      default: "default",
      trim: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    // NEW: Batch tracking for bulk generation
    batchId: {
      type: String,
      default: null,
      index: true,
    },
    // NEW: Generation metadata
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generationMethod: {
      type: String,
      enum: ["individual", "selective", "bulk", "external"],
      default: "individual",
    },
    published:{
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ "recipient.userId": 1 });
CertificateSchema.index({ "recipient.studentId": 1 });
CertificateSchema.index({ certificateType: 1 });
CertificateSchema.index({ "event.eventId": 1 });
CertificateSchema.index({ batchId: 1 });

const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);

export default Certificate;
