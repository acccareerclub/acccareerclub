// app/api/secure/certificates/send-certificate-mail/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";
import { getCurrentUser } from "../../../../lib/authUtils";
import { sendCertificateEmail } from "../../../../lib/mailsystem";

export async function POST(request) {
  try {
    // ==========================================
    // AUTH
    // ==========================================
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const decoded = getCurrentUser(token);
    const allowedRoles = [
      "prefect",
      "itsecretary",
      "modarator",
      "assistant_prefect",
    ];
    if (!decoded || !allowedRoles.includes(decoded.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectToDatabase();

    // ==========================================
    // PARSE
    // ==========================================
    const body = await request.json();
    const { certificateId } = body;

    if (!certificateId) {
      return NextResponse.json(
        { success: false, message: "certificateId is required" },
        { status: 400 },
      );
    }

    // ==========================================
    // FIND CERTIFICATE
    // ==========================================
    const cert = await Certificate.findOne({ certificateId });
    if (!cert) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 },
      );
    }

    // ==========================================
    // VALIDATE RECIPIENT EMAIL
    // ==========================================
    const recipientEmail = cert.recipient?.email;
    if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This certificate has no valid recipient email on file. Update the certificate first.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // SEND EMAIL
    // ==========================================
    const result = await sendCertificateEmail({
      recipientName: cert.recipient.fullName,
      recipientEmail,
      recipientUserId: cert.recipient.userId || null,
      isClubMember: !!cert.recipient.isClubMember,
      certificateId: cert.certificateId,
      certificateTitle: cert.title,
      certificateType: cert.certificateType,
      eventName: cert.event?.eventName || "",
      eventDate: cert.event?.eventDate || null,
      achievementTitle: cert.achievementTitle || "",
      achievementPosition: cert.achievementPosition || "",
      issuedByName: cert.issuedBy?.fullName || "",
      issuedByDesignation: cert.issuedBy?.designation || "",
    });

    if (!result.success) {
      console.error("Certificate email send failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to send email",
        },
        { status: 500 },
      );
    }

    // ==========================================
    // MARK AS SENT
    // ==========================================
    cert.emailSent = true;
    cert.emailSentAt = new Date();
    await cert.save();

    return NextResponse.json({
      success: true,
      message: `Certificate email sent to ${recipientEmail}`,
      emailSentAt: cert.emailSentAt,
    });
  } catch (error) {
    console.error("Send certificate mail error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send certificate email" },
      { status: 500 },
    );
  }
}