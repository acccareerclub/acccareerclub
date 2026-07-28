// app/settings/[userId]/page.js
import React from "react";
import SettingsClient from "./SettingsClient";
import { redirect } from "next/navigation";
import { getAuthToken, getCurrentUser } from "../../lib/authUtils";

export const metadata = {
  title: "Settings - ACC Career Club | Adamjee Cantonment College",
  description: "Manage your account settings and email preferences.",
};

export const viewport = {
  themeColor: "#3D444C",
};

const SettingsPage = async ({ params }) => {
  const { userId } = await params;

  // Server-side authentication check
  try {
    const token = await getAuthToken();
    
    if (!token) {
      // Redirect to login if not authenticated
      redirect(`/login?redirect=/settings/${userId}`);
    }

    const decoded = getCurrentUser(token);
    if (!decoded) {
      redirect(`/login?redirect=/settings/${userId}`);
    }

    // Check if the user is accessing their own settings
    if (decoded.userId !== userId) {
      // Redirect to their own settings page
      redirect(`/settings/${decoded.userId}`);
    }
  } catch (error) {
    console.error("Authentication error:", error);
    redirect("/login");
  }

  return <SettingsClient />;
};

export default SettingsPage;