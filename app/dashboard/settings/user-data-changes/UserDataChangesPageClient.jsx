// app/dashboard/settings/user-data-changes/UserDataChangesPageClient.jsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FaUserEdit,
  FaCheck,
  FaCheckDouble,
  FaSpinner,
  FaSearch,
  FaArrowLeft,
  FaExclamationTriangle,
  FaInbox,
} from "react-icons/fa";
import DashboardMenu from "@/app/components/layout/DashboardMenu";

/* =========================================================
   Helpers
   ========================================================= */

const prettifyKey = (key) =>
  key
    .split(".")
    .map((p) =>
      p
        .replace(/\[(\d+)\]/g, " [$1]")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
        .trim(),
    )
    .join(" → ");

const isPlainObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const summarize = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return "(empty list)";
    if (v.every((x) => typeof x !== "object" || x === null))
      return v.join(", ");
    return `${v.length} item${v.length === 1 ? "" : "s"}`;
  }
  if (isPlainObject(v)) {
    const k = Object.keys(v).filter(
      (key) => v[key] !== null && v[key] !== "" && v[key] !== undefined,
    );
    return k.length === 0
      ? "(empty object)"
      : `{ ${k.length} field${k.length === 1 ? "" : "s"} }`;
  }
  if (typeof v === "string" && v.length > 80) return v.slice(0, 77) + "…";
  return String(v);
};

const inlineLeaf = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

/* =========================================================
   Value viewer
   ========================================================= */

const ValuePreview = ({ value, depth = 0 }) => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">(empty list)</span>;
    }
    return (
      <ol className="space-y-1">
        {value.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="shrink-0 text-[10px] font-mono text-gray-400 pt-0.5">
              {i + 1}.
            </span>
            <div className="min-w-0 flex-1">
              {typeof item === "object" && item !== null ? (
                <ValuePreview value={item} depth={depth + 1} />
              ) : (
                <span className="break-words">{inlineLeaf(item)}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(
      ([, v]) => v !== null && v !== undefined,
    );
    if (entries.length === 0) {
      return <span className="text-gray-400 italic">(empty object)</span>;
    }
    return (
      <dl className="space-y-0.5">
        {entries.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="shrink-0 text-[10px] uppercase tracking-wider text-gray-500 font-bold pt-0.5 min-w-[90px]">
              {k
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (c) => c.toUpperCase())}
            </dt>
            <dd className="min-w-0 flex-1 break-words">
              {typeof v === "object" && v !== null ? (
                <ValuePreview value={v} depth={depth + 1} />
              ) : (
                inlineLeaf(v)
              )}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <span className="break-words">{inlineLeaf(value)}</span>;
};

const ValueCell = ({ value, tone }) => {
  const [open, setOpen] = React.useState(false);
  const needsToggle =
    (Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === "object") ||
    isPlainObject(value);

  const borderTone =
    tone === "old"
      ? "border-red-200 bg-red-50"
      : "border-green-200 bg-green-50";
  const labelTone = tone === "old" ? "text-red-700" : "text-green-700";

  return (
    <div className={`border ${borderTone} rounded-lg p-2`}>
      <p
        className={`text-[9px] uppercase tracking-wider font-bold mb-1 ${labelTone}`}
      >
        {tone === "old" ? "Approved (old)" : "User's new"}
      </p>

      {needsToggle && !open ? (
        <div className="text-[#3D444C] break-words">
          <span>{summarize(value)}</span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ml-2 text-[10px] font-bold underline text-[#994D35] hover:text-[#D3A16D]"
          >
            View full
          </button>
        </div>
      ) : needsToggle && open ? (
        <div className="text-[11px] text-[#3D444C]">
          <ValuePreview value={value} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-1 text-[10px] font-bold underline text-[#994D35] hover:text-[#D3A16D]"
          >
            Hide details
          </button>
        </div>
      ) : (
        <p className="text-[#3D444C] break-words">{inlineLeaf(value)}</p>
      )}
    </div>
  );
};

/* =========================================================
   Shimmer primitives
   ========================================================= */

const ShimmerBar = ({ className = "" }) => (
  <div className={`shimmer-bar ${className}`} />
);

const ListSkeleton = ({ rows = 5 }) => (
  <div className="divide-y divide-gray-100">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <ShimmerBar className="h-3 w-2/3" />
            <ShimmerBar className="h-2.5 w-1/2" />
            <ShimmerBar className="h-2 w-3/4" />
          </div>
          <ShimmerBar className="h-4 w-8 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const DetailSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className="bg-[#3D444C] px-5 py-4 flex items-center justify-between">
      <div className="space-y-2">
        <ShimmerBar className="h-4 w-40 !bg-white/20" />
        <ShimmerBar className="h-3 w-56 !bg-white/15" />
      </div>
      <ShimmerBar className="h-9 w-28 rounded-lg !bg-white/20" />
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4">
          <ShimmerBar className="h-3 w-1/3 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-100 bg-red-50/40 p-3 space-y-2">
              <ShimmerBar className="h-2 w-24" />
              <ShimmerBar className="h-3 w-3/4" />
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50/40 p-3 space-y-2">
              <ShimmerBar className="h-2 w-24" />
              <ShimmerBar className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* =========================================================
   Main page
   ========================================================= */

export default function UserDataChangesPageClient() {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // List state
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");

  // Detail state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Per-row busy flags
  const [busyPaths, setBusyPaths] = useState({}); // { [path]: true }
  const [busyAll, setBusyAll] = useState(false);

  /* ---- auth ---- */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
    if (!authLoading && isAuthenticated) {
      const allowed = ["prefect", "itsecretary", "modarator"];
      if (!allowed.includes(authUser?.role)) router.push("/");
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  /* ---- initial list fetch ---- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingList(true);
      try {
        const res = await fetch("/api/secure/copy-user", {
          credentials: "include",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success) setList(data.users || []);
        else toast.error(data.message || "Failed to load changes");
      } catch (e) {
        console.error(e);
        if (!cancelled) toast.error("Failed to load changes");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- explicit refresh (button only) ---- */
  const refreshList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/secure/copy-user", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setList(data.users || []);
      else toast.error(data.message || "Failed to load changes");
    } catch (e) {
      console.error(e);
      toast.error("Failed to load changes");
    } finally {
      setLoadingList(false);
    }
  }, []);

  /* ---- fetch detail ---- */
  const fetchDetail = useCallback(async (userId) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    setDetail(null);
    try {
      const res = await fetch(`/api/secure/copy-user?userId=${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setDetail(data);
      else toast.error(data.message || "Failed to load detail");
    } catch (e) {
      console.error(e);
      toast.error("Failed to load detail");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  /* ---- accept one path (LOCAL update — no refetch) ---- */
  const acceptPath = async (path) => {
    if (!detail) return;
    setBusyPaths((b) => ({ ...b, [path]: true }));
    try {
      const res = await fetch("/api/secure/copy-user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: detail.user.id, paths: [path] }),
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to accept change");
        return;
      }

      // ✅ Remove just this change from local detail state
      setDetail((prev) => {
        if (!prev) return prev;
        const nextChanges = prev.changes.filter((c) => c.path !== path);
        return { ...prev, changes: nextChanges };
      });

      // ✅ Decrement the count in the list for this user
      setList((prev) =>
        prev
          .map((u) =>
            u.id === detail.user.id
              ? {
                  ...u,
                  changeCount: Math.max(0, (u.changeCount || 1) - 1),
                  changedPaths: (u.changedPaths || []).filter(
                    (p) => p !== path,
                  ),
                }
              : u,
          )
          .filter((u) => u.changeCount > 0),
      );

      toast.success("Change approved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to accept change");
    } finally {
      setBusyPaths((b) => {
        const n = { ...b };
        delete n[path];
        return n;
      });
    }
  };

  /* ---- accept all (LOCAL update) ---- */
  const acceptAll = async () => {
    if (!detail) return;
    setBusyAll(true);
    try {
      const res = await fetch("/api/secure/copy-user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: detail.user.id, acceptAll: true }),
        credentials: "include",
      });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to accept all");
        return;
      }

      // ✅ Empty the current detail changes
      setDetail((prev) => (prev ? { ...prev, changes: [] } : prev));

      // ✅ Remove this user from the pending list entirely
      setList((prev) => prev.filter((u) => u.id !== detail.user.id));

      toast.success("All changes approved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to accept all");
    } finally {
      setBusyAll(false);
    }
  };

  /* ---- filter list ---- */
  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.studentId?.toLowerCase().includes(q),
    );
  }, [list, search]);

  /* ---- initial full-page loader (auth + first list fetch) ---- */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        <div className="mt-8 mb-6">
          <div className="flex items-center gap-3">
            <FaUserEdit className="text-[#994D35] text-3xl" />
            <div>
              <h1 className="text-3xl font-bold text-[#3D444C]">
                User Data Changes
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Review user-edited profile fields and approve them one by one.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ================ LEFT: LIST ================ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users…"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {loadingList
                      ? "Loading…"
                      : `${filtered.length} user(s) with pending changes`}
                  </span>
                  <button
                    onClick={refreshList}
                    disabled={loadingList}
                    className="text-[#994D35] font-semibold hover:underline disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto">
                {loadingList ? (
                  <ListSkeleton rows={5} />
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    <FaInbox className="mx-auto mb-2 text-3xl text-[#D3A16D]" />
                    No pending changes.
                  </div>
                ) : (
                  filtered.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => fetchDetail(u.id)}
                      className={`fade-in w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#E7E3D8]/40 transition-colors ${
                        selectedUserId === u.id ? "bg-[#E7E3D8]/70" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#3D444C] truncate">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {u.email}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            {u.studentId} · {u.department || "—"}
                          </p>
                        </div>
                        <span className="shrink-0 bg-[#994D35] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {u.changeCount}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ================ RIGHT: DETAIL ================ */}
          <div className="lg:col-span-2">
            {!selectedUserId && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-400">
                <FaArrowLeft className="mx-auto mb-3 text-2xl text-[#D3A16D]" />
                Select a user on the left to see their pending changes.
              </div>
            )}

            {selectedUserId && loadingDetail && <DetailSkeleton />}

            {selectedUserId && !loadingDetail && detail && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden fade-in">
                {/* header */}
                <div className="bg-[#3D444C] text-[#E7E3D8] px-5 py-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <h2 className="font-bold text-lg truncate">
                      {detail.user.fullName}
                    </h2>
                    <p className="text-xs text-[#D3A16D] font-mono">
                      {detail.user.studentId} · {detail.user.email}
                    </p>
                  </div>
                  {detail.changes.length > 0 && (
                    <button
                      onClick={acceptAll}
                      disabled={busyAll}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#D3A16D] to-[#994D35] text-white px-4 py-2 rounded-lg font-bold shadow-md hover:scale-[1.02] transition-transform disabled:opacity-60"
                    >
                      {busyAll ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaCheckDouble />
                      )}
                      Accept All
                    </button>
                  )}
                </div>

                {/* no changes left */}
                {detail.changes.length === 0 && (
                  <div className="p-12 text-center text-gray-400 fade-in">
                    <FaCheck className="mx-auto mb-3 text-3xl text-green-500" />
                    All changes approved — nothing left to review.
                  </div>
                )}

                {/* change rows */}
                {detail.changes.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {detail.changes.map((c, idx) => (
                      <div
                        key={`${c.path}-${idx}`}
                        className="p-4 hover:bg-[#F9F8F5] transition-colors fade-in"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <p className="text-[11px] uppercase tracking-wider text-[#994D35] font-bold">
                                {prettifyKey(c.path)}
                              </p>
                              {c.isAdd && (
                                <span className="text-[9px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                  added
                                </span>
                              )}
                              {c.isRemove && (
                                <span className="text-[9px] uppercase tracking-wider font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                  removed
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <ValueCell value={c.oldValue} tone="old" />
                              <ValueCell value={c.newValue} tone="new" />
                            </div>
                          </div>
                          <button
                            onClick={() => acceptPath(c.path)}
                            disabled={!!busyPaths[c.path]}
                            className="shrink-0 flex items-center gap-1 bg-[#994D35] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#D3A16D] transition-colors disabled:opacity-60"
                          >
                            {busyPaths[c.path] ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaCheck />
                            )}
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}