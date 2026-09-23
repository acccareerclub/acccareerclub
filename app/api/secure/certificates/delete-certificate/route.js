// app/api/secure/certificates/delete-certificate/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import Certificate from "../../../../models/Certificate";
import User from "../../../../models/User";
import { getCurrentUser } from "../../../../lib/authUtils";

export async function POST(request) {
  try {
    // ==========================================
    // 1. AUTH
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
    // 2. PARSE BODY
    // ==========================================
    const body = await request.json();
    const { ids, batchId, eventId } = body;

    // ==========================================
    // 3. FIND CERTIFICATES TO DELETE FIRST
    // ==========================================
    let query = null;
    if (Array.isArray(ids) && ids.length > 0) {
      query = { _id: { $in: ids } };
    } else if (batchId) {
      query = { batchId };
    } else if (eventId) {
      query = { "event.eventId": eventId };
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Provide ids[], batchId, or eventId to delete",
        },
        { status: 400 },
      );
    }

    const certsToDelete = await Certificate.find(
      query,
      "_id certificateId recipient.userId recipient.isClubMember",
    ).lean();

    if (certsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, message: "No certificates found to delete" },
        { status: 404 },
      );
    }

    // ==========================================
    // 4. DELETE CERTIFICATES
    // ==========================================
    const result = await Certificate.deleteMany(query);
    const deletedCount = result.deletedCount;

    // ==========================================
    // 5. REMOVE MATCHING ENTRIES FROM MEMBERS' PROFILES
    // $pull by the ObjectId stored in `certificate`
    // ==========================================
    let profilesCleaned = 0;
    const cleanupErrors = [];

    for (const c of certsToDelete) {
      const userId = c?.recipient?.userId;
      const isMember = c?.recipient?.isClubMember;
      const certObjectId = c?._id;

      if (!isMember || !userId || !certObjectId) continue;

      try {
        const updateResult = await User.updateOne(
          { _id: userId },
          {
            $pull: {
              // ✅ Match the array entry by ObjectId
              accCareerClubAchievements: { certificate: certObjectId },
            },
          },
        );
        if (updateResult.modifiedCount > 0) profilesCleaned++;
      } catch (err) {
        console.error(
          `Failed to clean achievement for user ${userId} / cert ${certObjectId}:`,
          err.message,
        );
        cleanupErrors.push({
          userId: String(userId),
          certificateObjectId: String(certObjectId),
          certificateId: c?.certificateId,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount} certificate${
        deletedCount !== 1 ? "s" : ""
      } deleted successfully`,
      deletedCount,
      profilesCleaned,
      cleanupErrors: cleanupErrors.length > 0 ? cleanupErrors : undefined,
    });
  } catch (error) {
    console.error("Delete certificate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete certificate(s)" },
      { status: 500 },
    );
  }
}