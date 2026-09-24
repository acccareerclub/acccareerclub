// app/dashboard/DashboardClient.jsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaUsers,
  FaUserCheck,
  FaUserPlus,
  FaGraduationCap,
  FaBuilding,
  FaEnvelope,
  FaBriefcase,
  FaCalendarAlt,
  FaChartLine,
  FaUserGraduate,
  FaUserCog,
  FaShieldAlt,
  FaLock,
  FaClipboardList,
  FaBullhorn,
  FaCertificate,
  FaTrophy,
  FaEye,
  FaStar,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import Link from "next/link";
import DashboardMenu from "../components/layout/DashboardMenu";
import toast from "react-hot-toast";

const ALLOWED_ROLES = [
  "prefect",
  "itsecretary",
  "modarator",
  "assistant_prefect",
];

const DashboardClient = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // ---------- AUTH GUARDS ----------
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated && user && user.role === "student") {
      toast.error("You don't have access to the dashboard");
      router.push("/");
    }
  }, [loading, isAuthenticated, user, router]);

  // ---------- FETCH STATS ----------
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (!ALLOWED_ROLES.includes(user.role)) return;

    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const res = await fetch("/api/secure/statistics", {
          credentials: "include",
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setStats(data);
        } else {
          setStatsError(data.message || "Failed to load statistics");
        }
      } catch {
        if (!cancelled) setStatsError("Failed to load statistics");
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#994D35] border-t-transparent"></div>
      </div>
    );
  }

  if (!ALLOWED_ROLES.includes(user?.role)) {
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
            reserved for Prefects, IT Secretaries, Moderators, and Assistant
            Prefects.
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

  // ---------- ROLE DISPLAY ----------
  const getRoleDisplay = (role) => {
    const names = {
      prefect: "Prefect",
      itsecretary: "IT Secretary",
      modarator: "Moderator",
      assistant_prefect: "Assistant Prefect",
    };
    return names[role] || role;
  };

  // ---------- QUICK ACTIONS ----------
  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all registered users",
      icon: FaUsers,
      link: "/dashboard/users",
      color: "from-blue-500 to-blue-600",
      roles: ["prefect", "itsecretary", "modarator", "assistant_prefect"],
    },
    {
      title: "Post Jobs",
      description: "Create and manage job listings",
      icon: FaBriefcase,
      link: "/dashboard/jobs",
      color: "from-green-500 to-green-600",
      roles: ["prefect", "itsecretary", "modarator", "assistant_prefect"],
    },
    {
      title: "Manage Companies",
      description: "Add and manage partner companies",
      icon: FaBuilding,
      link: "/dashboard/companies",
      color: "from-purple-500 to-purple-600",
      roles: ["prefect", "itsecretary", "modarator", "assistant_prefect"],
    },
    {
      title: "Send Newsletter",
      description: "Send updates to all subscribers",
      icon: FaEnvelope,
      link: "/dashboard/newsletter",
      color: "from-orange-500 to-orange-600",
      roles: ["prefect", "itsecretary"],
    },
    {
      title: "Attendance Reports",
      description: "Event & session attendance insights and student history",
      icon: FaClipboardList,
      link: "/dashboard/reports/attendance",
      color: "from-[#994D35] to-[#D3A16D]",
      roles: ["prefect", "itsecretary", "modarator", "assistant_prefect"],
    },
  ];

  const filteredActions = quickActions.filter((action) =>
    action.roles.includes(user?.role),
  );

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* ---------- Header ---------- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
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
              ! Here's what's happening across the club.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/profile/${user?.id}`}
              className="flex items-center gap-2 bg-[#994D35] text-white px-5 py-2.5 rounded-lg hover:bg-[#D3A16D] transition-all duration-300 hover:scale-105 shadow-md"
            >
              <FaUser />
              <span>View Profile</span>
            </Link>
          </div>
        </div>

        {/* ---------- Stats Error / Loading ---------- */}
        {statsError && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
            {statsError}
          </div>
        )}

        {statsLoading || !stats ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="animate-spin text-4xl text-[#994D35]" />
          </div>
        ) : (
          <>
            {/* ============================================
                HERO STAT CARDS (4 primary metrics)
            ============================================ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <HeroStat
                label="Total Members"
                value={stats.users.total}
                sub={`${stats.users.active} active`}
                icon={FaUsers}
                color="bg-[#994D35]"
                delta={stats.users.growthPct}
              />
              <HeroStat
                label="Events & Sessions"
                value={stats.combined.totalEventsAndSessions}
                sub={`${stats.events.upcoming + stats.sessions.upcoming} upcoming`}
                icon={FaCalendarAlt}
                color="bg-[#3D444C]"
              />
              <HeroStat
                label="Total Attendances"
                value={stats.combined.totalAttendances}
                sub={`${stats.events.totalMemberAttendances} events • ${stats.sessions.totalMemberAttendances} sessions`}
                icon={FaUserCheck}
                color="bg-green-600"
              />
              <HeroStat
                label="Certificates"
                value={stats.certificates.total}
                sub={`${stats.certificates.publishRate}% published`}
                icon={FaCertificate}
                color="bg-[#D3A16D]"
              />
            </div>

            {/* ============================================
                USER METRICS GRID
            ============================================ */}
            <SectionTitle icon={FaUsers} title="Member Insights" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
              <MiniStat
                label="Verified"
                value={stats.users.verified}
                icon={FaCheckCircle}
                tone="green"
              />
              <MiniStat
                label="Unverified"
                value={stats.users.unverified}
                icon={FaTimesCircle}
                tone="orange"
              />
              <MiniStat
                label="New This Month"
                value={stats.users.thisMonth}
                icon={FaUserPlus}
                tone="blue"
              />
              <MiniStat
                label="Dynamic Roles"
                value={stats.dynamicRoles.total}
                icon={FaUserCog}
                tone="purple"
              />
              <MiniStat
                label="Departments"
                value={stats.users.topDepartments.length}
                icon={FaBuilding}
                tone="slate"
              />
              <MiniStat
                label="Role Types"
                value={stats.users.byRole.length}
                icon={FaShieldAlt}
                tone="red"
              />
            </div>

            {/* ============================================
                TWO-COLUMN: Role breakdown + Departments
            ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DistributionCard
                title="Members by Role"
                icon={FaShieldAlt}
                items={stats.users.byRole.map((r) => ({
                  label: getRoleDisplay(r.role),
                  count: r.count,
                }))}
                total={stats.users.total}
                color="#994D35"
              />
              <DistributionCard
                title="Top Departments"
                icon={FaGraduationCap}
                items={stats.users.topDepartments.map((d) => ({
                  label: d.department,
                  count: d.count,
                }))}
                total={stats.users.total}
                color="#3D444C"
              />
            </div>

            {/* ============================================
                EVENTS + SESSIONS
            ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <EventsPanel stats={stats.events} type="event" />
              <EventsPanel stats={stats.sessions} type="session" />
            </div>

            {/* ============================================
                NOTICES + CERTIFICATES
            ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Notices */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#D3A16D]/20 flex items-center justify-center">
                    <FaBullhorn className="text-[#994D35]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D444C]">Notices</h3>
                    <p className="text-xs text-gray-500">
                      Announcements & updates
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatPill
                    label="Total"
                    value={stats.notices.total}
                    icon={FaBullhorn}
                    tone="slate"
                  />
                  <StatPill
                    label="Active"
                    value={stats.notices.active}
                    icon={FaCheckCircle}
                    tone="green"
                  />
                  <StatPill
                    label="Urgent"
                    value={stats.notices.urgent}
                    icon={FaStar}
                    tone="red"
                  />
                  <StatPill
                    label="This Month"
                    value={stats.notices.thisMonth}
                    icon={FaCalendarAlt}
                    tone="blue"
                  />
                </div>
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#994D35]/15 flex items-center justify-center">
                    <FaCertificate className="text-[#994D35]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D444C]">Certificates</h3>
                    <p className="text-xs text-gray-500">
                      Issued & published
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatPill
                    label="Total"
                    value={stats.certificates.total}
                    icon={FaCertificate}
                    tone="slate"
                  />
                  <StatPill
                    label="Published"
                    value={stats.certificates.published}
                    icon={FaEye}
                    tone="green"
                  />
                  <StatPill
                    label="Drafts"
                    value={stats.certificates.draft}
                    icon={FaStar}
                    tone="orange"
                  />
                  <StatPill
                    label="Emailed"
                    value={stats.certificates.emailed}
                    icon={FaEnvelope}
                    tone="blue"
                  />
                </div>

                {/* Publish rate bar */}
                <div className="mt-4 pt-4 border-t border-[#3D444C]/10">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">
                      Publish rate
                    </span>
                    <span className="font-bold text-[#3D444C]">
                      {stats.certificates.publishRate}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E7E3D8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#994D35] to-[#D3A16D] rounded-full transition-all duration-500"
                      style={{ width: `${stats.certificates.publishRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================
                TOP ATTENDEES
            ============================================ */}
            {stats.users.topAttendees.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#D3A16D]/20 flex items-center justify-center">
                    <FaTrophy className="text-[#994D35]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3D444C]">
                      Top Attendees
                    </h3>
                    <p className="text-xs text-gray-500">
                      Most active members across events & sessions
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {stats.users.topAttendees.map((u, i) => (
                    <div
                      key={u._id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#E7E3D8]/40 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0
                            ? "bg-[#D3A16D] text-[#3D444C]"
                            : i === 1
                              ? "bg-[#E7E3D8] text-[#3D444C]"
                              : i === 2
                                ? "bg-[#994D35]/20 text-[#994D35]"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#3D444C] truncate">
                          {u.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.studentId} • {u.department}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#994D35]">
                          {u.totalAttendance}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                          attended
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================
                QUICK ACTIONS
            ============================================ */}
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
                        <div
                          className={`bg-gradient-to-r ${action.color} p-4`}
                        >
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
                  <p className="text-gray-500">
                    No quick actions available for your role.
                  </p>
                </div>
              )}
            </div>

            {/* ============================================
                RECENT ACTIVITY
            ============================================ */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#3D444C]">
                  Recent Activity
                </h2>
                <span className="text-xs text-gray-400">
                  Updated{" "}
                  {new Date(stats.generatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm py-6 text-center">
                  No recent activity.
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.recentActivity.map((a, i) => {
                    const cfg = activityConfig(a.kind);
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#E7E3D8]/30 transition-colors"
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`${cfg.text} text-sm`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-[#3D444C] truncate">
                              {a.title}
                            </p>
                            <span className="text-xs text-gray-400 shrink-0">
                              {timeAgo(a.at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {a.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   SMALL COMPONENTS
   ============================================================ */

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-1 h-6 bg-[#994D35] rounded-full" />
    <Icon className="text-[#D3A16D]" />
    <h2 className="text-lg font-bold text-[#3D444C]">{title}</h2>
  </div>
);

const HeroStat = ({ label, value, sub, icon: Icon, color, delta }) => (
  <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="text-white text-lg" />
      </div>
      {typeof delta === "number" && delta !== 0 && (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            delta > 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {delta > 0 ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(delta)}%
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
      {label}
    </p>
    <p className="text-3xl font-bold text-[#3D444C] mt-1">
      {value.toLocaleString()}
    </p>
    {sub && <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>}
  </div>
);

const toneMap = {
  green: "bg-green-100 text-green-700",
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
  slate: "bg-[#E7E3D8] text-[#3D444C]",
};

const MiniStat = ({ label, value, icon: Icon, tone = "slate" }) => (
  <div className="bg-white rounded-xl shadow-md p-3 flex items-center gap-3">
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      <Icon className="text-xs" />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-bold text-[#3D444C] leading-none">
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-0.5 truncate">
        {label}
      </p>
    </div>
  </div>
);

const StatPill = ({ label, value, icon: Icon, tone = "slate" }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FAF8F3]">
    <div
      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      <Icon className="text-[10px]" />
    </div>
    <div className="min-w-0">
      <p className="text-base font-bold text-[#3D444C] leading-none">
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium truncate">
        {label}
      </p>
    </div>
  </div>
);

const DistributionCard = ({ title, icon: Icon, items, total, color }) => {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          <Icon style={{ color }} />
        </div>
        <div>
          <h3 className="font-bold text-[#3D444C]">{title}</h3>
          <p className="text-xs text-gray-500">
            {items.length} categor{items.length !== 1 ? "ies" : "y"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">
          No data available.
        </p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 6).map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-[#3D444C] capitalize truncate pr-2">
                    {item.label}
                  </span>
                  <span className="text-gray-500 shrink-0">
                    {item.count}{" "}
                    <span className="text-gray-400">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#E7E3D8] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(item.count / max) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EventsPanel = ({ stats, type }) => {
  const isEvent = type === "event";
  const Icon = isEvent ? FaCalendarAlt : FaVideo;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-5">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isEvent ? "bg-blue-100" : "bg-purple-100"
          }`}
        >
          <Icon className={isEvent ? "text-blue-600" : "text-purple-600"} />
        </div>
        <div>
          <h3 className="font-bold text-[#3D444C]">
            {isEvent ? "Events" : "Sessions"}
          </h3>
          <p className="text-xs text-gray-500">
            {stats.total} total • {stats.thisMonth} this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatusPill
          label="Upcoming"
          value={stats.upcoming}
          color="bg-green-500"
        />
        <StatusPill
          label="Completed"
          value={stats.completed}
          color="bg-[#3D444C]"
        />
        <StatusPill
          label="Cancelled"
          value={stats.cancelled}
          color="bg-red-500"
        />
      </div>

      <div className="pt-4 border-t border-[#3D444C]/10 flex items-center justify-between text-sm">
        <span className="text-gray-500 flex items-center gap-1.5">
          <FaStar className="text-[#D3A16D] text-xs" />
          {stats.featured} featured
        </span>
        <span className="text-gray-500">
          <span className="font-bold text-[#3D444C]">
            {stats.totalMemberAttendances.toLocaleString()}
          </span>{" "}
          attendances
        </span>
      </div>
    </div>
  );
};

const StatusPill = ({ label, value, color }) => (
  <div className="text-center p-3 rounded-xl bg-[#FAF8F3]">
    <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-1.5`} />
    <p className="text-xl font-bold text-[#3D444C] leading-none">
      {value.toLocaleString()}
    </p>
    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mt-1">
      {label}
    </p>
  </div>
);

/* ============================================================
   HELPERS
   ============================================================ */

const activityConfig = (kind) => {
  switch (kind) {
    case "event":
      return {
        icon: FaCalendarAlt,
        bg: "bg-blue-100",
        text: "text-blue-600",
      };
    case "session":
      return { icon: FaVideo, bg: "bg-purple-100", text: "text-purple-600" };
    case "notice":
      return {
        icon: FaBullhorn,
        bg: "bg-orange-100",
        text: "text-orange-600",
      };
    case "certificate":
      return {
        icon: FaCertificate,
        bg: "bg-green-100",
        text: "text-green-600",
      };
    default:
      return {
        icon: FaChartLine,
        bg: "bg-gray-100",
        text: "text-gray-600",
      };
  }
};

const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export default DashboardClient;