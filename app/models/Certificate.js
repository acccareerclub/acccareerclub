// app/models/Certificate.js
import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. CERTIFICATE IDENTIFICATION
    // Format: ACC-YYYYMMDD-XXXX (date-based, human readable)
    // ==========================================
    certificateId: {
      type: String,
      required: [true, "Certificate ID is required"],
      unique: true,
      trim: true,
      uppercase: true, // e.g., "ACC-20260922-0042"
    },

    // ==========================================
    // 2. CERTIFICATE TYPE & PURPOSE
    // ==========================================
    certificateType: {
      type: String,
      required: true,
      enum: [
        "participation",   // Just participated
        "achievement",     // Won something (1st, 2nd, etc.)
        "completion",      // Finished a course/training
        "appreciation",    // Volunteered, helped
        "recognition",     // Outstanding contribution
        "membership",      // Standard club membership
        "alumni",          // Graduated / alumni status
        "organizer",       // Organized an event
        "speaker",         // Was a speaker
        "judge",           // Was a judge
        "mentor",          // Mentored others
        "excellence",      // Excellence award
        "custom",          // Fully custom (no event, no session)
        "special",         // Special/custom reason
      ],
      default: "participation",
    },

    // ==========================================
    // 3. LINKED EVENT (ALL OPTIONAL)
    // If eventName is empty, this is a standalone / custom certificate.
    // ==========================================
    event: {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event", // Links to Event model — optional
      },
      eventName: {
        type: String, // e.g., "Talent Hunt 2024"
        trim: true,
        default: "", // Empty = no event
      },
      eventType: {
        type: String, // workshop, competition, etc.
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

    // ==========================================
    // 4. RECIPIENT INFO
    // Supports both internal (linked to User) and external recipients.
    // ==========================================
    recipient: {
      // Internal recipient (from User collection) — optional
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // null = external recipient
      },
      // Indicates whether the recipient is a member of the club or external
      isClubMember: {
        type: Boolean,
        default: true, // false = external (guest, judge, sponsor, etc.)
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
      // Snapshot of role at time of issue
      roleAtIssue: {
        type: String,
        trim: true,
        default: "",
      },
      // For external recipients: their organization / affiliation
      externalOrganization: {
        type: String,
        trim: true,
        default: "", // e.g., "BRAC University", "Google"
      },
      externalId: {
        type: String,
        trim: true,
        default: "", // e.g., "Student Id", "Nid"
      },
    },

    // ==========================================
    // 5. CERTIFICATE CONTENT
    // ==========================================
    title: {
      type: String,
      required: true,
      trim: true, // e.g., "Certificate of Participation"
    },
    description: {
      type: String,
      trim: true, // Long-form paragraph for the certificate body
      default: "",
    },
    achievementTitle: {
      type: String,
      trim: true,
      default: "", // e.g., "1st Place", "Champion", "Best Volunteer"
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

    // ==========================================
    // 6. ISSUING AUTHORITY
    // ==========================================
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
        type: String, // prefect, itsecretary, modarator, etc.
        default: "",
      },
      designation: {
        type: String, // "President", "IT Secretary", etc.
        default: "",
      },
    },

    // ==========================================
    // 7. SIGNATORY SETUP
    // Controls whether the certificate needs signatures.
    // - systemGenerated: no signatures required (blank area)
    // - customSignatories: array of signers (Principal, Moderator, etc.)
    // ==========================================
    signatureType: {
      type: String,
      enum: [
        "system_generated", // "System generated — no signature required"
        "authorized_only",  // Only issuing authority signs
        "custom",           // Manual signatories array
      ],
      default: "system_generated",
    },
    // Only used when signatureType === "custom"
    signatories: [
      {
        name: { type: String, required: true },
        designation: { type: String, required: true },
        signatureUrl: { type: String, default: "" }, // Cloudinary URL
        // Optional: order of signature appearance on certificate
        order: { type: Number, default: 0 },
      },
    ],

    // ==========================================
    // 8. BACKGROUND / TEMPLATE
    // ==========================================
    background: {
      publicId: { type: String, default: "" },
      url: { type: String, default: "" }, // Cloudinary URL of bg image
    },
    templateUsed: {
      type: String,
      default: "default",
      trim: true, // Which template (e.g., "modern", "classic", "alumni")
    },
    clubLogoUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/ffuatrrt/image/upload/v1784889142/CareerClubOpengraph_znaeri.png",
    },
    // ==========================================
    // 9. DELIVERY & TRACKING
    // ==========================================
    emailSent: {
      type: Boolean,
      default: false,
    },
   
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================
CertificateSchema.index({ certificateId: 1 });
CertificateSchema.index({ verificationCode: 1 });
CertificateSchema.index({ "recipient.userId": 1 });
CertificateSchema.index({ "recipient.studentId": 1 });
CertificateSchema.index({ certificateType: 1 });
CertificateSchema.index({ "event.eventId": 1 });
CertificateSchema.index({ issueDate: -1 });

// ==========================================
// MODEL EXPORT
// ==========================================
const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);

export default Certificate;