// app/api/secure/notice/create-notice/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Notice from "../../../../models/Notice";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";
import { sendNoticeEmail } from "../../../../lib/mailsystem";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload images to Cloudinary
const uploadImagesToCloudinary = async (files, noticeId) => {
  const uploadedImages = [];

  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `notices/${noticeId}`,
            public_id: `notice_${noticeId}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            transformation: [
              { width: 1200, crop: "limit" },
              { quality: "auto:best" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      uploadedImages.push({
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  return uploadedImages;
};

// Helper function to delete images from Cloudinary
const deleteImagesFromCloudinary = async (imagePublicIds) => {
  const deletionPromises = imagePublicIds.map((publicId) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  });

  await Promise.all(deletionPromises);
};

export async function POST(request) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth_token")?.value;
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

    // Check if user has permission
    const allowedRoles = ["prefect", "itsecretary", "modarator"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "You don't have permission to create notices" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const category = formData.get("category") || "general";
    const priority = formData.get("priority") || "medium";
    const images = formData.getAll("images").filter(file => file.size > 0);

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Title and content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Create notice
    const notice = new Notice({
      title,
      content,
      category,
      priority,
      createdBy: decoded.userId,
      createdByName: user.fullName || "Unknown",
      createdByRole: decoded.role,
      publishedAt: new Date(),
    });

    // Upload images if any
    if (images.length > 0) {
      try {
        // Save notice first to get ID for folder structure
        await notice.save();
        
        const uploadedImages = await uploadImagesToCloudinary(images, notice._id);
        notice.images = uploadedImages;
        await notice.save();
      } catch (uploadError) {
        // If upload fails, delete the notice
        await Notice.findByIdAndDelete(notice._id);
        return NextResponse.json(
          { success: false, message: uploadError.message },
          { status: 500 }
        );
      }
    } else {
      await notice.save();
    }

    // --- SEND EMAIL NOTIFICATIONS ---
    let emailRecipients = 0;
    let emailSent = false;
    
    try {
      // Get all users with noticeMail: true and isActive: true
      const usersToNotify = await User.find({
        noticeMail: true,
        isActive: true,
        isVerified: true,
      }).select('email fullName _id');

      if (usersToNotify.length > 0) {
        const recipientEmails = usersToNotify.map(u => u.email);
        emailRecipients = recipientEmails.length;
        
        // Check if sendNoticeEmail function exists
        if (typeof sendNoticeEmail === 'function') {
          const emailResult = await sendNoticeEmail({
            noticeTitle: title,
            noticeContent: content,
            noticeCategory: category,
            noticePriority: priority,
            createdByName: user.fullName || "Unknown",
            createdByRole: decoded.role,
            noticeId: notice._id,
            noticeImages: notice.images || [],
            recipientEmails: recipientEmails,
            recipientId: user._id,
          });

          emailSent = emailResult.success || false;
          console.log(`📧 Notice email sent to ${recipientEmails.length} recipients`);
          
          if (!emailResult.success) {
            console.warn('⚠️ Some notice emails failed to send:', emailResult.results);
          }
        } else {
          console.warn('⚠️ sendNoticeEmail function not found');
        }
      } else {
        console.log('📧 No users to notify (noticeMail: false or no active users)');
      }
    } catch (emailError) {
      // Don't fail the request if email fails, just log it
      console.error('❌ Failed to send notice emails:', emailError.message);
      // Continue execution - notice is already saved
    }

    return NextResponse.json({
      success: true,
      message: "Notice created successfully" + (emailSent ? " and email notifications sent" : ""),
      notice: notice,
      emailRecipients: emailRecipients,
      emailSent: emailSent,
    });

  } catch (error) {
    console.error("❌ Create notice error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create notice",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}