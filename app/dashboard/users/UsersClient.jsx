// app/dashboard/users/UsersClient.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaUserCheck,
  FaTrash,
  FaEye,
  FaFilter,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaClock,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
  FaChevronDown,
  FaChevronRight,
  FaCrown,
  FaUserShield,
  FaUserTie,
  FaStar,
  FaUser,
  FaPrint,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Link from "next/link";
import DashboardMenu from "../../components/layout/DashboardMenu";
import Image from "next/image";
import AddUserModal from "../../components/AddUserModal";

// Core role labels
const CORE_ROLE_LABELS = {
  member: "Member",
  prefect: "Prefect",
  assistant_prefect: "Assistant Prefect",
  itsecretary: "IT Secretary",
  modarator: "Moderator",
  moderator: "Moderator",
  executive_member: "Executive Member",
};

// Core role colors
const CORE_ROLE_COLORS = {
  member: "bg-green-100 text-green-700",
  prefect: "bg-blue-100 text-blue-700",
  assistant_prefect: "bg-cyan-100 text-cyan-700",
  itsecretary: "bg-purple-100 text-purple-700",
  modarator: "bg-orange-100 text-orange-700",
  moderator: "bg-orange-100 text-orange-700",
  executive_member: "bg-pink-100 text-pink-700",
};

const DYNAMIC_ROLE_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-lime-100 text-lime-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
];

// ==================== USER ROW ====================
const UserRow = ({
  user,
  roleLabels,
  roleColors,
  onVerify,
  verifyLoad,
  onToggle,
  onDelete,
  indentLevel = 0,
}) => {
  const displayRole = roleLabels[user.role] || user.role || "Unknown";
  const roleColor = roleColors[user.role] || "bg-gray-100 text-gray-700";

  const executiveSuffix =
    user.role === "executive_member" && user.executiveBranch
      ? ` (${roleLabels[user.executiveBranch] || user.executiveBranch})`
      : "";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all ${
        user.isVerified === false ? "border-l-4 border-l-yellow-400" : ""
      } ${user.isActive === false ? "opacity-70" : ""}`}
      style={{ marginLeft: `${indentLevel * 16}px` }}
    >
      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 overflow-hidden rounded-full bg-[#994D35] text-white flex items-center justify-center font-semibold flex-shrink-0 shadow-sm">
          {user?.personalInfo?.profilePicture ? (
            <div className="relative w-full h-full aspect-square">
              <Image
                src={user.personalInfo.profilePicture}
                alt={user.fullName}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            user.fullName?.[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#3D444C] truncate">
              {user.fullName}
            </p>
            {user.membershipId && (
              <span className="font-mono text-[10px] bg-[#D3A16D]/20 text-[#994D35] border border-[#D3A16D]/40 px-1.5 py-0.5 rounded font-bold tracking-wider">
                {user.membershipId}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {user.email}
          </p>

          {user.phone && (
            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
              <span className="text-gray-400">📞</span>
              {user.phone}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
              {user.studentId}
            </span>
            <span className="text-gray-400 hidden sm:inline">
              {user.department}
            </span>
          </div>
        </div>
      </div>

      {/* Role + Status */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor} whitespace-nowrap`}
        >
          {displayRole}
          {executiveSuffix}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              user.isVerified
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {user.isVerified ? (
              <FaCheckCircle className="text-[8px]" />
            ) : (
              <FaClock className="text-[8px]" />
            )}
            {user.isVerified ? "Verified" : "Pending"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              user.isActive !== false
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {user.isActive !== false ? (
              <FaCheckCircle className="text-[8px]" />
            ) : (
              <FaTimesCircle className="text-[8px]" />
            )}
            {user.isActive !== false ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 sm:gap-2 flex-shrink-0">
        <Link
          href={`/profile/${user._id}`}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Profile"
        >
          <FaEye />
        </Link>

        <button
          onClick={() => onToggle(user)}
          className={`p-2 rounded-lg transition-colors ${
            user.isActive !== false
              ? "text-orange-600 hover:bg-orange-50"
              : "text-green-600 hover:bg-green-50"
          }`}
          title={
            user.isActive !== false ? "Deactivate Account" : "Activate Account"
          }
        >
          {user.isActive !== false ? (
            <FaToggleOn className="text-xl" />
          ) : (
            <FaToggleOff className="text-xl" />
          )}
        </button>

        {!user.isVerified && (
          <button
            onClick={() => onVerify(user._id)}
            disabled={verifyLoad === user._id}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            title="Verify User"
          >
            {verifyLoad === user._id ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaUserCheck />
            )}
          </button>
        )}

        <button
          onClick={() => onDelete(user)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete User"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// ==================== COLLAPSIBLE SECTION ====================
const Section = ({
  title,
  count,
  icon: Icon,
  color,
  children,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-[#E7E3D8]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="text-lg" style={{ color }} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#3D444C]">
            {title}
          </h2>
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {count}
          </span>
        </div>
        <div className="text-gray-400">
          {open ? <FaChevronDown /> : <FaChevronRight />}
        </div>
      </button>

      {open && <div className="px-4 sm:px-6 pb-4 space-y-2.5">{children}</div>}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const UsersClient = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleUser, setToggleUser] = useState(null);
  const [toggleReason, setToggleReason] = useState("");
  const [toggleAction, setToggleAction] = useState(null);
  const [verifyLoad, setVerifyLoad] = useState(null);
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);

  const handleUserAdded = () => fetchUsers();

  // Role label + color maps
  const { roleLabels, roleColors } = useMemo(() => {
    const labels = { ...CORE_ROLE_LABELS };
    const colors = { ...CORE_ROLE_COLORS };

    dynamicRoles.forEach((role, index) => {
      if (!labels[role.roleKey]) labels[role.roleKey] = role.displayName;
      if (!colors[role.roleKey]) {
        colors[role.roleKey] =
          DYNAMIC_ROLE_COLORS[index % DYNAMIC_ROLE_COLORS.length];
      }
    });

    return { roleLabels: labels, roleColors: colors };
  }, [dynamicRoles]);

  // Role filter list
  const roleFilterList = useMemo(() => {
    const coreKeys = [
      "member",
      "prefect",
      "assistant_prefect",
      "itsecretary",
      "modarator",
      "executive_member",
    ];
    const dynamicKeys = dynamicRoles.map((r) => r.roleKey);
    const uniqueKeys = Array.from(new Set([...coreKeys, ...dynamicKeys]));
    return uniqueKeys.map((key) => ({
      value: key,
      label: roleLabels[key] || key,
    }));
  }, [dynamicRoles, roleLabels]);

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
    if (!authLoading && isAuthenticated) {
      const allowedRoles = ["prefect", "itsecretary", "modarator"];
      if (!allowedRoles.includes(authUser?.role)) router.push("/");
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all users (with high limit) to organize by hierarchy client-side
      const url = `/api/secure/users?limit=5000&search=${encodeURIComponent(
        searchTerm,
      )}`;
      const response = await fetch(url, { credentials: "include" });
      const data = await response.json();

      if (data.success) {
        // ✅ Filter out alumni
        const filteredUsers = data.users.filter(
          (u) => u.role !== "alumni" && u.role !== "Alumni",
        );
        setUsers(filteredUsers);
        setTotalUsers(data.pagination.total);
        setUnverifiedCount(data.unverifiedCount);
        setDynamicRoles(data.dynamicRoles || []);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch(e);
  };

  const handleVerify = async (userId) => {
    if (!confirm("Are you sure you want to verify this user?")) return;
    setVerifyLoad(userId);
    try {
      const response = await fetch("/api/secure/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "verify" }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("User verified successfully!");
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to verify user");
      }
    } catch (error) {
      toast.error("Failed to verify user");
    } finally {
      setVerifyLoad(null);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleUser) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/secure/users/toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: toggleUser._id,
          isActive: toggleAction === "activate",
          reason: toggleReason || "No reason provided",
        }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast.success(
          toggleAction === "activate"
            ? "Account activated successfully!"
            : "Account deactivated successfully!",
        );
        setShowToggleModal(false);
        setToggleUser(null);
        setToggleReason("");
        setToggleAction(null);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to update account status");
      }
    } catch (error) {
      toast.error("Failed to update account status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/secure/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          action: "delete",
          message: deleteMessage || "No reason provided",
        }),
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("User deleted successfully!");
        setShowDeleteModal(false);
        setSelectedUser(null);
        setDeleteMessage("");
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsProcessing(false);
    }
  };

  // ==================== PRINT ACTIVE MEMBERS ====================
  const handlePrintActiveMembers = () => {
    // Active only, exclude moderators
    const activeUsers = users.filter((u) => {
      if (u.isActive === false) return false;
      if (u.role === "modarator" || u.role === "moderator") return false;
      return true;
    });

    if (activeUsers.length === 0) {
      toast.error("No active members to print");
      return;
    }

    const esc = (s) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const roleLabel = (role) => roleLabels[role] || role || "—";

    const alphaSort = (a, b) =>
      (a.fullName || "").localeCompare(b.fullName || "");

    // ---------- Build hierarchy groups ----------
    const byRole = (role) => activeUsers.filter((u) => u.role === role);
    const byBranch = (branch) =>
      activeUsers.filter(
        (u) => u.role === "executive_member" && u.executiveBranch === branch,
      );

    const dynamicPostKeys = dynamicRoles
      .filter((r) => r.roleKey !== "executive_member")
      .map((r) => r.roleKey);

    const groups = [];

    // 1) Prefect
    const prefects = byRole("prefect").sort(alphaSort);
    if (prefects.length) {
      groups.push({ key: "prefect", title: "Prefect", members: prefects });
    }

    // 2) Assistant Prefect
    const assist = byRole("assistant_prefect").sort(alphaSort);
    if (assist.length) {
      groups.push({
        key: "assistant_prefect",
        title: "Assistant Prefect",
        members: assist,
      });
    }

    // 3) IT Secretary (with its executives)
    const itSecHeads = byRole("itsecretary").sort(alphaSort);
    const itSecExecs = byBranch("itsecretary").sort(alphaSort);
    if (itSecHeads.length || itSecExecs.length) {
      groups.push({
        key: "itsecretary",
        title: "IT Secretary",
        members: [...itSecHeads, ...itSecExecs],
      });
    }

    // 4) Other dynamic posts
    for (const key of dynamicPostKeys) {
      if (key === "itsecretary") continue;
      const heads = byRole(key).sort(alphaSort);
      const execs = byBranch(key).sort(alphaSort);
      if (heads.length || execs.length) {
        groups.push({
          key,
          title: roleLabel(key),
          members: [...heads, ...execs],
        });
      }
    }

    // 5) Executive members with no branch
    const execsNoBranch = activeUsers
      .filter((u) => u.role === "executive_member" && !u.executiveBranch)
      .sort(alphaSort);
    if (execsNoBranch.length) {
      groups.push({
        key: "exec_no_branch",
        title: "Executive Members (No Branch)",
        members: execsNoBranch,
      });
    }

    // 6) General members
    const members = byRole("member").sort(alphaSort);
    if (members.length) {
      groups.push({ key: "member", title: "General Members", members });
    }

    const grandTotal = groups.reduce((sum, g) => sum + g.members.length, 0);

    // ---------- Build ONE table body with section rows ----------
    let rowCounter = 0;
    const tbodyHtml = groups
      .map((group) => {
        // Section header row (spans all columns)
        const sectionRow = `
        <tr class="section-row">
          <td colspan="7">
            <div class="section-inner">
              <span class="section-title">${esc(group.title)}</span>
              <span class="section-count">${group.members.length}</span>
            </div>
          </td>
        </tr>
      `;

        // Member rows
        const memberRows = group.members
          .map((u) => {
            rowCounter += 1;
            return `
            <tr>
              <td class="num">${rowCounter}</td>
              <td>
                <div class="name">${esc(u.fullName || "")}</div>
                ${
                  u.membershipId
                    ? `<div class="mid">${esc(u.membershipId)}</div>`
                    : ""
                }
              </td>
              <td class="email">${esc(u.email || "")}</td>
              <td class="phone">${esc(u.phone || "")}</td>
              <td class="mono">${esc(u.studentId || "")}</td>
              <td>${esc(u.department || "")}</td>
              <td class="role-cell">${esc(roleLabel(u.role))}${
                u.role === "executive_member" && u.executiveBranch
                  ? ` <span class="branch-suffix">(${esc(
                      roleLabel(u.executiveBranch),
                    )})</span>`
                  : ""
              }</td>
            </tr>
          `;
          })
          .join("");

        return sectionRow + memberRows;
      })
      .join("");

    const printDate = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Active Members - ACC Career Club</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Helvetica, Arial, sans-serif;
    color: #3D444C;
    font-size: 10pt;
  }

  .header {
    text-align: center;
    padding: 8pt 0 12pt;
    border-bottom: 3px double #3D444C;
    margin-bottom: 12pt;
  }
  .header .club {
    font-size: 20pt;
    font-weight: 800;
    color: #3D444C;
    letter-spacing: 1px;
    margin: 0;
  }
  .header .subtitle {
    font-size: 10pt;
    color: #994D35;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin: 2pt 0 8pt;
    font-weight: 600;
  }
  .header .doc-title {
    font-size: 14pt;
    font-weight: 700;
    color: #3D444C;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 4pt 0 0;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    color: #666;
    margin-bottom: 14pt;
    padding: 6pt 10pt;
    background: #FAF8F3;
    border: 1px solid #D3A16D;
    border-radius: 4pt;
  }

  /* ---------- Single table ---------- */
  table.list {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  table.list thead th {
    background: #3D444C;
    color: #FFFFFF;
    text-align: left;
    padding: 7pt 5pt;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid #3D444C;
  }
  table.list thead th.num { width: 26pt; text-align: center; }
  table.list thead th.name { width: 20%; }
  table.list thead th.email { width: 20%; }
  table.list thead th.phone { width: 11%; }
  table.list thead th.sid { width: 10%; }
  table.list thead th.dept { width: 15%; }
  table.list thead th.role { width: 14%; }

  table.list tbody td {
    padding: 5pt 5pt;
    border: 1px solid #D6D0BE;
    vertical-align: top;
    font-size: 9pt;
    color: #3D444C;
    word-wrap: break-word;
  }
  table.list tbody tr:nth-child(even):not(.section-row) td {
    background: #FAF8F3;
  }

  /* ---------- Section row (in-table heading) ---------- */
  tr.section-row td {
    background: linear-gradient(90deg, #3D444C, #4a525c) !important;
    border: 1px solid #3D444C !important;
    padding: 6pt 8pt !important;
    color: #E7E3D8;
  }
  .section-inner {
    display: flex;
    align-items: center;
    gap: 8pt;
  }
  .section-title {
    font-size: 10.5pt;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #E7E3D8;
    flex: 1;
  }
  .section-count {
    font-size: 9pt;
    font-weight: 700;
    background: #D3A16D;
    color: #3D444C;
    padding: 1pt 9pt;
    border-radius: 20pt;
    letter-spacing: 0.5px;
  }

  /* ---------- Cells ---------- */
  .num { color: #994D35; font-weight: 700; text-align: center; }
  .name { font-weight: 700; }
  .mid {
    display: inline-block;
    margin-top: 2pt;
    font-family: 'Courier New', monospace;
    font-size: 8pt;
    font-weight: 700;
    color: #994D35;
    background: #FEF3C7;
    border: 1px solid #FCD34D;
    border-radius: 3pt;
    padding: 0 4pt;
    letter-spacing: 0.5px;
  }
  .email, .phone { font-size: 9pt; }
  .mono { font-family: 'Courier New', monospace; font-size: 9pt; }
  .role-cell { font-size: 9pt; font-weight: 600; }
  .branch-suffix { color: #994D35; font-weight: 500; font-size: 8.5pt; }

  .footer {
    margin-top: 16pt;
    padding-top: 8pt;
    border-top: 1px solid #3D444C;
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #666;
  }

  @media print {
    body { background: #fff !important; }
    table.list tbody tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
    /* Section rows should never be the last row on a page */
    tr.section-row { page-break-after: avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1 class="club">ACC CAREER CLUB</h1>
    <p class="subtitle">Adamjee Cantonment College</p>
    <h2 class="doc-title">Active Members Register</h2>
  </div>

  <div class="meta">
    <div><strong>Total Members:</strong> ${grandTotal}</div>
    <div><strong>Groups:</strong> ${groups.length}</div>
    <div><strong>Printed:</strong> ${esc(printDate)}</div>
  </div>

  <table class="list">
    <thead>
      <tr>
        <th class="num">#</th>
        <th class="name">Name</th>
        <th class="email">Email</th>
        <th class="phone">Phone</th>
        <th class="sid">Student ID</th>
        <th class="dept">Department</th>
        <th class="role">Role</th>
      </tr>
    </thead>
    <tbody>
      ${tbodyHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>ACC Career Club — Member Register</div>
    <div>Generated by the club management system</div>
  </div>
</body>
</html>`;

    // Hidden iframe — same pattern as the rest of your app
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (_) {}
      }, 500);
    };

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const printNow = () => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error("Print error:", err);
        toast.error("Failed to open print dialog");
      } finally {
        const win = iframe.contentWindow;
        if (win) {
          const done = () => cleanup();
          try {
            win.addEventListener("afterprint", done, { once: true });
          } catch (_) {}
          setTimeout(done, 1500);
        } else {
          cleanup();
        }
      }
    };

    const waitForReady = () => {
      const win = iframe.contentWindow;
      if (win.document.fonts && win.document.fonts.ready) {
        win.document.fonts.ready.then(() => setTimeout(printNow, 200));
      } else {
        setTimeout(printNow, 300);
      }
    };

    if (iframe.contentWindow.document.readyState === "complete") {
      waitForReady();
    } else {
      iframe.addEventListener("load", waitForReady, { once: true });
      setTimeout(waitForReady, 400);
    }
  };

  // Alphabetical helper — declared once, used by every group sort
  function alphaSort(a, b) {
    return (a.fullName || "").localeCompare(b.fullName || "");
  }

  // ==================== ORGANIZE BY HIERARCHY ====================
  const hierarchy = useMemo(() => {
    // Helper to filter by role
    const byRole = (role) => users.filter((u) => u.role === role);
    const byBranch = (branch) =>
      users.filter(
        (u) => u.role === "executive_member" && u.executiveBranch === branch,
      );

    // Get all unique executive branches
    const executiveBranches = Array.from(
      new Set(
        users
          .filter((u) => u.role === "executive_member" && u.executiveBranch)
          .map((u) => u.executiveBranch),
      ),
    );

    // Get all dynamic roles (excluding executive_member)
    const dynamicRolesList = dynamicRoles
      .filter((r) => r.roleKey !== "executive_member")
      .map((r) => r.roleKey);

    return {
      moderators: byRole("modarator"),
      moderatorsAlt: byRole("moderator"),
      prefects: byRole("prefect"),
      assistantPrefects: byRole("assistant_prefect"),
      // Branches: itsecretary + dynamic roles
      branches: [
        { key: "itsecretary", label: "IT Secretary" },
        ...dynamicRolesList.map((key) => ({
          key,
          label: roleLabels[key] || key,
        })),
      ].map((branch) => ({
        ...branch,
        heads: byRole(branch.key),
        executives: byBranch(branch.key),
      })),
      // Executive members with no branch
      executivesNoBranch: users.filter(
        (u) => u.role === "executive_member" && !u.executiveBranch,
      ),
      // General members
      members: byRole("member"),
    };
  }, [users, dynamicRoles, roleLabels]);

  // Apply role filter to each hierarchy section
  const applyFilter = (list) => {
    if (filterRole === "all") return list;
    return list.filter((u) => u.role === filterRole);
  };

  // Check if a section should show given the filter
  const shouldShowRole = (role) => filterRole === "all" || filterRole === role;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const allowedRoles = ["prefect", "itsecretary", "modarator"];
  if (!allowedRoles.includes(authUser?.role)) return null;

  const rowProps = {
    roleLabels,
    roleColors,
    onVerify: handleVerify,
    verifyLoad,
    onToggle: (user) => {
      setToggleUser(user);
      setToggleAction(user.isActive !== false ? "deactivate" : "activate");
      setShowToggleModal(true);
    },
    onDelete: (user) => {
      setSelectedUser(user);
      setShowDeleteModal(true);
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage members organized by hierarchy
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
              <FaUsers className="text-[#994D35]" />
              <span className="font-semibold text-[#3D444C]">{totalUsers}</span>
              <span className="text-gray-400">|</span>
              <span className="text-yellow-600 font-semibold">
                {unverifiedCount}
              </span>
              <span className="text-gray-400 text-sm">pending</span>
            </div>

            <button
              onClick={handlePrintActiveMembers}
              className="flex items-center gap-2 bg-[#3D444C] text-white px-4 py-2 rounded-lg hover:bg-[#2a3037] transition-colors"
              title="Print all active members (excluding moderators)"
            >
              <FaPrint />
              <span className="hidden sm:inline">Print Members</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 bg-[#994D35] text-white px-4 py-2 rounded-lg hover:bg-[#D3A16D] transition-colors"
            >
              <FaUserPlus />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, ID, or roll number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent bg-white"
              >
                <option value="all">All Roles</option>
                {roleFilterList.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ==================== HIERARCHY SECTIONS ==================== */}
        <div className="space-y-6">
          {/* ===== MODERATORS ===== */}
          {(shouldShowRole("modarator") || shouldShowRole("moderator")) &&
            (hierarchy.moderators.length > 0 ||
              hierarchy.moderatorsAlt.length > 0) && (
              <Section
                title="Moderators"
                count={
                  applyFilter(hierarchy.moderators).length +
                  applyFilter(hierarchy.moderatorsAlt).length
                }
                icon={FaCrown}
                color="#DC2626"
              >
                {[
                  ...applyFilter(hierarchy.moderators),
                  ...applyFilter(hierarchy.moderatorsAlt),
                ].map((u) => (
                  <UserRow key={u._id} user={u} {...rowProps} />
                ))}
              </Section>
            )}

          {/* ===== PREFECTS ===== */}
          {shouldShowRole("prefect") &&
            applyFilter(hierarchy.prefects).length > 0 && (
              <Section
                title="Prefects"
                count={applyFilter(hierarchy.prefects).length}
                icon={FaUserShield}
                color="#2563EB"
              >
                {applyFilter(hierarchy.prefects).map((u) => (
                  <UserRow key={u._id} user={u} {...rowProps} />
                ))}
              </Section>
            )}

          {/* ===== ASSISTANT PREFECTS ===== */}
          {shouldShowRole("assistant_prefect") &&
            applyFilter(hierarchy.assistantPrefects).length > 0 && (
              <Section
                title="Assistant Prefects"
                count={applyFilter(hierarchy.assistantPrefects).length}
                icon={FaUserTie}
                color="#0891B2"
              >
                {applyFilter(hierarchy.assistantPrefects).map((u) => (
                  <UserRow key={u._id} user={u} {...rowProps} />
                ))}
              </Section>
            )}

          {/* ===== BRANCHES (IT Secretary + Dynamic Roles) ===== */}
          {hierarchy.branches.map((branch) => {
            const filteredHeads = applyFilter(branch.heads);
            const filteredExecs = applyFilter(branch.executives);

            // Skip if filter is set and doesn't match this branch
            if (
              filterRole !== "all" &&
              filterRole !== branch.key &&
              filterRole !== "executive_member"
            ) {
              return null;
            }

            // If filter is executive_member, only show branches that have execs
            if (
              filterRole === "executive_member" &&
              filteredExecs.length === 0
            ) {
              return null;
            }

            if (filteredHeads.length === 0 && filteredExecs.length === 0) {
              return null;
            }

            return (
              <Section
                key={branch.key}
                title={branch.label}
                count={filteredHeads.length + filteredExecs.length}
                icon={FaStar}
                color="#994D35"
              >
                {/* Branch Head */}
                {filteredHeads.map((u) => (
                  <UserRow key={u._id} user={u} {...rowProps} />
                ))}

                {/* Executive Members under this branch */}
                {filteredExecs.length > 0 && (
                  <div className="mt-2 space-y-2 pl-4 sm:pl-6 border-l-2 border-[#D3A16D]/40">
                    <p className="text-xs font-semibold text-[#994D35] uppercase tracking-wide pl-1 mb-2">
                      Executive Members
                    </p>
                    {filteredExecs.map((u) => (
                      <UserRow
                        key={u._id}
                        user={u}
                        {...rowProps}
                        indentLevel={1}
                      />
                    ))}
                  </div>
                )}
              </Section>
            );
          })}

          {/* ===== EXECUTIVE MEMBERS WITHOUT BRANCH ===== */}
          {(filterRole === "all" || filterRole === "executive_member") &&
            hierarchy.executivesNoBranch.length > 0 && (
              <Section
                title="Executive Members (No Branch Assigned)"
                count={hierarchy.executivesNoBranch.length}
                icon={FaStar}
                color="#9333EA"
              >
                {hierarchy.executivesNoBranch.map((u) => (
                  <UserRow key={u._id} user={u} {...rowProps} />
                ))}
              </Section>
            )}

          {/* ===== GENERAL MEMBERS ===== */}
          {(filterRole === "all" || filterRole === "member") &&
            applyFilter(hierarchy.members).length > 0 && (
              <Section
                title="General Members"
                count={applyFilter(hierarchy.members).length}
                icon={FaUser}
                color="#16A34A"
                defaultOpen={false}
              >
                {applyFilter(hierarchy.members).map((u) => (
                  <UserRow key={u._id} user={u} {...rowProps} />
                ))}
              </Section>
            )}

          {/* Empty state */}
          {users.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-[#3D444C] mb-2">
                No Users Found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No users available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
              Delete User
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>{selectedUser.fullName}</strong>? This action cannot be
              undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for deletion (optional):
              </label>
              <textarea
                value={deleteMessage}
                onChange={(e) => setDeleteMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                rows="3"
                placeholder="Enter reason for deletion..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                  setDeleteMessage("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Modal */}
      {showToggleModal && toggleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
              {toggleAction === "activate" ? "Activate" : "Deactivate"} Account
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to{" "}
              <strong>
                {toggleAction === "activate" ? "activate" : "deactivate"}
              </strong>{" "}
              <strong>{toggleUser.fullName}</strong>'s account?
              {toggleAction === "deactivate" && (
                <span className="block mt-2 text-sm text-red-600">
                  ⚠️ This will immediately log them out and prevent them from
                  logging in.
                </span>
              )}
              {toggleAction === "activate" && (
                <span className="block mt-2 text-sm text-green-600">
                  ✅ This will restore their access to the platform.
                </span>
              )}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for{" "}
                {toggleAction === "activate" ? "activation" : "deactivation"}{" "}
                (optional):
              </label>
              <textarea
                value={toggleReason}
                onChange={(e) => setToggleReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                rows="3"
                placeholder={`Enter reason for ${
                  toggleAction === "activate" ? "activation" : "deactivation"
                }...`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowToggleModal(false);
                  setToggleUser(null);
                  setToggleReason("");
                  setToggleAction(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleActive}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  toggleAction === "activate"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isProcessing ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : toggleAction === "activate" ? (
                  "Activate"
                ) : (
                  "Deactivate"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};

export default UsersClient;
