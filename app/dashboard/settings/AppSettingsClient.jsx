// app/dashboard/settings/AppSettingsClient.jsx

import DashboardMenu from "@/app/components/layout/DashboardMenu";
import Link from "next/link";
import React from "react";
import {
  FaBriefcase,
  FaUsersSlash ,
  FaCog,
  FaArrowRight,
  FaQrcode 
} from "react-icons/fa";
import { TiUserDelete } from "react-icons/ti";

const AppSettingsClient = () => {
  // Settings items with icons, descriptions, and links
  const settingsItems = [
    {
      id: "designation",
      title: "Designation Settings",
      description: "Customize designations and roles for members.",
      icon: FaBriefcase,
      color: "#994D35",
      link: "/dashboard/settings/designation",
    },
    {
      id: "alumni",
      title: "Alumni Management",
      description: "Manage and connect with our alumni network.",
      icon: FaUsersSlash,
      color: "#994D35",
      link: "/dashboard/settings/alumni",
    },
    {
      id: "qrgenerator",
      title: "QR Code Generator",
      description: "Generate QR Code With Link.",
      icon: FaQrcode ,
      color: "#3D444C",
      link: "/dashboard/settings/qrgenerator",
    },
    {
      id: "user-deletion-and-deactivation",
      title: "User Deletion, Deactivation & Reactivation",
      description: "Deactivate & Delete Users.",
      icon: TiUserDelete,
      color: "#994D35",
      link: "/dashboard/settings/user-deletion-and-deactivation",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7E3D8] via-[#E7E3D8]/90 to-[#D3A16D]/20 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              App Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Customize your app settings and preferences to enhance your
              experience.
            </p>
          </div>
        </div>

        {/* Body - Settings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {settingsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.id} href={item.link} className="group">
                <div className="relative bg-white shadow-md hover:shadow-2xl rounded-2xl p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
                  {/* Hover gradient background */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}, ${item.color})`,
                    }}
                  />

                  {/* Decorative circle */}
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: item.color }}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 mb-4"
                      style={{
                        backgroundColor: `${item.color}15`,
                        border: `2px solid ${item.color}30`,
                      }}
                    >
                      <IconComponent
                        className="text-xl md:text-2xl"
                        style={{ color: item.color }}
                      />
                    </div>

                    {/* Title */}
                    <h2 className="text-base md:text-lg font-bold text-[#3D444C] mb-2 group-hover:text-[#994D35] transition-colors">
                      {item.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="flex items-center gap-2 text-[#994D35] text-xs md:text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                      <span>Open</span>
                      <FaArrowRight className="text-xs" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppSettingsClient;