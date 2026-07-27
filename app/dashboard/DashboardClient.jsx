// app/dashboard/DashboardClient.jsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaGraduationCap,
  FaBuilding,
  FaEnvelope,
  FaBriefcase,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaUserGraduate,
  FaUserCog,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";
import Link from "next/link";
import DashboardMenu from "../components/layout/DashboardMenu";
import toast from "react-hot-toast";

const DashboardClient = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Allowed roles for dashboard access
  const allowedRoles = ["prefect", "itsecretary", "modarator"];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Redirect students away from dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === "student") {
        toast.error("You don't have access to the dashboard");
        router.push("/");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user has access
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FaLock className="text-4xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#3D444C] mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the dashboard. This area is
            reserved for Prefects, IT Secretaries, and Moderators.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get role display name
  const getRoleDisplay = (role) => {
    const names = {
      prefect: "Prefect",
      itsecretary: "IT Secretary",
      modarator: "Moderator",
    };
    return names[role] || role;
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const icons = {
      prefect: <FaUserGraduate className="text-white text-2xl" />,
      itsecretary: <FaUserCog className="text-white text-2xl" />,
      modarator: <FaShieldAlt className="text-white text-2xl" />,
    };
    return icons[role] || <FaUser className="text-white text-2xl" />;
  };

  // Stats cards data based on role
  const stats = [
    {
      title: "Total Users",
      value: "1,284",
      icon: FaUsers,
      color: "bg-blue-500",
      change: "+12% this month",
    },
    {
      title: "Active Jobs",
      value: "48",
      icon: FaBriefcase,
      color: "bg-green-500",
      change: "+5% this week",
    },
    {
      title: "Companies",
      value: "36",
      icon: FaBuilding,
      color: "bg-purple-500",
      change: "+8% this month",
    },
    {
      title: "Job Applications",
      value: "156",
      icon: FaGraduationCap,
      color: "bg-orange-500",
      change: "+3% this week",
    },
  ];

  // Quick actions based on role
  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all registered users",
      icon: FaUsers,
      link: "/dashboard/users",
      color: "from-blue-500 to-blue-600",
      roles: ["prefect", "itsecretary", "modarator"],
    },
    {
      title: "Post Jobs",
      description: "Create and manage job listings",
      icon: FaBriefcase,
      link: "/dashboard/jobs",
      color: "from-green-500 to-green-600",
      roles: ["prefect", "itsecretary", "modarator"],
    },
    {
      title: "Manage Companies",
      description: "Add and manage partner companies",
      icon: FaBuilding,
      link: "/dashboard/companies",
      color: "from-purple-500 to-purple-600",
      roles: ["prefect", "itsecretary", "modarator"],
    },
    {
      title: "Send Newsletter",
      description: "Send updates to all subscribers",
      icon: FaEnvelope,
      link: "/dashboard/newsletter",
      color: "from-orange-500 to-orange-600",
      roles: ["prefect", "itsecretary"],
    },
  ];

  // Filter quick actions based on user role
  const filteredActions = quickActions.filter(
    (action) => action.roles.includes(user?.role) || action.roles.includes("all")
  );

  // Recent activity (admin view)
  const recentActivity = [
    {
      id: 1,
      action: "New user registered",
      time: "2 hours ago",
      description: "Md. Rafiqul Islam joined the club",
    },
    {
      id: 2,
      action: "Job posted",
      time: "1 day ago",
      description: "New Software Engineer position added",
    },
    {
      id: 3,
      action: "Company added",
      time: "3 days ago",
      description: "Google added as partner company",
    },
    {
      id: 4,
      action: "Newsletter sent",
      time: "5 days ago",
      description: "Weekly career update sent to 1,284 subscribers",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Menu */}
        <DashboardMenu />

        {/* Header with Role Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl md:text-4xl font-bold text-[#3D444C]">
                Dashboard Overview
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#994D35] text-white text-xs md:text-sm font-semibold rounded-full">
                <FaShieldAlt className="text-[#D3A16D]" />
                {getRoleDisplay(user?.role)}
              </span>
            </div>
            <p className="text-gray-600 text-sm md:text-md mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-[#994D35]">
                {user?.fullName}
              </span>
              ! You have administrative access to manage the Career Club.
            </p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#D3A16D] transition-all duration-300 hover:scale-105 shadow-md"
            >
              <FaUser />
              <span>View Profile</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-[#3D444C] mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="text-white text-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#3D444C] mb-4">
            Quick Actions
          </h2>
          {filteredActions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    href={action.link}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`bg-gradient-to-r ${action.color} p-4`}>
                      <Icon className="text-white text-2xl" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#3D444C]">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-gray-500">No quick actions available for your role.</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#3D444C]">
              Recent Activity
            </h2>
            <button className="text-sm text-[#994D35] hover:text-[#D3A16D] transition-colors">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 p-3 rounded-lg hover:bg-[#E7E3D8]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#E7E3D8] flex items-center justify-center flex-shrink-0">
                  <FaChartLine className="text-[#994D35] text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#3D444C]">
                      {activity.action}
                    </p>
                    <span className="text-xs text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;