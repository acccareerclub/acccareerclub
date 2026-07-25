// app/lib/mailsystem.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // For Gmail with App Password
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  // For other SMTP services
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
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
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback to plain text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('Error details:', error);
    return { success: false, error: error.message };
  }
};

// Send verification request email to prefects and IT secretaries
export const sendVerificationRequestToPrefects = async (userData, adminEmails) => {
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
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/verify-users" 
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
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
             style="background: #994D35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
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