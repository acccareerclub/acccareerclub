"use client";
import DashboardMenu from "@/app/components/layout/DashboardMenu";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaTrash,
  FaUserShield,
  FaPlus,
  FaSpinner,
  FaPrint,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import Select from "react-select";

const CORE_ROLES = [
  { value: "moderator", label: "Moderator" },
  { value: "prefect", label: "Prefect" },
  { value: "assistant_prefect", label: "Assistant Prefect" },
  { value: "itsecretary", label: "IT Secretary" },
  { value: "executive_member", label: "Executive Member" },
];

const RedArrow = () => (
  <div className="absolute -left-8 top-4 flex items-center print:opacity-100">
    <div className="w-6 h-[2px] bg-[#994D35]"></div>
    <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-[#994D35]"></div>
  </div>
);

// ==================== AVATAR COMPONENT ====================
const Avatar = ({ user, size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const profilePic = user?.personalInfo?.profilePicture;
  const initial = user?.fullName?.[0]?.toUpperCase() || "?";

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#3D444C] to-[#994D35] text-white font-bold shadow-md border-2 border-[#D3A16D]/40 print:border-[#994D35]`}
    >
      {profilePic ? (
        <div className="relative w-full h-full">
          <Image
            src={profilePic}
            alt={user.fullName || "User"}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
};

// ==================== SHIMMER COMPONENTS ====================
const ShimmerUserNode = () => (
  <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-md border border-gray-200 w-64 shadow-sm mb-2 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="w-4 h-4 bg-gray-200 rounded ml-2"></div>
  </div>
);

const ShimmerBranch = () => (
  <div className="relative pl-12 mb-6 ml-4 animate-pulse">
    <div className="absolute -left-8 top-4 flex items-center">
      <div className="w-6 h-[2px] bg-gray-300"></div>
      <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-gray-300"></div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
    <ShimmerUserNode />
    <ShimmerUserNode />
  </div>
);

const ShimmerFlowchart = () => (
  <div className="pl-4 pb-12 min-w-[600px]">
    <div className="mb-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-24 mb-3"></div>
      <ShimmerUserNode />
    </div>

    <div className="relative pl-8 mb-4 border-l-2 border-gray-300 ml-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-20 mb-3"></div>
      <ShimmerUserNode />

      <div className="mt-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-3"></div>
        <ShimmerUserNode />
      </div>

      <div className="mt-6 relative">
        <div className="absolute left-4 top-0 bottom-8 w-[2px] bg-gray-300"></div>
        <ShimmerBranch />
        <ShimmerBranch />
        <ShimmerBranch />
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
export default function DesignationClient() {
  const [designatedUsers, setDesignatedUsers] = useState([]);
  const [regularMembers, setRegularMembers] = useState([]);
  const [dynamicRoles, setDynamicRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment Form State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleName, setNewRoleName] = useState("");

  // Loading states for actions
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [deletingRoleKey, setDeletingRoleKey] = useState(null);
  const [removingUserId, setRemovingUserId] = useState(null);

  const printRef = useRef(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/secure/designation");
      const data = await res.json();
      if (data.success) {
        setDesignatedUsers(data.designatedUsers);
        setRegularMembers(data.regularMembers);
        setDynamicRoles(data.dynamicRoles);
      }
    } catch (error) {
      toast.error("Failed to fetch designation data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRole)
      return toast.error("Please select a user and role");
    if (selectedRole === "executive_member" && !selectedBranch)
      return toast.error("Please select a branch");

    setIsAssigning(true);
    try {
      const res = await fetch("/api/secure/designation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId.value,
          role: selectedRole,
          executiveBranch:
            selectedRole === "executive_member" ? selectedBranch : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Role assigned successfully");
        setSelectedUserId(null);
        setSelectedRole("");
        setSelectedBranch("");
        fetchData();
      } else toast.error(data.message);
    } catch (error) {
      toast.error("Assignment failed");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm("Remove this designation?")) return;

    setRemovingUserId(userId);
    try {
      const res = await fetch("/api/secure/designation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: "member",
          executiveBranch: null,
        }),
      });
      if ((await res.json()).success) {
        toast.success("Designation removed");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to remove user");
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleKey || !newRoleName) return toast.error("Fill all fields");

    setIsAddingRole(true);
    try {
      const res = await fetch("/api/secure/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleKey: newRoleKey.toLowerCase().replace(/\s+/g, "_"),
          displayName: newRoleName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Role created");
        setNewRoleKey("");
        setNewRoleName("");
        fetchData();
      } else toast.error(data.message);
    } catch (error) {
      toast.error("Failed to create role");
    } finally {
      setIsAddingRole(false);
    }
  };

  const handleDeleteRole = async (roleKey) => {
    if (
      !confirm(
        "Delete this role? All associated users will become regular members.",
      )
    )
      return;

    setDeletingRoleKey(roleKey);
    try {
      const res = await fetch(`/api/secure/roles?roleKey=${roleKey}`, {
        method: "DELETE",
      });
      if ((await res.json()).success) {
        toast.success("Role deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete role");
    } finally {
      setDeletingRoleKey(null);
    }
  };

  // ==================== PRINT FUNCTION ====================
  // ==================== PRINT FUNCTION ====================
  const handlePrint = () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }

    // -------- Helper: build user card HTML --------
    const userCardHTML = (user, isExec = false) => {
      const pic = user?.personalInfo?.profilePicture;
      const initial = (user?.fullName?.[0] || "?").toUpperCase();
      const avatarInner = pic
        ? `<img src="${pic}" alt="${user.fullName}" />`
        : initial;

      return `
      <div class="user-card ${isExec ? "exec" : ""}">
        <div class="user-avatar">${avatarInner}</div>
        <div class="user-info">
          <div class="user-name">${user.fullName || "Unknown"}</div>
          <div class="user-id">${user.studentId || ""}</div>
        </div>
      </div>
    `;
    };

    // -------- Build Moderator section --------
    const moderators = designatedUsers.filter((u) => u.role === "moderator");
    const moderatorHTML = moderators.length
      ? moderators.map((u) => userCardHTML(u)).join("")
      : `<p class="vacant-text">— Vacant —</p>`;

    // -------- Build Prefect section --------
    const prefects = designatedUsers.filter((u) => u.role === "prefect");
    const prefectHTML = prefects.length
      ? prefects.map((u) => userCardHTML(u)).join("")
      : `<p class="vacant-text">— Vacant —</p>`;

    // -------- Build Assistant Prefect section --------
    const assistants = designatedUsers.filter(
      (u) => u.role === "assistant_prefect",
    );
    const assistantHTML = assistants.length
      ? assistants.map((u) => userCardHTML(u)).join("")
      : `<p class="vacant-text">— Vacant —</p>`;

    // -------- Build Branches --------
    const branchesHTML = branchOptions
      .map((branch) => {
        const branchSecs = designatedUsers.filter(
          (u) => u.role === branch.value,
        );
        const branchExecs = designatedUsers.filter(
          (u) =>
            u.role === "executive_member" && u.executiveBranch === branch.value,
        );

        const secHTML = branchSecs.length
          ? branchSecs.map((u) => userCardHTML(u)).join("")
          : `<p class="vacant-text">— Vacant —</p>`;

        const execHTML = branchExecs.length
          ? branchExecs.map((u) => userCardHTML(u, true)).join("")
          : "";

        return `
        <div class="branch-block">
          <div class="red-arrow"><div class="line"></div><div class="head"></div></div>
          <div class="branch-title">${branch.label}</div>
          <div class="branch-users">${secHTML}</div>
          ${
            execHTML
              ? `<div class="exec-block">
                   ${branchExecs
                     .map(
                       (u) => `
                     <div class="exec-row">
                       <div class="red-arrow"><div class="line"></div><div class="head"></div></div>
                       ${userCardHTML(u)}
                     </div>
                   `,
                     )
                     .join("")}
                 </div>`
              : ""
          }
        </div>
      `;
      })
      .join("");

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Designation Hierarchy - ACC Career Club</title>
        <meta charset="UTF-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #ffffff;
            color: #3D444C;
            font-size: 11px;
            line-height: 1.4;
          }

          /* ---------- HEADER ---------- */
          .print-header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 3px double #994D35;
            margin-bottom: 14px;
            position: relative;
          }
          .print-header::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 5px;
            background: linear-gradient(90deg, #3D444C, #994D35, #D3A16D, #994D35, #3D444C);
          }
          .print-header .brand {
            font-size: 22px;
            font-weight: 800;
            color: #3D444C;
            letter-spacing: 0.5px;
            margin-top: 6px;
          }
          .print-header .brand span { color: #994D35; }
          .print-header .subtitle {
            font-size: 10px;
            color: #D3A16D;
            font-weight: 700;
            margin-top: 2px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .print-header .page-title {
            font-size: 14px;
            color: #3D444C;
            font-weight: 700;
            margin-top: 8px;
            padding: 5px 16px;
            display: inline-block;
            background: #E7E3D8;
            border-radius: 4px;
            border-left: 3px solid #994D35;
            border-right: 3px solid #994D35;
          }
          .print-meta {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #6B7280;
            margin-bottom: 14px;
            padding: 4px 0;
            border-bottom: 1px dashed #D3A16D;
          }
          .print-meta strong { color: #3D444C; }

          /* ---------- LEVEL TITLES ---------- */
          .level-title {
            display: inline-block;
            background: linear-gradient(135deg, #3D444C, #994D35);
            color: #E7E3D8 !important;
            font-weight: 700;
            font-size: 11px;
            padding: 4px 14px;
            border-radius: 4px;
            margin-bottom: 6px;
            letter-spacing: 0.4px;
            box-shadow: 0 2px 4px rgba(153, 77, 53, 0.25);
            border-left: 3px solid #D3A16D;
          }

          .branch-title {
            display: inline-block;
            background: #E7E3D8;
            color: #3D444C !important;
            font-weight: 700;
            font-size: 10px;
            padding: 3px 12px;
            border-radius: 4px;
            margin-bottom: 6px;
            border-left: 3px solid #994D35;
          }

          /* ---------- USER CARDS ---------- */
          .user-card {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #ffffff;
            border: 1px solid #D3A16D;
            border-left: 4px solid #994D35;
            border-radius: 6px;
            padding: 5px 8px;
            margin-bottom: 5px;
            width: 230px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            page-break-inside: avoid;
          }
          .user-card.exec {
            border-left: 4px solid #D3A16D;
          }
          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            background: linear-gradient(135deg, #3D444C, #994D35);
            color: #ffffff !important;
            font-weight: 700;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #D3A16D;
          }
          .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
          .user-info { flex: 1; min-width: 0; }
          .user-name {
            font-weight: 700;
            font-size: 11px;
            color: #3D444C !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .user-id {
            font-size: 9px;
            color: #994D35 !important;
            font-weight: 600;
          }
          .vacant-text {
            font-size: 10px;
            font-style: italic;
            color: #9CA3AF !important;
            margin-bottom: 5px;
            padding-left: 4px;
          }

          /* ---------- HIERARCHY LAYOUT ---------- */
          .hierarchy-section {
            margin-bottom: 14px;
          }

          /* Moderator block */
          .moderator-block {
            padding: 8px 10px;
            background: #F9FAFB;
            border-radius: 6px;
            margin-bottom: 14px;
            border-left: 4px solid #3D444C;
          }

          /* Prefect block — indented with left line */
          .prefect-block {
            position: relative;
            padding-left: 24px;
            margin-left: 10px;
            border-left: 2px solid #994D35;
            padding-top: 8px;
            padding-bottom: 8px;
          }
          .prefect-block > .red-arrow {
            top: 12px;
          }

          /* Assistant prefect block */
          .assistant-block {
            position: relative;
            padding-left: 24px;
            margin-left: 10px;
            border-left: 2px solid #994D35;
            margin-top: 10px;
            padding-top: 6px;
            padding-bottom: 6px;
          }
          .assistant-block > .red-arrow {
            top: 10px;
          }

          /* Branch container */
          .branches-container {
            position: relative;
            margin-top: 10px;
            padding-left: 24px;
            margin-left: 10px;
            border-left: 2px solid #994D35;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          /* Branch block */
          .branch-block {
            position: relative;
            padding-left: 28px;
            margin-left: 6px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .branch-block > .red-arrow {
            top: 4px;
          }
          .branch-users {
            margin-top: 4px;
          }

          /* Executive members under a branch */
          .exec-block {
            position: relative;
            padding-left: 26px;
            margin-left: 12px;
            margin-top: 6px;
            border-left: 2px solid #D3A16D;
            padding-top: 6px;
            padding-bottom: 6px;
          }
          .exec-row {
            position: relative;
            margin-bottom: 5px;
          }
          .exec-row .red-arrow {
            top: 12px;
          }

          /* ---------- ARROWS ---------- */
          .red-arrow {
            position: absolute;
            left: -24px;
            display: flex;
            align-items: center;
          }
          .red-arrow .line {
            width: 20px;
            height: 2px;
            background: #994D35;
          }
          .red-arrow .head {
            width: 0;
            height: 0;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
            border-left: 6px solid #994D35;
          }

          /* ---------- FOOTER ---------- */
          .print-footer {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 2px solid #D3A16D;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #6B7280;
          }
          .print-footer strong { color: #994D35; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="brand">🎓 ACC <span>Career Club</span></div>
          <div class="subtitle">Adamjee Cantonment College</div>
          <div class="page-title">Official Designation Hierarchy</div>
        </div>

        <div class="print-meta">
          <div><strong>Document:</strong> Designation &amp; Role Structure</div>
          <div><strong>Generated:</strong> ${currentDate}</div>
        </div>

        <!-- ===== MODERATOR ===== -->
        <div class="moderator-block">
          <div class="level-title">Moderator</div>
          ${moderatorHTML}
        </div>

        <!-- ===== PREFECT ===== -->
        <div class="prefect-block">
          <div class="red-arrow"><div class="line"></div><div class="head"></div></div>
          <div class="level-title">Prefect</div>
          ${prefectHTML}

          <!-- ===== ASSISTANT PREFECT ===== -->
          <div class="assistant-block">
            <div class="red-arrow"><div class="line"></div><div class="head"></div></div>
            <div class="level-title">Assistant Prefect</div>
            ${assistantHTML}
          </div>

          <!-- ===== BRANCHES ===== -->
          <div class="branches-container">
            ${branchesHTML}
          </div>
        </div>

        <div class="print-footer">
          <div>© ${new Date().getFullYear()} <strong>ACC Career Club</strong> — All Rights Reserved</div>
          <div>ccacc.vercel.app</div>
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
              window.onafterprint = function () { window.close(); };
            }, 400);
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const allRoleOptions = [
    ...CORE_ROLES.filter((r) => r.value !== "executive_member"),
    ...dynamicRoles.map((r) => ({ value: r.roleKey, label: r.displayName })),
    { value: "executive_member", label: "Executive Member" },
  ];

  const branchOptions = [
    { value: "itsecretary", label: "IT Secretary" },
    ...dynamicRoles.map((r) => ({ value: r.roleKey, label: r.displayName })),
  ];

  const memberOptions = regularMembers.map((u) => ({
    value: u._id,
    label: `${u.fullName} - ${u.studentId}`,
  }));

  // ==================== USER NODE ====================
  const UserNode = ({ user }) => {
    const isRemoving = removingUserId === user._id;
    return (
      <div
        className={`flex items-center gap-2.5 bg-[#E7E3D8]/40 px-2.5 py-2 rounded-md border border-[#D3A16D]/30 w-64 shadow-sm mb-2 group transition-all hover:shadow-md hover:border-[#D3A16D]/60 ${
          isRemoving ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <Avatar user={user} size="md" />

        <Link
          href={`/profile/${user._id}`}
          className="flex-1 overflow-hidden min-w-0"
        >
          <p className="font-semibold text-sm text-[#3D444C] group-hover:text-[#994D35] transition-colors truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-gray-500">{user.studentId}</p>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            handleRemoveUser(user._id);
          }}
          disabled={isRemoving}
          className="text-[#994D35] hover:text-red-700 p-1 ml-1 transition-colors disabled:opacity-50 print:hidden"
          title="Remove Designation"
        >
          {isRemoving ? (
            <FaSpinner size={12} className="animate-spin" />
          ) : (
            <FaTrash size={12} />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6 gap-3">
          <div>
            <Link
              href="/dashboard/settings"
              className="text-[#3D444C] hover:text-[#994D35] flex items-center mb-2 sm:mb-0 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C] flex items-center gap-3">
              <FaUserShield className="text-[#994D35]" /> Designation & Role
              Settings
            </h1>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 bg-[#3D444C] hover:bg-[#994D35] text-white font-semibold py-2.5 px-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FaPrint />
            Print as PDF (A4)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* LEFT SIDEBAR: FORMS */}
          <div className="lg:col-span-1 space-y-6 h-fit lg:sticky lg:top-4 print:hidden">
            {/* Manage Dynamic Roles */}
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#D3A16D]">
              <h2 className="text-lg font-bold text-[#3D444C] mb-4">
                Add Custom Role
              </h2>
              <form onSubmit={handleAddRole} className="space-y-4">
                <input
                  type="text"
                  placeholder="Role Username (e.g. event_sec)"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent outline-none transition-all"
                  value={newRoleKey}
                  onChange={(e) => setNewRoleKey(e.target.value)}
                  disabled={isAddingRole}
                />
                <input
                  type="text"
                  placeholder="Display Name (e.g. Event Secretary)"
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent outline-none transition-all"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  disabled={isAddingRole}
                />
                <button
                  type="submit"
                  disabled={isAddingRole}
                  className="w-full bg-[#D3A16D] hover:bg-[#994D35] text-white font-bold py-2 px-4 rounded text-sm flex justify-center items-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAddingRole ? (
                    <>
                      <FaSpinner className="animate-spin" /> Adding...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add Role
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Assign Member */}
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#3D444C]">
              <h2 className="text-lg font-bold text-[#3D444C] mb-4">
                Assign Member
              </h2>
              <form onSubmit={handleAssign} className="space-y-4">
                <div className="text-sm text-black">
                  <Select
                    options={memberOptions}
                    value={selectedUserId}
                    onChange={(selected) => setSelectedUserId(selected)}
                    placeholder="Search Name or ID..."
                    isClearable
                    isDisabled={isAssigning}
                    noOptionsMessage={() => "No active members found"}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: "#e5e7eb",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#D3A16D" },
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#E7E3D8" : "white",
                        color: "black",
                        cursor: "pointer",
                      }),
                    }}
                  />
                </div>

                <select
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent outline-none transition-all"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setSelectedBranch("");
                  }}
                  disabled={isAssigning}
                >
                  <option value="">-- Select Role --</option>
                  {allRoleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                {selectedRole === "executive_member" && (
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent outline-none transition-all"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    disabled={isAssigning}
                  >
                    <option value="">-- Select Parent Role (Branch) --</option>
                    {branchOptions.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full bg-[#3D444C] hover:bg-[#994D35] text-white font-bold py-2 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isAssigning ? (
                    <>
                      <FaSpinner className="animate-spin" /> Assigning...
                    </>
                  ) : (
                    "Assign"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: FLOWCHART */}
          <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-3 overflow-x-auto border-t-4 border-[#994D35]">
            <h2 className="text-xl font-bold text-[#3D444C] mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#994D35] rounded-full"></span>
              Designation Hierarchy
            </h2>

            {loading ? (
              <ShimmerFlowchart />
            ) : (
              <div ref={printRef} className="pl-4 pb-12 min-w-[600px]">
                {/* Moderator */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2 text-[#3D444C]">
                    Moderator
                  </h3>
                  {designatedUsers
                    .filter((u) => u.role === "moderator")
                    .map((u) => (
                      <UserNode key={u._id} user={u} />
                    ))}
                  {designatedUsers.filter((u) => u.role === "moderator")
                    .length === 0 && (
                    <p className="text-sm text-gray-400 italic mb-2 ml-1">
                      Vacant
                    </p>
                  )}
                </div>

                {/* Prefect */}
                <div className="relative pl-8 mb-4 border-l-2 border-[#994D35] ml-4">
                  <RedArrow />
                  <h3 className="font-bold text-lg mb-2 text-[#3D444C]">
                    Prefect
                  </h3>
                  {designatedUsers
                    .filter((u) => u.role === "prefect")
                    .map((u) => (
                      <UserNode key={u._id} user={u} />
                    ))}
                  {designatedUsers.filter((u) => u.role === "prefect")
                    .length === 0 && (
                    <p className="text-sm text-gray-400 italic mb-2 ml-1">
                      Vacant
                    </p>
                  )}

                  {/* Assistant Prefect */}
                  <div className="mt-4">
                    <h3 className="font-bold text-lg mb-2 text-[#3D444C]">
                      Assistant Prefect
                    </h3>
                    {designatedUsers
                      .filter((u) => u.role === "assistant_prefect")
                      .map((u) => (
                        <UserNode key={u._id} user={u} />
                      ))}
                    {designatedUsers.filter(
                      (u) => u.role === "assistant_prefect",
                    ).length === 0 && (
                      <p className="text-sm text-gray-400 italic mb-2 ml-1">
                        Vacant
                      </p>
                    )}
                  </div>

                  <div className="mt-6 relative">
                    <div className="absolute left-4 top-0 bottom-8 w-[2px] bg-[#994D35]"></div>

                    {/* Branches */}
                    {branchOptions.map((branch) => {
                      const branchSecs = designatedUsers.filter(
                        (u) => u.role === branch.value,
                      );
                      const branchExecs = designatedUsers.filter(
                        (u) =>
                          u.role === "executive_member" &&
                          u.executiveBranch === branch.value,
                      );
                      const isDynamic = branch.value !== "itsecretary";
                      const isDeleting = deletingRoleKey === branch.value;

                      return (
                        <div
                          key={branch.value}
                          className={`relative pl-12 mb-6 ml-4 transition-opacity ${
                            isDeleting ? "opacity-50" : ""
                          }`}
                        >
                          <RedArrow />
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-md text-[#3D444C]">
                              {branch.label}
                            </h3>
                            {isDynamic && (
                              <button
                                onClick={() => handleDeleteRole(branch.value)}
                                disabled={isDeleting}
                                className="text-[#994D35] hover:text-red-700 text-xs flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
                              >
                                {isDeleting ? (
                                  <>
                                    <FaSpinner className="mr-1 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <FaTrash className="mr-1" /> Delete Role
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {branchSecs.length === 0 && (
                            <p className="text-sm text-gray-400 italic mb-2 ml-1">
                              Vacant
                            </p>
                          )}
                          {branchSecs.map((u) => (
                            <UserNode key={u._id} user={u} />
                          ))}

                          <div className="relative mt-2">
                            {branchExecs.length > 0 && (
                              <div className="absolute left-4 top-0 bottom-4 w-[2px] bg-[#994D35]"></div>
                            )}
                            {branchExecs.map((u) => (
                              <div
                                key={u._id}
                                className="relative pl-12 mb-2 ml-4"
                              >
                                <RedArrow />
                                <UserNode user={u} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
