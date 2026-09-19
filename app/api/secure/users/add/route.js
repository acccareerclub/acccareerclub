// app/api/secure/users/add/route.js

// app/api/secure/users/add/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getCurrentUser, hashPassword } from "../../../../lib/authUtils";
import { sendWelcomeEmail } from "../../../../lib/mailsystem";

export async function POST(request) {
  try {
    // Verify authentication
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const allowedRoles = ["prefect", "itsecretary", "modarator", "assistant_prefect"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: body.email.toLowerCase() },
        { studentId: body.studentId.toUpperCase() },
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this email or student ID already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password);

    // Create user object
    const userData = {
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      phone: body.phone,
      studentId: body.studentId.toUpperCase(),
      department: body.department,
      password: hashedPassword,
      role: body.role || "member",
      isVerified: true, // Auto verified
      isActive: true, // Auto active
      personalInfo: {
        classOrYear: body.classOrYear || "",
        dateOfBirth: body.dateOfBirth || "",
        bloodGroup: body.bloodGroup || "",
        presentAddress: body.presentAddress || "",
        permanentAddress: body.permanentAddress || "",
        profilePicture: body.profilePicture || "",
        bio: body.bio || "",
      },
      guardianInfo: {
        father: {
          name: body.fatherName || "",
          occupation: body.fatherOccupation || "",
          contactNo: body.fatherContact || "",
        },
        mother: {
          name: body.motherName || "",
          occupation: body.motherOccupation || "",
          contactNo: body.motherContact || "",
        },
        emergencyContact: {
          name: body.emergencyName || "",
          relation: body.emergencyRelation || "",
          contactNo: body.emergencyContact || "",
        },
      },
      academicInfo: {
        university: {
          institutionName: "National University",
          collegeName: "Adamjee Cantonment College",
          registrationNumber: body.registrationNumber || "",
          examSystem: body.examSystem || "semester",
          session: body.session || "",
          cumulativeResult: {
            cgpa: body.cumulativeCgpa || "",
          },
        },
        sscOrEquivalent: {
          institutionName: body.sscInstitution || "",
          group: body.sscGroup || "",
          board: body.sscBoard || "",
          rollNumber: body.sscRollNumber || "",
          year: body.sscYear || "",
          result: body.sscResult || "",
        },
        hscOrEquivalent: {
          institutionName: body.hscInstitution || "",
          group: body.hscGroup || "",
          board: body.hscBoard || "",
          rollNumber: body.hscRollNumber || "",
          year: body.hscYear || "",
          result: body.hscResult || "",
        },
      },
      skills: body.skills || [],
      interests: body.interests || [],
      customSkills: body.customSkills || [],
      customInterests: body.customInterests || [],
      careerClubInfo: {
        reasonToJoin: body.reasonToJoin || "",
        interestedCareerOrgOrPos: body.interestedCareerOrgOrPos || "",
        requiredSkillsForCareer: body.requiredSkillsForCareer || "",
        roadmapPlanning: body.roadmapPlanning || "",
        careerProspectsOfDept: body.careerProspectsOfDept || "",
      },
    };

    // Create user
    const user = await User.create(userData);

    // Send welcome email with credentials
    await sendWelcomeEmail({
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      studentId: body.studentId,
      role: body.role || "member",
    });

    return NextResponse.json({
      success: true,
      message: "User added successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    console.error("Add user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add user",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}