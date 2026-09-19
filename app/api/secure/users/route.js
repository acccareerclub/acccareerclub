// app/api/secure/users/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import DynamicRole from "../../../models/DynamicRole";
import { getCurrentUser } from "../../../lib/authUtils";
import { sendVerificationSuccessEmail } from "../../../lib/mailsystem";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: Fetch all users with optional filters
export async function GET(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const allowedRoles = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    // ✅ Base query: exclude alumni only
    const baseQuery = {
      role: { $ne: "alumni" },
    };

    let query = { ...baseQuery };

    if (search) {
      query = {
        ...baseQuery,
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { studentId: { $regex: search, $options: "i" } },
          {
            "academicInfo.university.registrationNumber": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "academicInfo.university.semesters.rollNumber": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "academicInfo.university.years.rollNumber": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "academicInfo.hscOrEquivalent.rollNumber": {
              $regex: search,
              $options: "i",
            },
          },
          {
            "academicInfo.sscOrEquivalent.rollNumber": {
              $regex: search,
              $options: "i",
            },
          },
        ],
      };
    }

    const users = await User.find(query)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    // ✅ Unverified count also excludes alumni
    const unverifiedCount = await User.countDocuments({
      ...baseQuery,
      isVerified: false,
    });

    const dynamicRoles = await DynamicRole.find().lean();

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unverifiedCount,
      dynamicRoles,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
// Helper function to delete Cloudinary folder and its contents
async function deleteCloudinaryFolder(userId) {
  try {
    const folderPath = `profile_pictures/${userId}`;

    // First, get all resources in the folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 100,
    });

    // If there are resources, delete them
    if (resources.resources && resources.resources.length > 0) {
      const publicIds = resources.resources.map(
        (resource) => resource.public_id,
      );

      // Delete all resources in the folder
      const deletionResult = await cloudinary.api.delete_resources(publicIds);
      console.log(
        `✅ Deleted ${publicIds.length} images from Cloudinary folder: ${folderPath}`,
      );

      // Delete the empty folder
      try {
        await cloudinary.api.delete_folder(folderPath);
        console.log(`✅ Deleted Cloudinary folder: ${folderPath}`);
      } catch (folderError) {
        // Folder might already be deleted or doesn't exist
        console.log(`ℹ️ Folder ${folderPath} already deleted or doesn't exist`);
      }

      return { success: true, deletedCount: publicIds.length };
    } else {
      // No resources found, try to delete the folder anyway
      try {
        await cloudinary.api.delete_folder(folderPath);
        console.log(`✅ Deleted empty Cloudinary folder: ${folderPath}`);
      } catch (folderError) {
        // Folder doesn't exist, that's fine
        console.log(`ℹ️ Folder ${folderPath} doesn't exist`);
      }
      return { success: true, deletedCount: 0 };
    }
  } catch (error) {
    console.error("❌ Error deleting Cloudinary folder:", error);
    // Don't throw, just log the error and continue
    return { success: false, error: error.message };
  }
}

// PUT: Verify or Delete a user
export async function PUT(request) {
  try {
    const token =
      request.cookies.get("auth_token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const allowedRoles = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { userId, action, message } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (action === "verify") {
      user.isVerified = true;
      await user.save();

      // Send verification success email
      const emailResult = await sendVerificationSuccessEmail({
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
      });

      if (emailResult.success) {
        console.log(`✅ Verification email sent to ${user.email}`);
      } else {
        console.error(
          `❌ Failed to send verification email to ${user.email}:`,
          emailResult.error,
        );
      }

      return NextResponse.json({
        success: true,
        message: "User verified successfully",
        user,
        emailSent: emailResult.success,
      });
    } else if (action === "delete") {
      // Send deletion email before deleting
      const emailResult = await sendDeletionEmail(
        user.email,
        user.fullName,
        message,
      );

      if (emailResult.success) {
        console.log(`✅ Deletion email sent to ${user.email}`);
      } else {
        console.error(
          `❌ Failed to send deletion email to ${user.email}:`,
          emailResult.error,
        );
      }

      // Delete Cloudinary folder and its contents
      const cloudinaryResult = await deleteCloudinaryFolder(userId);

      if (cloudinaryResult.success) {
        console.log(
          `✅ Cloudinary folder for user ${userId} deleted successfully`,
        );
      } else {
        console.warn(
          `⚠️ Failed to delete Cloudinary folder for user ${userId}:`,
          cloudinaryResult.error,
        );
      }

      // Delete the user from database
      await User.findByIdAndDelete(userId);

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
        emailSent: emailResult.success,
        cloudinaryDeleted: cloudinaryResult.success,
        cloudinaryDeletedCount: cloudinaryResult.deletedCount || 0,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("User action error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process request",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// Helper function for deletion email
async function sendDeletionEmail(email, fullName, reason) {
  const subject = `Account Deletion Notice - ACC Career Club`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
        <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #3D444C; margin-top: 0;">Account Deletion Notice</h2>
        
        <p style="color: #555;">Dear ${fullName},</p>
        
        <p style="color: #555;">This is to inform you that your ACC Career Club account has been deleted.</p>
        
        ${
          reason
            ? `
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>Reason provided by administrator:</strong><br>
            ${reason}
          </p>
        </div>
        `
            : ""
        }
        
        <p style="color: #555;">If you believe this is a mistake or have any questions, please contact the club administration.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  // Import sendEmail dynamically to avoid circular dependency
  const { sendEmail } = await import("../../../lib/mailsystem");

  return await sendEmail({
    to: email,
    subject,
    html,
  });
}
