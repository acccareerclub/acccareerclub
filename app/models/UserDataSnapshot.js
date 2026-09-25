// app/models/UserDataSnapshot.js
import mongoose from "mongoose";

/**
 * A UserDataSnapshot stores the "approved" copy of a user's trackable data.
 * Whenever an admin verifies a user (or creates one), we snapshot the
 * current User document. Any later diff between the live User and its
 * snapshot shows up in the admin review dashboard.
 *
 * Fields excluded from tracking:
 *   - password, sessionToken, role, isVerified, isActive, membershipId
 *   - accCareerClubAchievements (admin-managed)
 *   - _id, __v, createdAt, updatedAt
 */
const UserDataSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // Which fields we track. This object mirrors the User schema
    // shape (subset) — the exact same nested structure so diffing
    // is straightforward.
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // When the snapshot was last refreshed (i.e. last time admin
    // approved the current data).
    approvedAt: {
      type: Date,
      default: Date.now,
    },

    // Who approved it (User._id of the admin).
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

console.log("✅ UserDataSnapshot schema created");

const UserDataSnapshot =
  mongoose.models.UserDataSnapshot ||
  mongoose.model("UserDataSnapshot", UserDataSnapshotSchema);

export default UserDataSnapshot;