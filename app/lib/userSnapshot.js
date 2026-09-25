// app/lib/userSnapshot.js
import UserDataSnapshot from "../models/UserDataSnapshot";

/**
 * Fields that ARE tracked (i.e. user-driven and worth preserving).
 * Anything not listed here is ignored by the diff logic.
 */
export const TRACKED_PATHS = [
  "fullName",
  "phone",
  "department",
  "personalInfo",
  "guardianInfo",
  "academicInfo",
  "skills",
  "interests",
  "customSkills",
  "customInterests",
  "experience",
  "achievements",
  "careerClubInfo",
  "declaration",
];

/** Deep-clone just the tracked fields from a user doc. */
export function pickTrackedData(user) {
  const out = {};
  for (const key of TRACKED_PATHS) {
    out[key] = user[key] === undefined ? null : user[key];
  }
  return JSON.parse(JSON.stringify(out)); // detach from mongoose doc
}

/**
 * Create or refresh the snapshot for a user.
 * Called after verify / create.
 */
export async function upsertSnapshot(userId, approvedBy = null) {
  const User = (await import("../models/User")).default;
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found for snapshot");

  const data = pickTrackedData(user);

  await UserDataSnapshot.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      snapshot: data,
      approvedAt: new Date(),
      approvedBy: approvedBy || null,
    },
    { upsert: true, new: true },
  );

  return data;
}

/* ------------------------------------------------------------------ */
/* Deep-diff helpers                                                   */
/* ------------------------------------------------------------------ */

const isPlainObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const isArray = (v) => Array.isArray(v);

/** Value equality — deep for objects/arrays. */
export function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a === b;

  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++)
      if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) if (!deepEqual(a[k], b[k])) return false;
    return true;
  }
  return false;
}

/* ---------------- diffPaths (v2 — array-aware) ---------------- */
export function diffPaths(oldObj, newObj, prefix = "") {
  const changes = [];

  const oldIsObj = isPlainObject(oldObj);
  const newIsObj = isPlainObject(newObj);
  const oldIsArr = isArray(oldObj);
  const newIsArr = isArray(newObj);

  /* ---------- Arrays ---------- */
  if (oldIsArr || newIsArr) {
    // type mismatch (array vs non-array)
    if (oldIsArr !== newIsArr) {
      if (!deepEqual(oldObj, newObj)) {
        changes.push({
          path: prefix,
          oldValue: oldObj ?? null,
          newValue: newObj ?? null,
        });
      }
      return changes;
    }

    // both arrays — walk element-wise
    const oldA = oldObj || [];
    const newA = newObj || [];
    const maxLen = Math.max(oldA.length, newA.length);

    for (let i = 0; i < maxLen; i++) {
      const oldItem = oldA[i];
      const newItem = newA[i];
      const childPath = `${prefix}[${i}]`;

      // If item missing in either side, record as an add/remove
      if (oldItem === undefined) {
        changes.push({
          path: childPath,
          oldValue: null,
          newValue: newItem,
          isAdd: true,
        });
        continue;
      }
      if (newItem === undefined) {
        changes.push({
          path: childPath,
          oldValue: oldItem,
          newValue: null,
          isRemove: true,
        });
        continue;
      }

      // Both present — recurse to find leaf-level diffs
      changes.push(...diffPaths(oldItem, newItem, childPath));
    }
    return changes;
  }

  /* ---------- Objects ---------- */
  if (oldIsObj && newIsObj) {
    const keys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);
    for (const k of keys) {
      const childPath = prefix ? `${prefix}.${k}` : k;
      changes.push(...diffPaths(oldObj[k], newObj[k], childPath));
    }
    return changes;
  }

  /* ---------- Primitives (or shape mismatch) ---------- */
  if (!deepEqual(oldObj, newObj)) {
    changes.push({
      path: prefix,
      oldValue: oldObj ?? null,
      newValue: newObj ?? null,
    });
  }
  return changes;
}

/** Compute the pending changes for a user. */
export function computePendingChanges(user, snapshotData) {
  const live = pickTrackedData(user);
  const approved = snapshotData || {};

  const changes = [];
  for (const key of TRACKED_PATHS) {
    changes.push(...diffPaths(approved[key], live[key], key));
  }
  return changes;
}