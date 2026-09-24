// app/dashboard/articles/AdminArticles.jsx

import DashboardMenu from "@/app/components/layout/DashboardMenu";
import React from "react";

const AdminArticles = () => {
  return (
    <div className="min-h-screen bg-[#E7E3D8] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <DashboardMenu />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#3D444C]">
              Articles Management
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminArticles;
