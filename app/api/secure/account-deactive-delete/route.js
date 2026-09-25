// app/api/secure/account-deactive-delete/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import OTP from "@/app/models/OTP";
import { getCurrentUser } from "@/app/lib/authUtils";
import { sendEmail } from "@/app/lib/mailsystem";
import { sendAccountStatusEmail } from "@/app/lib/mailsystem";

const ALLOWED_ROLES = ["prefect", "itsecretary", "modarator", "assistant_prefect"];
const ADMIN_ROLES = ["prefect", "itsecretary", "modarator", "assistant_prefect"];

// ============================================================
// GET — search for a target user
// ============================================================
export async function GET(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || !ALLOWED_ROLES.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        users: [],
      });
    }

    // Escape regex specials
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");

    const users = await User.find({
      $or: [
        { fullName: rx },
        { studentId: rx },
        { membershipId: rx },
        { email: rx },
        { phone: rx },
      ],
    })
      .select(
        "fullName email studentId membershipId phone department role isVerified isActive personalInfo.profilePicture",
      )
      .limit(25)
      .lean();

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map((u) => ({
        _id: String(u._id),
        fullName: u.fullName,
        email: u.email,
        studentId: u.studentId,
        membershipId: u.membershipId || "",
        phone: u.phone || "",
        department: u.department || "",
        role: u.role,
        isVerified: !!u.isVerified,
        isActive: u.isActive !== false,
        profilePicture: u.personalInfo?.profilePicture || "",
      })),
    });
  } catch (error) {
    console.error("Search user error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}

// ============================================================
// POST — send OTP to CURRENT user before action
// ============================================_
export async function POST(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || !ALLOWED_ROLES.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { action, targetUserId } = body;

    if (!["delete", "activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: "Target user ID required" },
        { status: 400 },
      );
    }

    // Load current user (the one performing the action)
    const currentUser = await User.findById(decoded.userId).select(
      "fullName email role",
    );
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Current user not found" },
        { status: 404 },
      );
    }

    // Load target user
    const targetUser = await User.findById(targetUserId).select(
      "fullName email studentId isActive",
    );
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 },
      );
    }

    // Prevent self-deletion/deactivation
    if (String(currentUser._id) === String(targetUser._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot perform this action on your own account.",
        },
        { status: 400 },
      );
    }

    // For activate: verify the target is currently inactive
    if (action === "activate" && targetUser.isActive !== false) {
      return NextResponse.json(
        {
          success: false,
          message: "This user is already active.",
        },
        { status: 400 },
      );
    }

    // For deactivate/delete: verify the target is currently active
    if (
      (action === "deactivate" || action === "delete") &&
      targetUser.isActive === false
    ) {
      // It's still fine to deactivate/delete an already-inactive user
      // but let's warn for delete
    }

    // Clean any existing OTPs for this admin
    await OTP.deleteMany({ email: currentUser.email });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await OTP.create({
      email: currentUser.email.toLowerCase(),
      otp,
      userId: currentUser._id,
      expiry: expiryTime,
      verified: false,
      attempts: 0,
    });

    // Compose the action label
    const actionLabel =
      action === "delete"
        ? "Delete Account"
        : action === "activate"
          ? "Activate Account"
          : "Deactivate Account";

    // Send OTP to the CURRENT user
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
        <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
          <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #3D444C; margin-top: 0;">Confirm: ${actionLabel}</h2>
          <p style="color: #555;">Dear ${currentUser.fullName},</p>
          <p style="color: #555;">
            You are about to perform <strong>${actionLabel}</strong> on the following user:
          </p>
          <div style="background: #f5f5f5; padding: 16px 20px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #994D35;">
            <p style="margin: 0; color: #3D444C;"><strong>${targetUser.fullName}</strong></p>
            <p style="margin: 4px 0 0 0; color: #777; font-size: 13px;">
              ${targetUser.email || ""} · ID: ${targetUser.studentId || "N/A"}
            </p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #555; font-size: 14px;">Your OTP is:</p>
            <h2 style="color: #994D35; font-size: 36px; letter-spacing: 5px; margin: 10px 0;">${otp}</h2>
            <p style="margin: 0; color: #777; font-size: 12px;">Expires in 10 minutes</p>
          </div>
          <p style="color: #555; font-size: 14px;">
            If you did not request this, ignore this email immediately and check your account security.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from ACC Career Club.
          </p>
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: currentUser.email,
      subject: `OTP for ${actionLabel} - ACC Career Club`,
      html: emailHtml,
    });

    if (!result.success) {
      await OTP.deleteMany({ email: currentUser.email });
      return NextResponse.json(
        { success: false, message: "Failed to send OTP. Try again." },
        { status: 500 },
      );
    }

    // Mask admin email for display
    const [localPart, domain] = currentUser.email.split("@");
    const maskedEmail =
      localPart.length > 4
        ? localPart.slice(0, 2) +
          "****" +
          localPart.slice(-2) +
          "@" +
          domain
        : localPart.slice(0, 1) + "***" + localPart.slice(-1) + "@" + domain;

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      maskedEmail,
      action,
      targetUserId: String(targetUser._id),
      targetUser: {
        _id: String(targetUser._id),
        fullName: targetUser.fullName,
        email: targetUser.email,
        studentId: targetUser.studentId,
      },
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 },
    );
  }
}

// ============================================================
// PUT — verify OTP and perform the action
// ============================================================
export async function PUT(request) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    if (!decoded || !ALLOWED_ROLES.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { action, targetUserId, otp, reason } = body;

    if (!["delete", "activate", "deactivate"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }
    if (!targetUserId || !otp) {
      return NextResponse.json(
        { success: false, message: "Target user and OTP required" },
        { status: 400 },
      );
    }

    const currentUser = await User.findById(decoded.userId).select(
      "fullName email",
    );
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Current user not found" },
        { status: 404 },
      );
    }

    // Look up the OTP
    const otpRecord = await OTP.findOne({
      email: currentUser.email.toLowerCase(),
      otp: String(otp).trim(),
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 },
      );
    }

    if (new Date() > otpRecord.expiry) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: "OTP has expired" },
        { status: 400 },
      );
    }

    if (otpRecord.verified) {
      return NextResponse.json(
        { success: false, message: "This OTP has already been used" },
        { status: 400 },
      );
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts. Please request a new OTP.",
        },
        { status: 400 },
      );
    }

    // Load target
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "Target user not found" },
        { status: 404 },
      );
    }

    if (String(currentUser._id) === String(targetUser._id)) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot perform this action on your own account.",
        },
        { status: 400 },
      );
    }

    // Mark OTP as verified BEFORE performing the action
    otpRecord.verified = true;
    await otpRecord.save();

    // ---------- ACTIONS ----------
    if (action === "delete") {
      // Send deletion email
      try {
        await sendDeletionEmail(
          targetUser.email,
          targetUser.fullName,
          reason || "No reason provided",
        );
      } catch (e) {
        console.error("Deletion email failed:", e);
      }

      // Optional: clean up Cloudinary (reuse your existing helper)
      // (skipping here to keep this file self-contained)

      await User.findByIdAndDelete(targetUserId);
      await OTP.deleteOne({ _id: otpRecord._id });

      return NextResponse.json({
        success: true,
        message: `User "${targetUser.fullName}" deleted successfully.`,
      });
    }

    if (action === "deactivate") {
      targetUser.isActive = false;
      targetUser.sessionToken = null; // force logout
      await targetUser.save();

      try {
        await sendAccountStatusEmail({
          fullName: targetUser.fullName,
          email: targetUser.email,
          isActive: false,
          reason: reason || "No reason provided",
        });
      } catch (e) {
        console.error("Status email failed:", e);
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      return NextResponse.json({
        success: true,
        message: `User "${targetUser.fullName}" deactivated successfully.`,
      });
    }

    if (action === "activate") {
      targetUser.isActive = true;
      await targetUser.save();

      try {
        await sendAccountStatusEmail({
          fullName: targetUser.fullName,
          email: targetUser.email,
          isActive: true,
          reason: "",
        });
      } catch (e) {
        console.error("Status email failed:", e);
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      return NextResponse.json({
        success: true,
        message: `User "${targetUser.fullName}" activated successfully.`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Unhandled action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Perform action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to complete action" },
      { status: 500 },
    );
  }
}

// ============================================================
// Helper: deletion email
// ============================================================
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
            ? `<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                 <p style="margin: 0; color: #856404;"><strong>Reason:</strong><br>${reason}</p>
               </div>`
            : ""
        }
        <p style="color: #555;">If you believe this is a mistake, please contact the club administration.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club.
        </p>
      </div>
    </div>
  `;
  return await sendEmail({ to: email, subject, html });
}