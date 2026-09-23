// app/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ==========================================
    // 1. BASIC INFO (Required for Signup)
    // ==========================================
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\-\s()]+$/, "Please enter a valid phone number"],
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },

    // ==========================================
    // 2. AUTHENTICATION & SYSTEM INFO
    // ==========================================
    role: {
      type: String,
      default: "member",
    },
    executiveBranch: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true, // New field for account status
    },
    sessionToken: {
      type: String,
      default: null, // Store the current session token
    },
    noticeMail: {
      type: Boolean,
      default: true,
    },
    jobMail: {
      type: Boolean,
      default: true,
    },
    newsletterMail: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // 3. ADDITIONAL PERSONAL INFO (Optional)
    // ==========================================
    personalInfo: {
      classOrYear: String,
      dateOfBirth: String,
      bloodGroup: String,
      facebookIdLink: String,
      linkedInIdLink: String,
      presentAddress: String,
      permanentAddress: String,
      profilePicture: String,
      bio: String,
    },

    // ==========================================
    // 4. GUARDIAN INFORMATION (Optional)
    // ==========================================
    guardianInfo: {
      father: {
        name: String,
        occupation: String,
        contactNo: String,
      },
      mother: {
        name: String,
        occupation: String,
        contactNo: String,
      },
      emergencyContact: {
        name: String,
        relation: String,
        contactNo: String,
      },
    },

    // app/models/User.js - Updated section for hscOrEquivalent and sscOrEquivalent

    // ==========================================
    // 5. ACADEMIC INFORMATION (Updated)
    // ==========================================
    academicInfo: {
      university: {
        institutionName: {
          type: String,
          default: "National University",
        },
        collegeName: {
          type: String,
          default: "Adamjee Cantonment College",
        },
        registrationNumber: String,
        examSystem: {
          type: String,
          enum: ["semester", "yearly"],
          default: "semester",
        },
        semesters: [
          {
            semesterNumber: Number,
            examName: String,
            year: String,
            rollNumber: String,
            result: String,
            remarks: String,
          },
        ],
        years: [
          {
            yearNumber: Number,
            examName: String,
            year: String,
            rollNumber: String,
            result: String,
            remarks: String,
          },
        ],
        cumulativeResult: {
          cgpa: String,
          totalCredits: String,
          remarks: String,
        },
        passingYear: String,
        session: String,
      },
      hscOrEquivalent: {
        year: String,
        group: {
          type: String,
          enum: ["", "Humanities", "Business Studies", "Science"],
          default: "",
        },
        board: String,
        rollNumber: String,
        institutionName: String,
        result: String,
        remarks: String,
      },
      sscOrEquivalent: {
        year: String,
        group: {
          type: String,
          enum: ["", "Humanities", "Business Studies", "Science"],
          default: "",
        },
        board: String,
        rollNumber: String,
        institutionName: String,
        result: String,
        remarks: String,
      },
    },

    // ==========================================
    // 6. SKILLS & INTERESTS
    // ==========================================
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    customSkills: {
      type: [String],
      default: [],
    },
    customInterests: {
      type: [String],
      default: [],
    },

    // ==========================================
    // 7. EXPERIENCE (Optional)
    // ==========================================
    experience: {
      clubExperience: [
        {
          clubName: String,
          position: String,
          duration: String,
          responsibility: String,
        },
      ],
      jobOrInternship: [
        {
          organization: String,
          designation: String,
          duration: String,
          responsibility: String,
        },
      ],
      extraCurricularActivities: String,
    },

    // ==========================================
    // 7.1 ACHIEVEMENTS (Optional)
    // ==========================================
    achievements: [
      {
        title: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          enum: [
            "academic",
            "sports",
            "cultural",
            "technical",
            "competition",
            "olympiad",
            "volunteering",
            "leadership",
            "arts",
            "other",
            "",
          ],
          default: "",
        },
        level: {
          type: String,
          enum: [
            "school",
            "college",
            "university",
            "district",
            "divisional",
            "national",
            "international",
            "",
          ],
          default: "",
        },
        organizer: {
          type: String,
          trim: true,
        },
        position: {
          type: String,
          trim: true, // e.g., "1st Place", "Runner-up", "Winner", "Finalist", "Participant"
        },
        date: {
          type: String,
        },
        location: {
          type: String,
          trim: true,
        },
        projectOrCompetitionName: {
          type: String,
          trim: true, // Name of the specific project / contest
        },
      },
    ],

    // ==========================================
    // 8. CAREER CLUB SPECIFIC (Updated)
    // ==========================================
    careerClubInfo: {
      reasonToJoin: String,
      interestedCareerOrgOrPos: String,
      requiredSkillsForCareer: String,
      roadmapPlanning: String,
      careerProspectsOfDept: String,
    },
    // ==========================================
    // 8.1 ACC CAREER CLUB Achievements
    // ==========================================

    accCareerClubAchievements: [
      {
        organizer: {
          // e.g., "ACC Career Club"
          type: String,
          trim: true,
        },
        position: {
          // "Champion", "1st Runner-up", "Finalist", "Volunteer"
          type: String,
          trim: true,
        },
        date: {
          // "2024-08-15" or "August 2024"
          type: String,
        },
        eventName: {
          // e.g., "Talent Hunt 2024", "Career Fair 2024"
          type: String,
          trim: true,
        },
        certificate: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Certificate",
          default: null,
        },
      },
    ],

    // ==========================================
    // 8.1 ALUMNI INFORMATION (Only for alumni)
    // ==========================================
    alumniInfo: {
      batch: {
        type: String,
        trim: true,
        default: "",
      },
      currentJobCompany: {
        type: String,
        trim: true,
        default: "",
      },
      currentDesignation: {
        type: String,
        trim: true,
        default: "",
      },
      isUnemployed: {
        type: Boolean,
        default: false,
      },
      contactPhone: {
        type: String,
        trim: true,
        default: "",
      },
      passedYear: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ==========================================
    // 9. DECLARATION
    // ==========================================
    declaration: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for unique constraints
UserSchema.index({ email: 1, studentId: 1 });
UserSchema.index({ sessionToken: 1 });

console.log("✅ User schema created with timestamps");

// Hide password and unnecessary fields in JSON responses
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

// ✅ Ensure indexes are created
UserSchema.on("index", function (error) {
  if (error) {
    console.error("❌ Index creation error:", error);
  } else {
    console.log("✅ Indexes created successfully");
  }
});

// Check if model exists before creating a new one
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
