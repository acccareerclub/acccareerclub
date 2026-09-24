// app/api/public/certificates/[certificateId]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";

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

    // Select only public-safe fields. No `issuedBy.userId`, no `recipient.userId`.
 const cert = await Certificate.findOne({ certificateId, published: true }).lean();

    if (!cert) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 },
      );
    }

    // ==========================================
    // BLOCK: Member-owned certificates
    // ==========================================
    if (cert.recipient?.isClubMember && cert.recipient?.userId) {
      return NextResponse.json(
        {
          success: false,
          reason: "MEMBER_OWNED",
          message:
            "This certificate belongs to a club member. Please sign in to view it.",
        },
        { status: 403 },
      );
    }

    // ==========================================
    // SANITIZE: strip internal ObjectIds
    // ==========================================
    const safe = {
      ...cert,
      recipient: {
        ...cert.recipient,
        userId: undefined, // never expose
      },
      issuedBy: {
        fullName: cert.issuedBy?.fullName || "",
        role: cert.issuedBy?.role || "",
        designation: cert.issuedBy?.designation || "",
        // userId omitted
      },
    };

    return NextResponse.json({ success: true, certificate: safe });
  } catch (error) {
    console.error("Public certificate fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch certificate" },
      { status: 500 },
    );
  }
}
