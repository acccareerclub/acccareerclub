// app/api/users/certificates/verify-certificate/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import Certificate from "../../../../../models/Certificate";
import User from "../../../../../models/User";

const ROLE_LABELS = {
  prefect: "Prefect",
  assistant_prefect: "Assistant Prefect",
  itsecretary: "IT Secretary",
  modarator: "Moderator",
};

const getVerificationContacts = async () => {
  const roles = [
    "prefect",
    "assistant_prefect",
    "itsecretary",
  ];

  const contacts = await User.find(
    { role: { $in: roles }, isActive: true },
    "fullName email phone role executiveBranch",
  )
    .sort({ role: 1, fullName: 1 })
    .lean();

  // De-dupe by email (in case both `modarator` and `moderator` exist)
  const seen = new Set();
  const cleaned = [];
  for (const c of contacts) {
    const key = (c.email || c.phone || c.fullName || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    cleaned.push({
      fullName: c.fullName,
      email: c.email || "",
      phone: c.phone || "",
      role: c.role,
      roleLabel: ROLE_LABELS[c.role] || c.role,
      executiveBranch: c.executiveBranch || "",
    });
  }
  return cleaned;
};

export async function GET(request, { params }) {
  try {
    const { certificateId } = await params;

    if (!certificateId) {
      return NextResponse.json(
        { success: false, message: "Certificate ID is required" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    // Fetch contacts even if the cert isn't found — so users can
    // still reach a human for manual verification.
    const contacts = await getVerificationContacts();

    const cert = await Certificate.findOne({ certificateId, published: true, }).lean();

    if (!cert) {
      return NextResponse.json({
        success: false,
        verified: false,
        message: "Certificate ID not found in our records.",
        contacts,
      });
    }

    // ==========================================
    // SANITIZE — strip internal ObjectIds and other
    // private bits that shouldn't leak publicly.
    // ==========================================
    const safe = {
      certificateId: cert.certificateId,
      certificateType: cert.certificateType,
      title: cert.title,
      description: cert.description || "",
      achievementTitle: cert.achievementTitle || "",
      achievementPosition: cert.achievementPosition || "",

      recipient: {
        fullName: cert.recipient?.fullName || "",
        isClubMember: !!cert.recipient?.isClubMember,
        studentId: cert.recipient?.studentId || "",
        // Never expose email/phone publicly
        institution: cert.recipient?.externalOrganization || "",
        identificationNo: cert.recipient?.externalId || "",
      },

      event: cert.event?.eventName
        ? {
            eventName: cert.event.eventName,
            eventType: cert.event.eventType || "",
            eventDate: cert.event.eventDate || null,
            eventLocation: cert.event.eventLocation || "",
          }
        : null,

      issuedBy: {
        fullName: cert.issuedBy?.fullName || "",
        role: cert.issuedBy?.role || "",
        designation: cert.issuedBy?.designation || "",
      },

      signatureType: cert.signatureType || "system_generated",

      // Timestamps
      createdAt: cert.createdAt,
      generatedAt: cert.generatedAt || cert.createdAt,
    };

    return NextResponse.json({
      success: true,
      verified: true,
      certificate: safe,
      contacts,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: "Verification service is temporarily unavailable.",
      },
      { status: 500 },
    );
  }
}
