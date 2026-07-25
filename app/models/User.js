// app/models/User.js
import mongoose from "mongoose";

console.log("🔄 Loading User model...");

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
      enum: ["student", "prefect", "itsecretary", "modarator"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    noticeMail: {
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

    // ==========================================
    // 5. ACADEMIC INFORMATION (Updated)
    // ==========================================
    academicInfo: {
      // For University/College students
      university: {
        institutionName: String,
        department: String,
        examSystem: {
          type: String,
          enum: ["semester", "yearly"],
          default: "semester",
        },
        // For Semester system (1st, 2nd, 3rd, 4th...)
        semesters: [
          {
            semesterNumber: {
              type: Number,
              required: function () {
                return this.parent().examSystem === "semester";
              },
            },
            examName: String, // e.g., "1st Semester", "2nd Semester"
            year: String,
            result: String, // GPA or CGPA
            grade: String, // A+, A, B+, etc.
            remarks: String,
          },
        ],
        // For Yearly system (1st year, 2nd year, 3rd year...)
        years: [
          {
            yearNumber: {
              type: Number,
              required: function () {
                return this.parent().examSystem === "yearly";
              },
            },
            examName: String, // e.g., "1st Year", "2nd Year"
            year: String,
            result: String,
            grade: String,
            remarks: String,
          },
        ],
        // Cumulative result (overall CGPA/GPA)
        cumulativeResult: {
          cgpa: String,
          grade: String,
          totalCredits: String,
          remarks: String,
        },
        // Additional info
        passingYear: String,
        session: String,
      },

      // For HSC/Equivalent (only one result)
      hscOrEquivalent: {
        year: String,
        group: String,
        board: String,
        result: String, // GPA
        grade: String,
        instituteName: String,
        remarks: String,
      },

      // For SSC/Equivalent (only one result)
      sscOrEquivalent: {
        year: String,
        group: String,
        board: String,
        result: String, // GPA
        grade: String,
        instituteName: String,
        remarks: String,
      },
    },

    // ==========================================
    // 6. SKILLS & INTERESTS (Optional)
    // ==========================================
    skills: {
      type: [String],
      default: [],
    },
    interests: {
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
    // 8. CAREER CLUB SPECIFIC (Optional)
    // ==========================================
    careerClubInfo: {
      reasonToJoin: String,
      interestedCareerOrgOrPos: String,
      requiredSkillsForCareer: String,
      roadmapPlanning: String,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for unique constraints
UserSchema.index({ email: 1, studentId: 1 });

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
