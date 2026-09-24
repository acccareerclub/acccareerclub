// app/lib/membershipId.js
import User from "@/app/models/User";

/**
 * Build the list of ALL existing membershipIds for a given year prefix,
 * returning numeric serials. We only care about the numeric part.
 *
 * @param {string} yearPrefix - "26"
 * @returns {Promise<Set<number>>} set of used serials
 */
export async function getUsedSerials(yearPrefix) {
  const regex = new RegExp(`^${yearPrefix}\\d+$`);
  const docs = await User.find({ membershipId: { $regex: regex } })
    .select("membershipId")
    .lean();

  const used = new Set();
  for (const d of docs) {
    const raw = String(d.membershipId || "");
    // Take everything after the year prefix
    const serialPart = raw.slice(yearPrefix.length);
    const n = parseInt(serialPart, 10);
    if (Number.isFinite(n) && n > 0) used.add(n);
  }
  return used;
}

/**
 * Find the first free serial for the given year.
 * - Starts from 1
 * - Returns the smallest unused integer (fills gaps)
 * - Pads to 4 digits
 *
 * @param {string} yearPrefix - "26"
 * @returns {Promise<string>} the full membershipId, e.g. "260006"
 */
export async function computeNextMembershipId(yearPrefix) {
  const used = await getUsedSerials(yearPrefix);
  let n = 1;
  while (used.has(n)) n += 1;
  return `${yearPrefix}${String(n).padStart(4, "0")}`;
}

/**
 * Atomically assign a fresh membershipId to a user.
 * Uses a retry loop to survive race conditions when two admins add users
 * at the same time.
 *
 * @param {string} userId - the Mongo _id of the user
 * @param {object} [opts]
 * @param {number} [opts.maxRetries=6]
 * @returns {Promise<{ success: boolean, membershipId?: string, error?: string }>}
 */
export async function assignMembershipId(userId, opts = {}) {
  const { maxRetries = 6 } = opts;
  const yearPrefix = String(new Date().getFullYear()).slice(-2);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const candidate = await computeNextMembershipId(yearPrefix);

      // Atomically set the ID ONLY if the user still has no membershipId.
      // This prevents double-assigning on concurrent calls for the same user.
      const updated = await User.findOneAndUpdate(
        { _id: userId, $or: [{ membershipId: "" }, { membershipId: null }, { membershipId: { $exists: false } }] },
        { $set: { membershipId: candidate } },
        { new: true }
      ).lean();

      if (updated) {
        return { success: true, membershipId: updated.membershipId };
      }

      // Either the user doesn't exist, or already has a membershipId.
      const existing = await User.findById(userId).select("membershipId").lean();
      if (!existing) return { success: false, error: "User not found" };
      if (existing.membershipId) {
        return { success: true, membershipId: existing.membershipId };
      }

      // Otherwise, loop and try again (another concurrent call took the slot)
    } catch (err) {
      // Duplicate key error (if you add a unique index) — retry
      if (err?.code === 11000) continue;
      console.error("[assignMembershipId] error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: "Could not allocate a unique membership ID" };
}