// app/lib/mailsystem.js
import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  // For Gmail with App Password
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  // For other SMTP services
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async ({ to, subject, html, text, from }) => {
  try {
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: from || `"ACC Career Club" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Fallback to plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    console.error("Error details:", error);
    return { success: false, error: error.message };
  }
};

// Send verification request email to prefects and IT secretaries
export const sendVerificationRequestToPrefects = async (
  userData,
  adminEmails,
) => {
  const subject = `New Member Registration Pending Verification - ${userData.fullName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
        <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #3D444C; margin-top: 0;">New Member Registration</h2>
        <p style="color: #555;">A new student has registered and requires verification.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #3D444C; margin-top: 0;">Student Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Full Name:</td>
              <td style="padding: 8px 0; color: #333;">${userData.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
              <td style="padding: 8px 0; color: #333;">${userData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
              <td style="padding: 8px 0; color: #333;">${userData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Student ID:</td>
              <td style="padding: 8px 0; color: #333;">${userData.studentId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Department:</td>
              <td style="padding: 8px 0; color: #333;">${userData.department}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #555;">Registered At:</td>
              <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>Action Required:</strong> Please review this student's information and verify their account.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL || "https://ccacc.vercel.app"}/dashboard/users" 
             style="background: #994D35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Verification Panel
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: adminEmails,
    subject,
    html,
  });
};

// Send confirmation email to the student
export const sendStudentConfirmationEmail = async (userData) => {
  const subject = `Registration Submitted - ACC Career Club`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
        <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #3D444C; margin-top: 0;">Registration Submitted! 🎉</h2>
        
        <p style="color: #555;">Dear ${userData.fullName},</p>
        
        <p style="color: #555;">Thank you for registering with ACC Career Club. Your application has been submitted successfully and is now pending verification.</p>
        
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>What happens next?</strong><br>
            Our team will review your application and verify your account. You will receive a confirmation email once your account is verified.
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #3D444C; margin-top: 0;">Your Registration Details:</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;"><strong>Name:</strong> ${userData.fullName}</li>
            <li style="padding: 5px 0;"><strong>Student ID:</strong> ${userData.studentId}</li>
            <li style="padding: 5px 0;"><strong>Department:</strong> ${userData.department}</li>
            <li style="padding: 5px 0;"><strong>Email:</strong> ${userData.email}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #555; font-size: 14px;">You will be notified via email once your account is verified.</p>
          <p style="color: #555; font-size: 14px;">Thank you for your patience! 🙏</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userData.email,
    subject,
    html,
  });
};

// Send verification success email
export const sendVerificationSuccessEmail = async (userData) => {
  const subject = `Account Verified - Welcome to ACC Career Club! 🎉`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
        <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background: #28a745; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span style="color: white; font-size: 32px;">✓</span>
          </div>
        </div>
        
        <h2 style="color: #3D444C; text-align: center; margin-top: 0;">Welcome to ACC Career Club!</h2>
        
        <p style="color: #555;">Dear ${userData.fullName},</p>
        
        <p style="color: #555;">Great news! Your account has been verified successfully. You are now officially a member of the ACC Career Club community. 🎉</p>
        
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>You can now:</strong><br>
            ✅ Access career counseling resources<br>
            ✅ Connect with alumni and industry professionals<br>
            ✅ Discover internships and job opportunities<br>
            ✅ Participate in club events and workshops
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL || "http://ccacc.vercel.app"}/login" 
             style="background: #994D35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login and go to profile. Then complete your profile.
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: userData.email,
    subject,
    html,
  });
};

// Send account status (activate/deactivate) email
export const sendAccountStatusEmail = async ({
  fullName,
  email,
  isActive,
  reason,
}) => {
  const status = isActive ? "activated" : "deactivated";
  const subject = `Account ${isActive ? "Activated" : "Deactivated"} - ACC Career Club`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
        <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background: ${isActive ? "#28a745" : "#dc3545"}; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span style="color: white; font-size: 32px;">${isActive ? "✓" : "✕"}</span>
          </div>
        </div>
        
        <h2 style="color: #3D444C; text-align: center; margin-top: 0;">Account ${isActive ? "Activated" : "Deactivated"}</h2>
        
        <p style="color: #555;">Dear ${fullName},</p>
        
        <p style="color: #555;">
          Your ACC Career Club account has been <strong>${status}</strong> by an administrator.
        </p>
        
        ${
          !isActive && reason
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
        
        ${
          isActive
            ? `
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>Your account is now active!</strong><br>
            You can now login and access all ACC Career Club features.
          </p>
        </div>
        `
            : `
        <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #721c24;">
            <strong>Your account has been deactivated.</strong><br>
            Please contact the club administration if you believe this is a mistake.
          </p>
        </div>
        `
        }
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

// Send welcome email with credentials for manually added users
export const sendWelcomeEmail = async ({
  fullName,
  email,
  password,
  studentId,
  role,
}) => {
  const subject = `Welcome to ACC Career Club - Your Account Details`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #3D444C, #994D35); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #E7E3D8; margin: 0; font-size: 24px;">ACC Career Club</h1>
        <p style="color: #D3A16D; margin: 5px 0 0; font-size: 16px;">Adamjee Cantonment College</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background: #28a745; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto;">
            <span style="color: white; font-size: 32px;">✓</span>
          </div>
        </div>
        
        <h2 style="color: #3D444C; text-align: center; margin-top: 0;">Welcome to ACC Career Club!</h2>
        
        <p style="color: #555;">Dear ${fullName},</p>
        
        <p style="color: #555;">Your account has been created successfully by the ACC Career Club administration. You are now officially a member of our community! 🎉</p>
        
        <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>Your Login Credentials:</strong><br>
            <strong>Email:</strong> ${email}<br>
            <strong>Student ID:</strong> ${studentId}<br>
            <strong>Password:</strong> <span style="background: #f5f5f5; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${password}</span><br>
            <strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}
          </p>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Important Security Notice:</strong><br>
            Please change your password immediately after your first login for security reasons.
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #3D444C; margin-top: 0;">Next Steps:</h4>
          <ol style="color: #555; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Login to your account using the credentials above</li>
            <li style="margin-bottom: 8px;">Change your password immediately</li>
            <li style="margin-bottom: 8px;">Complete your profile with additional information</li>
            <li style="margin-bottom: 8px;">Explore career opportunities and resources</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL || "https://ccacc.vercel.app"}/login" 
             style="background: #994D35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login Now
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #777; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from ACC Career Club. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
};

// app/lib/mailsystem.js - Updated sendNoticeEmail function

// Send notice email to all users with noticeMail enabled
export const sendNoticeEmail = async ({
  noticeTitle,
  noticeContent,
  noticeCategory,
  noticePriority,
  createdByName,
  createdByRole,
  noticeId,
  noticeImages,
  recipientEmails,
  recipientId,
}) => {
  const subject = `📢 New Notice: ${noticeTitle} - ACC Career Club`;

  // Format category for display
  const categoryLabels = {
    general: "General",
    academic: "Academic",
    event: "Event",
    career: "Career",
    important: "Important",
    club: "Club",
  };

  const categoryEmojis = {
    general: "📌",
    academic: "📚",
    event: "🎪",
    career: "💼",
    important: "⭐",
    club: "🏛️",
  };

  // Get role display name
  const roleDisplay = {
    prefect: "Prefect",
    itsecretary: "IT Secretary",
    modarator: "Moderator",
  };

  const roleDisplayName = roleDisplay[createdByRole] || createdByRole;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
      <title>New Notice</title>
      <style>
        /* Reset styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f0f0f0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        /* Main container */
        .container {
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, #3D444C, #994D35);
          padding: 32px 24px;
          text-align: center;
        }
        
        .header h1 {
          color: #E7E3D8;
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .header p {
          color: #D3A16D;
          margin: 8px 0 0 0;
          font-size: 15px;
          font-weight: 400;
        }
        
        /* Content */
        .content {
          padding: 30px 24px 32px;
        }
        
        /* Notice Title */
        .notice-title {
          color: #3D444C;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 16px 0;
          line-height: 1.3;
          text-align: center;
        }
        
        /* Meta info - Author and Category */
        .notice-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 10px 14px;
          margin: 0 0 24px 0;
          padding: 14px 0;
          border-top: 2px solid #f0f0f0;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7280;
          white-space: nowrap;
        }
        
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #E7E3D8;
          color: #3D444C;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .author-info {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #4B5563;
          font-size: 13px;
        }
        
        .author-info .name {
          color: #3D444C;
          font-weight: 600;
        }
        
        .author-info .role {
          color: #994D35;
          font-size: 11px;
          font-weight: 500;
          background: #FEF3C7;
          padding: 2px 8px;
          border-radius: 12px;
          margin-left: 2px;
        }
        
        /* Divider */
        .divider {
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #D3A16D, #994D35);
          margin: 0 auto 20px auto;
          border-radius: 2px;
        }
        
        /* Notice Content */
        .notice-content {
          color: #4B5563;
          line-height: 1.9;
          margin: 0 0 28px 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 15px;
          text-align: left;
        }
        
        /* Images Grid */
        .notice-images {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          margin: 0 0 28px 0;
        }
        
        .notice-images .image-wrapper {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: #f3f4f6;
          aspect-ratio: 4/3;
        }
        
        .notice-images img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        
        .notice-images .more-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 10px;
          aspect-ratio: 4/3;
          color: #6B7280;
          font-weight: 600;
          font-size: 14px;
          border: 2px dashed #d1d5db;
        }
        
        /* Buttons */
        .button-container {
          text-align: center;
          margin: 28px 0 24px 0;
        }
        
        .view-button {
          display: inline-block;
          background: #994D35;
          color: #ffffff !important;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.3s ease;
          text-align: center;
          box-shadow: 0 4px 12px rgba(153, 77, 53, 0.25);
          letter-spacing: 0.3px;
        }
        
        .view-button:hover {
          background: #3D444C;
          box-shadow: 0 4px 16px rgba(61, 68, 76, 0.3);
        }
        
        /* Notice Footer Note */
        .notice-footer {
          background: #F9FAFB;
          border-radius: 10px;
          padding: 16px 20px;
          margin: 24px 0 0 0;
          border-left: 4px solid #D3A16D;
        }
        
        .notice-footer p {
          margin: 0;
          color: #6B7280;
          font-size: 13px;
          line-height: 1.6;
        }
        
        .notice-footer a {
          color: #994D35;
          text-decoration: underline;
          font-weight: 500;
        }
        
        /* Main Footer */
        .footer {
          text-align: center;
          padding: 20px 0 0 0;
          border-top: 1px solid #E5E7EB;
          margin-top: 28px;
        }
        
        .footer p {
          color: #9CA3AF;
          font-size: 11px;
          margin: 4px 0;
          line-height: 1.5;
        }
        
        .footer .club-name {
          color: #6B7280;
          font-weight: 500;
        }
        
        /* ========================================
                   MOBILE RESPONSIVE STYLES
                   ======================================== */
        @media only screen and (max-width: 600px) {
          .container {
            border-radius: 0;
            margin: 0 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          }
          
          .header {
            padding: 28px 16px;
          }
          
          .header h1 {
            font-size: 22px;
          }
          
          .header p {
            font-size: 13px;
          }
          
          .content {
            padding: 20px 16px 24px;
          }
          
          .notice-title {
            font-size: 20px;
            text-align: center;
          }
          
          /* Mobile: Stack meta items vertically, center aligned */
          .notice-meta {
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 12px 0;
            border-top-width: 2px;
            border-bottom-width: 2px;
          }
          
          .meta-item {
            font-size: 12px;
            white-space: normal;
          }
          
          .category-badge {
            font-size: 11px;
            padding: 3px 12px;
          }
          
          .author-info {
            font-size: 12px;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .author-info .role {
            font-size: 10px;
          }
          
          /* Center align content on mobile */
          .notice-content {
            font-size: 14px;
            line-height: 1.8;
            text-align: left;
            padding: 0 2px;
          }
          
          .divider {
            width: 40px;
            margin: 0 auto 16px auto;
          }
          
          .notice-images {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          
          .notice-images .image-wrapper {
            aspect-ratio: 4/3;
            border-radius: 8px;
          }
          
          .notice-images .more-overlay {
            border-radius: 8px;
            font-size: 12px;
          }
          
          .view-button {
            display: block;
            padding: 13px 20px;
            font-size: 15px;
            border-radius: 8px;
          }
          
          .notice-footer {
            padding: 12px 14px;
            border-left-width: 3px;
          }
          
          .notice-footer p {
            font-size: 12px;
          }
        }
        
        @media only screen and (max-width: 400px) {
          .container {
            margin: 0 4px;
          }
          
          .header {
            padding: 20px 12px;
          }
          
          .header h1 {
            font-size: 18px;
          }
          
          .header p {
            font-size: 12px;
          }
          
          .content {
            padding: 16px 12px 20px;
          }
          
          .notice-title {
            font-size: 17px;
          }
          
          .notice-images {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          
          .meta-item {
            font-size: 11px;
          }
          
          .notice-content {
            font-size: 13px;
          }
          
          .view-button {
            font-size: 14px;
            padding: 11px 16px;
          }
        }
        
        /* Outlook and older clients */
        .ReadMsgBody {
          width: 100%;
        }
        .ExternalClass {
          width: 100%;
        }
        
        /* Fix for Gmail app */
        u + .body .container {
          width: 100% !important;
        }
        
        /* Ensure images are responsive in all clients */
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;padding:16px 8px;">
        <tr>
          <td align="center" style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg, #3D444C, #994D35);padding:32px 24px;text-align:center;">
                  <h1 style="color:#E7E3D8;margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">📢 ACC Career Club</h1>
                  <p style="color:#D3A16D;margin:8px 0 0 0;font-size:15px;font-weight:400;">Adamjee Cantonment College</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding:30px 24px 32px;">
                  <!-- Title -->
                  <h2 style="color:#3D444C;font-size:24px;font-weight:700;margin:0 0 16px 0;line-height:1.3;text-align:center;">${noticeTitle}</h2>
                  
                  <!-- Divider -->
                  <div style="width:60px;height:3px;background:linear-gradient(90deg, #D3A16D, #994D35);margin:0 auto 20px auto;border-radius:2px;"></div>
                  
                  <!-- Meta: Author and Category -->
                  <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px 14px;margin:0 0 24px 0;padding:14px 0;border-top:2px solid #f0f0f0;border-bottom:2px solid #f0f0f0;">
                    <span style="display:inline-flex;align-items:center;gap:4px;background:#E7E3D8;color:#3D444C;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;">
                      ${categoryEmojis[noticeCategory] || "📌"} ${categoryLabels[noticeCategory] || noticeCategory}
                    </span>
                    <span style="display:inline-flex;align-items:center;gap:4px;color:#4B5563;font-size:13px;flex-wrap:wrap;justify-content:center;">
                      👤 <span style="color:#3D444C;font-weight:600;">${createdByName}</span>
                      <span style="color:#994D35;font-size:11px;font-weight:500;background:#FEF3C7;padding:2px 8px;border-radius:12px;">${roleDisplayName}</span>
                    </span>
                  </div>
                  
                  <!-- Content -->
                  <div style="color:#4B5563;line-height:1.9;margin:0 0 28px 0;white-space:pre-wrap;word-wrap:break-word;font-size:15px;text-align:left;">
                    ${noticeContent}
                  </div>
                  
                  <!-- Images -->
                  ${
                    noticeImages && noticeImages.length > 0
                      ? `
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:10px;margin:0 0 28px 0;">
                      ${noticeImages
                        .slice(0, 4)
                        .map(
                          (img) => `
                        <div style="position:relative;border-radius:10px;overflow:hidden;background:#f3f4f6;aspect-ratio:4/3;">
                          <img src="${img.url}" alt="Notice image" style="width:100%;height:100%;object-fit:cover;display:block;" />
                        </div>
                      `,
                        )
                        .join("")}
                      ${
                        noticeImages.length > 4
                          ? `
                        <div style="display:flex;align-items:center;justify-content:center;background:#f3f4f6;border-radius:10px;aspect-ratio:4/3;color:#6B7280;font-weight:600;font-size:14px;border:2px dashed #d1d5db;">
                          +${noticeImages.length - 4} more
                        </div>
                      `
                          : ""
                      }
                    </div>
                  `
                      : ""
                  }
                  
                  <!-- Buttons -->
                  <div style="text-align:center;margin:28px 0 24px 0;">
                    <a href="${process.env.NEXTAUTH_URL || "https://ccacc.vercel.app"}/all-notice" style="display:inline-block;background:#994D35;color:#ffffff !important;padding:14px 40px;text-decoration:none;border-radius:10px;font-weight:600;font-size:16px;text-align:center;box-shadow:0 4px 12px rgba(153,77,53,0.25);letter-spacing:0.3px;">
                      View All Notices
                    </a>
                  </div>
                  
                  <!-- Footer Note -->
                  <div style="background:#F9FAFB;border-radius:10px;padding:16px 20px;margin:24px 0 0 0;border-left:4px solid #D3A16D;">
                    <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.6;">
                      💡 You're receiving this email because you have <strong>Notice Mail</strong> enabled. 
                      <a href="${process.env.NEXTAUTH_URL || "https://ccacc.vercel.app"}/settings/${recipientId}" style="color:#994D35;text-decoration:underline;font-weight:500;">Manage preferences</a>
                    </p>
                  </div>
                  
                  <!-- Footer -->
                  <div style="text-align:center;padding:20px 0 0 0;border-top:1px solid #E5E7EB;margin-top:28px;">
                    <p style="color:#9CA3AF;font-size:11px;margin:4px 0;line-height:1.5;">
                      This is an automated message from ACC Career Club.
                    </p>
                    <p style="color:#9CA3AF;font-size:11px;margin:4px 0;line-height:1.5;">
                      © ${new Date().getFullYear()} ACC Career Club - Adamjee Cantonment College
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send email to all recipients (batch sending)
  // Split into chunks of 50 to avoid email provider limits
  const chunkSize = 50;
  const results = [];

  for (let i = 0; i < recipientEmails.length; i += chunkSize) {
    const chunk = recipientEmails.slice(i, i + chunkSize);
    const result = await sendEmail({
      to: chunk,
      subject,
      html,
    });
    results.push(result);
  }

  // Check if all chunks were successful
  const allSuccess = results.every((r) => r.success);

  return {
    success: allSuccess,
    totalRecipients: recipientEmails.length,
    results,
  };
};

// ==========================================
// Send "Welcome to Alumni" email
// ==========================================
export const sendAlumniWelcomeEmail = async ({
  fullName,
  email,
  batch,
  passedYear,
  currentJobCompany,
  currentDesignation,
  isUnemployed,
}) => {
  const subject = `🎓 Welcome to ACC Career Club Alumni Network!`;

  // Build job-info block
  let jobInfoHTML = "";
  if (isUnemployed) {
    jobInfoHTML = `
      <div style="background: #F3F4F6; border-radius: 8px; padding: 16px 20px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; color: #4B5563; font-size: 14px;">
          <strong style="color: #3D444C;">Current Status:</strong> 
          <span style="color: #6B7280;">Currently seeking opportunities</span>
        </p>
      </div>
    `;
  } else if (currentJobCompany || currentDesignation) {
    jobInfoHTML = `
      <div style="background: #F3F4F6; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <p style="margin: 0 0 6px 0; color: #3D444C; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
          Current Professional Role
        </p>
        ${
          currentDesignation
            ? `<p style="margin: 4px 0; color: #4B5563; font-size: 14px;"><strong style="color: #994D35;">💼 Designation:</strong> ${currentDesignation}</p>`
            : ""
        }
        ${
          currentJobCompany
            ? `<p style="margin: 4px 0; color: #4B5563; font-size: 14px;"><strong style="color: #994D35;">🏢 Company:</strong> ${currentJobCompany}</p>`
            : ""
        }
      </div>
    `;
  }

  // Build batch/passed-year block
  let batchInfoHTML = "";
  if (batch || passedYear) {
    batchInfoHTML = `
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
        ${
          batch
            ? `<div style="flex: 1; min-width: 140px; background: #E7E3D8; border-radius: 8px; padding: 12px 16px; text-align: center;">
                 <p style="margin: 0; color: #6B7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Batch</p>
                 <p style="margin: 4px 0 0 0; color: #3D444C; font-size: 20px; font-weight: 800;">${batch}</p>
               </div>`
            : ""
        }
        ${
          passedYear
            ? `<div style="flex: 1; min-width: 140px; background: #E7E3D8; border-radius: 8px; padding: 12px 16px; text-align: center;">
                 <p style="margin: 0; color: #6B7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Passed Year</p>
                 <p style="margin: 4px 0 0 0; color: #3D444C; font-size: 20px; font-weight: 800;">${passedYear}</p>
               </div>`
            : ""
        }
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Alumni Network</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;padding:16px 8px;">
        <tr>
          <td align="center" style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg, #3D444C, #994D35);padding:36px 24px;text-align:center;">
                  <div style="font-size:48px;line-height:1;margin-bottom:8px;">🎓</div>
                  <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">Welcome to the Alumni Network</h1>
                  <p style="color:#ffffff;margin:8px 0 0 0;font-size:14px;font-weight:400;">ACC Career Club • Adamjee Cantonment College</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 24px 24px;">
                  <p style="margin:0 0 16px 0;color:#3D444C;font-size:20px;font-weight:700;">
                    Dear ${fullName},
                  </p>

                  <p style="margin:0 0 16px 0;color:#4B5563;font-size:15px;line-height:1.8;">
                    We are delighted to inform you that you have been officially inducted into the
                    <strong style="color:#994D35;">ACC Career Club Alumni Network</strong>. 🎉
                  </p>

                  <p style="margin:0 0 16px 0;color:#4B5563;font-size:15px;line-height:1.8;">
                    It has been a wonderful journey watching you grow, learn, and contribute to our community.
                    We are incredibly proud of everything you've achieved and are excited to see where your
                    professional path takes you next.
                  </p>

                  <!-- Divider -->
                  <div style="width:60px;height:3px;background:linear-gradient(90deg,#D3A16D,#994D35);margin:24px auto;border-radius:2px;"></div>

                  <!-- Alumni Details -->
                  ${batchInfoHTML}
                  ${jobInfoHTML}

                  <!-- Important Notice -->
                  <div style="background:#FFF3CD;border-left:4px solid #F59E0B;border-radius:8px;padding:16px 20px;margin:24px 0;">
                    <p style="margin:0;color:#856404;font-size:14px;line-height:1.6;">
                      <strong>🔒 Important:</strong> Your student account on the ACC Career Club platform
                      has been <strong>deactivated</strong> as part of your transition to alumni status.
                      You will no longer be able to log in with your previous student credentials.
                    </p>
                  </div>

                  <!-- Thank You Message -->
                  <div style="background:linear-gradient(135deg, #F9FAFB, #E7E3D8);border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
                    <p style="margin:0 0 12px 0;color:#994D35;font-size:32px;line-height:1;">💛</p>
                    <p style="margin:0 0 8px 0;color:#3D444C;font-size:17px;font-weight:700;">
                      Thank You for Being Part of Our Story
                    </p>
                    <p style="margin:0;color:#4B5563;font-size:14px;line-height:1.7;">
                      Your contributions, memories, and moments with ACC Career Club have helped shape
                      what our community is today. We are forever grateful for your time, dedication,
                      and spirit.
                    </p>
                  </div>

                  <!-- Wishes -->
                  <p style="margin:24px 0 16px 0;color:#4B5563;font-size:15px;line-height:1.8;">
                    As you step forward into the next chapter of your professional life, we wish you
                    boundless success, meaningful achievements, and unforgettable experiences.
                    May every opportunity you pursue bring you closer to your dreams.
                  </p>

                  <p style="margin:0 0 24px 0;color:#4B5563;font-size:15px;line-height:1.8;">
                    Remember — you will always be a cherished part of ACC Career Club. Our doors
                    remain open, and we hope to stay connected with you in the years to come. 🌟
                  </p>

                  <!-- Signature -->
                  <div style="border-top:1px solid #E5E7EB;padding-top:20px;margin-top:8px;">
                    <p style="margin:0 0 4px 0;color:#6B7280;font-size:14px;">
                      With warm regards and best wishes,
                    </p>
                    <p style="margin:8px 0 0 0;color:#3D444C;font-size:15px;font-weight:700;">
                      ACC Career Club Family
                    </p>
                    <p style="margin:2px 0 0 0;color:#994D35;font-size:13px;font-weight:500;">
                      Adamjee Cantonment College
                    </p>
                  </div>

                  <!-- Footer -->
                  <div style="text-align:center;padding:24px 0 0 0;border-top:1px solid #E5E7EB;margin-top:28px;">
                    <p style="color:#9CA3AF;font-size:11px;margin:4px 0;line-height:1.5;">
                      This is an automated message from ACC Career Club.
                    </p>
                    <p style="color:#9CA3AF;font-size:11px;margin:4px 0;line-height:1.5;">
                      © ${new Date().getFullYear()} ACC Career Club - Adamjee Cantonment College
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
};


// ==========================================
// Send feedback request email after a session is completed
// ==========================================
export const sendFeedbackRequestEmail = async ({
  fullName,
  email,
  sessionTitle,
  sessionId,
  sessionDate,
}) => {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const feedbackUrl = `${baseUrl}/sessions/${sessionId}`;

  const subject = `⭐ Share Your Feedback: ${sessionTitle}`;

  // Format date nicely
  const formattedDate = sessionDate
    ? new Date(sessionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Share Your Feedback</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f0f0f0;
          -webkit-text-size-adjust: 100%;
        }
        @media only screen and (max-width: 600px) {
          .container { border-radius: 0 !important; margin: 0 8px !important; }
          .header { padding: 24px 16px !important; }
          .header h1 { font-size: 20px !important; }
          .content { padding: 20px 16px 24px !important; }
          .session-box { padding: 16px !important; }
          .btn { display: block !important; padding: 13px 20px !important; font-size: 15px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f0f0f0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;padding:16px 8px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg, #3D444C, #994D35);padding:32px 24px;text-align:center;">
                  <div style="font-size:44px;line-height:1;margin-bottom:8px;">⭐</div>
                  <h1 style="color:#E7E3D8;margin:0;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                    Your Feedback Matters
                  </h1>
                  <p style="color:#D3A16D;margin:8px 0 0 0;font-size:14px;">
                    ACC Career Club • Adamjee Cantonment College
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:30px 24px 32px;">
                  <p style="color:#3D444C;font-size:18px;font-weight:700;margin:0 0 14px 0;">
                    Dear ${fullName},
                  </p>

                  <p style="color:#4B5563;font-size:15px;line-height:1.8;margin:0 0 16px 0;">
                    Thank you for attending the recent session. We hope you found it valuable and
                    gained insights you can apply to your journey!
                  </p>

                  <p style="color:#4B5563;font-size:15px;line-height:1.8;margin:0 0 24px 0;">
                    Your thoughts are incredibly important to us — they help us improve future sessions
                    and make sure we're delivering the best experience possible for all club members.
                  </p>

                  <!-- Session Info Box -->
                  <div style="background:#E7E3D8;border-left:4px solid #D3A16D;border-radius:10px;padding:20px;margin:0 0 24px 0;">
                    <p style="color:#6B7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px 0;">
                      Session Details
                    </p>
                    <p style="color:#3D444C;font-size:17px;font-weight:700;margin:0 0 8px 0;line-height:1.4;">
                      ${sessionTitle}
                    </p>
                    ${
                      formattedDate
                        ? `<p style="color:#6B7280;font-size:13px;margin:0;">📅 ${formattedDate}</p>`
                        : ""
                    }
                  </div>

                  <!-- CTA Box -->
                  <div style="background:linear-gradient(135deg, #F9FAFB, #E7E3D8);border-radius:12px;padding:24px;margin:0 0 24px 0;text-align:center;">
                    <p style="color:#994D35;font-size:32px;line-height:1;margin:0 0 10px 0;">
                      💬
                    </p>
                    <p style="color:#3D444C;font-size:16px;font-weight:700;margin:0 0 6px 0;">
                      Takes Less Than 30 Seconds
                    </p>
                    <p style="color:#4B5563;font-size:14px;line-height:1.6;margin:0 0 18px 0;">
                      Rate the session and share your honest thoughts. Every response helps us grow!
                    </p>
                    <a href="${feedbackUrl}" 
                       style="display:inline-block;background:#994D35;color:#ffffff;padding:14px 40px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(153,77,53,0.3);">
                      Give Feedback →
                    </a>
                  </div>

                  <p style="color:#6B7280;font-size:13px;line-height:1.7;margin:0 0 16px 0;text-align:center;">
                    If the button above doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="color:#994D35;font-size:12px;text-align:center;word-break:break-all;margin:0 0 24px 0;">
                    <a href="${feedbackUrl}" style="color:#994D35;text-decoration:underline;">${feedbackUrl}</a>
                  </p>

                  <p style="color:#4B5563;font-size:14px;line-height:1.8;margin:0 0 8px 0;">
                    Thank you for being a valued member of our community.
                  </p>
                  <p style="color:#3D444C;font-size:14px;font-weight:600;margin:8px 0 0 0;">
                    — ACC Career Club Team
                  </p>

                  <!-- Footer -->
                  <div style="text-align:center;padding:24px 0 0 0;border-top:1px solid #E5E7EB;margin-top:24px;">
                    <p style="color:#9CA3AF;font-size:11px;margin:4px 0;line-height:1.5;">
                      This is an automated message from ACC Career Club.
                    </p>
                    <p style="color:#9CA3AF;font-size:11px;margin:4px 0;line-height:1.5;">
                      © ${new Date().getFullYear()} ACC Career Club - Adamjee Cantonment College
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
  });
};