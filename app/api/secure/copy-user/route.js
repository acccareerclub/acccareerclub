// app/api/secure/copy-user/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import User from "../../../models/User";
import UserDataSnapshot from "../../../models/UserDataSnapshot";
import { getCurrentUser } from "../../../lib/authUtils";
import {
  pickTrackedData,
  computePendingChanges,
  TRACKED_PATHS,
} from "../../../lib/userSnapshot";

/* -------------------- helpers -------------------- */

async function requireAdmin(request) {
  const token =
    request.cookies.get("auth_token")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) return { ok: false, status: 401, msg: "Not authenticated" };

  const decoded = getCurrentUser(token);
  if (!decoded) return { ok: false, status: 401, msg: "Invalid token" };

  const allowedRoles = [
    "prefect",
    "itsecretary",
    "modarator",
    "assistant_prefect",
  ];
  if (!allowedRoles.includes(decoded.role))
    return { ok: false, status: 403, msg: "Unauthorized" };

  return { ok: true, decoded };
}

/** Set a value at a dotted path in an object (creates intermediate objects). */
function setPath(obj, path, value) {
  // "a.b[0].c"  →  ["a", "b", "0", "c"]
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] === null) {
      cur[p] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

/* -------------------- GET -------------------- */
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok)
      return NextResponse.json(
        { success: false, message: auth.msg },
        { status: auth.status },
      );

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    /* ---- single user detail ---- */
    if (userId) {
      const user = await User.findById(userId).select("-password -__v").lean();
      if (!user)
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 },
        );

      const snapDoc = await UserDataSnapshot.findOne({ user: userId }).lean();
      const approved = snapDoc?.snapshot || {};

      const changes = computePendingChanges(user, approved);

      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          studentId: user.studentId,
          department: user.department,
          role: user.role,
          membershipId: user.membershipId || "",
        },
        approved,
        live: pickTrackedData(user),
        changes,
        approvedAt: snapDoc?.approvedAt || null,
      });
    }

    /* ---- list users with pending changes ---- */

    // Fetch a reasonable chunk; compute change counts server-side.
    // (For very large user bases, consider precomputing a `hasChanges`
    // flag via a hook — but this works fine up to a few thousand users.)
    const users = await User.find({ role: { $ne: "alumni" } })
      .select(
        "fullName email studentId department role membershipId " +
          TRACKED_PATHS.map((p) => p).join(" "),
      )
      .lean();

    const snapshots = await UserDataSnapshot.find({
      user: { $in: users.map((u) => u._id) },
    }).lean();

    const snapMap = new Map(
      snapshots.map((s) => [String(s.user), s]),
    );

    const withChanges = [];
    for (const u of users) {
      const snap = snapMap.get(String(u._id));
      const approved = snap?.snapshot || {};
      const changes = computePendingChanges(u, approved);
      if (changes.length > 0) {
        withChanges.push({
          id: u._id,
          fullName: u.fullName,
          email: u.email,
          studentId: u.studentId,
          department: u.department,
          role: u.role,
          membershipId: u.membershipId || "",
          changeCount: changes.length,
          changedPaths: changes.map((c) => c.path),
          approvedAt: snap?.approvedAt || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      users: withChanges,
      total: withChanges.length,
    });
  } catch (error) {
    console.error("copy-user GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch changes" },
      { status: 500 },
    );
  }
}

/* -------------------- PATCH -------------------- */
/**
 * Body:
 *   { userId, paths: ["personalInfo.bio", "phone"] }   // accept specific paths
 *   { userId, acceptAll: true }                        // accept everything
 *   { userId, rejectAll: true }                        // ignore all (nothing changes)
 *
 * "Accept" = write the live value into the snapshot for those paths.
 * "Reject" = do nothing; the change keeps showing up until the user reverts
 *            or an admin accepts later. (Optional: implement hard-revert
 *            by copying snapshot value back to the User — not enabled here
 *            to avoid clobbering user edits silently.)
 */
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok)
      return NextResponse.json(
        { success: false, message: auth.msg },
        { status: auth.status },
      );

    await connectToDatabase();
    const body = await request.json();
    const { userId, paths, acceptAll } = body;

    if (!userId)
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );

    const user = await User.findById(userId).select("-password -__v").lean();
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    let snapDoc = await UserDataSnapshot.findOne({ user: userId });
    if (!snapDoc) {
      // No snapshot yet — create one from current state and stop.
      snapDoc = await UserDataSnapshot.create({
        user: userId,
        snapshot: pickTrackedData(user),
        approvedBy: auth.decoded.userId || auth.decoded.id,
      });
      return NextResponse.json({
        success: true,
        message: "Initial snapshot created.",
        snapshot: snapDoc.snapshot,
      });
    }

    const live = pickTrackedData(user);
    const next = JSON.parse(JSON.stringify(snapDoc.snapshot || {}));

    if (acceptAll) {
      for (const key of TRACKED_PATHS) {
        next[key] = live[key];
      }
    } else if (Array.isArray(paths) && paths.length > 0) {
  for (const path of paths) {
    // Top-level key is everything before the first dot or bracket
    // "personalInfo.bio"            → "personalInfo"
    // "experience.clubExperience[0]" → "experience"
    const root = path.split(/[.\[]/)[0];
    if (!TRACKED_PATHS.includes(root)) continue;

    // Walk the *bracket-aware* path to fetch the live value
    const parts = path
      .replace(/\[(\d+)\]/g, ".$1")
      .split(".")
      .filter(Boolean);

    let liveVal = live;
    for (const p of parts) {
      if (liveVal == null) break;
      liveVal = liveVal[p];
    }

    setPath(next, path, liveVal);
  }
}

    snapDoc.snapshot = next;
    snapDoc.approvedAt = new Date();
    snapDoc.approvedBy = auth.decoded.userId || auth.decoded.id;
    snapDoc.markModified("snapshot");
    await snapDoc.save();

    return NextResponse.json({
      success: true,
      message: "Changes approved.",
      snapshot: snapDoc.snapshot,
      approvedAt: snapDoc.approvedAt,
    });
  } catch (error) {
    console.error("copy-user PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update snapshot" },
      { status: 500 },
    );
  }
}