// app/dashboard/users/UsersClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaTrash,
  FaEye,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaUser,
  FaUserGraduate,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaUniversity,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaClock,
  FaSpinner,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Link from "next/link";
import DashboardMenu from "../../components/layout/DashboardMenu";
import Image from "next/image";
import AddUserModal from "../../components/AddUserModal";

const UsersClient = () => {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [unverifiedCount, setUnverifiedCount] = useState(0);
  const [filterRole, setFilterRole] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleUser, setToggleUser] = useState(null);
  const [toggleReason, setToggleReason] = useState("");
  const [toggleAction, setToggleAction] = useState(null); // 'activate' or 'deactivate'
  const [verifyLoad, setVerifyLoad] = useState(null);

  const handleUserAdded = () => {
    fetchUsers();
  };

  const roles = ["student", "prefect", "itsecretary", "modarator"];
  const roleColors = {
    student: "bg-green-100 text-green-700",
    prefect: "bg-blue-100 text-blue-700",
    itsecretary: "bg-purple-100 text-purple-700",
    modarator: "bg-orange-100 text-orange-700",
  };
  const roleLabels = {
    student: "Student",
    prefect: "Prefect",
    itsecretary: "IT Secretary",
    modarator: "Moderator",
  };

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (!authLoading && isAuthenticated) {
      const allowedRoles = ["prefect", "itsecretary", "modarator"];
      if (!allowedRoles.includes(authUser?.role)) {
        router.push("/");
      }
    }
  }, [authLoading, isAuthenticated, authUser, router]);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = `/api/secure/users?page=${currentPage}&limit=50&search=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        setTotalUsers(data.pagination.total);
        setUnverifiedCount(data.unverifiedCount);
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
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // Handle verify user
  const handleVerify = async (userId) => {
    if (!confirm("Are you sure you want to verify this user?")) return;

    setVerifyLoad(userId);
    try {
      const response = await fetch("/api/secure/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action: "verify",
        }),
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
      console.error("Verify user error:", error);
      toast.error("Failed to verify user");
    } finally {
      setVerifyLoad(null);
    }
  };

  // Handle toggle active status
  const handleToggleActive = async () => {
    if (!toggleUser) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/secure/users/toggle-active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error("Toggle active error:", error);
      toast.error("Failed to update account status");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/secure/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
      console.error("Delete user error:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter users by role
  const filteredUsers = users.filter((user) => {
    if (filterRole === "all") return true;
    return user.role === filterRole;
  });

  // Sort: unverified first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a.isVerified === b.isVerified) return 0;
    return a.isVerified ? 1 : -1;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const allowedRoles = ["prefect", "itsecretary", "modarator"];
  if (!allowedRoles.includes(authUser?.role)) {
    return null;
  }

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
              Manage and verify ACC Career Club members
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
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
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E7E3D8]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#3D444C] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#3D444C] uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#3D444C] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#3D444C] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#3D444C] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-[#3D444C] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No users found matching your search."
                        : "No users found."}
                    </td>
                  </tr>
                ) : (
                  sortedUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-[#E7E3D8]/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-[#994D35] text-white flex items-center justify-center font-semibold">
                            {user?.personalInfo?.profilePicture ? (
                              <div className="relative w-full h-full aspect-square">
                                <Image
                                  src={user?.personalInfo?.profilePicture}
                                  alt="Profile Picture"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                />
                              </div>
                            ) : (
                              user.fullName?.[0]
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#3D444C]">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-400">
                              {user.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {user.studentId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{user.department}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || "bg-gray-100 text-gray-700"}`}
                        >
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {user.isVerified ? (
                              <FaCheckCircle className="text-xs" />
                            ) : (
                              <FaClock className="text-xs" />
                            )}
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive !== false
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.isActive !== false ? (
                              <FaCheckCircle className="text-xs" />
                            ) : (
                              <FaTimesCircle className="text-xs" />
                            )}
                            {user.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/profile/${user._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <FaEye />
                          </Link>

                          {/* Toggle Active/Inactive Button */}
                          <button
                            onClick={() => {
                              setToggleUser(user);
                              setToggleAction(
                                user.isActive !== false
                                  ? "deactivate"
                                  : "activate",
                              );
                              setShowToggleModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive !== false
                                ? "text-orange-600 hover:bg-orange-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={
                              user.isActive !== false
                                ? "Deactivate Account"
                                : "Activate Account"
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
                              onClick={() => handleVerify(user._id)}
                              disabled={verifyLoad === user?._id}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Verify User"
                            >
                              {verifyLoad === user?._id ? (
                                <FaSpinner />
                              ) : (
                                <FaUserCheck />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * 50 + 1} -{" "}
                {Math.min(currentPage * 50, totalUsers)} of {totalUsers} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronLeft className="text-sm" />
                </button>
                <span className="px-3 py-2 text-sm font-medium text-[#3D444C]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaChevronRight className="text-sm" />
                </button>
              </div>
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

      {/* Toggle Active/Inactive Modal */}
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
