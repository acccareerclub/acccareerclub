// app/dashboard/settings/page.js
import React from "react";
import AppSettingsClient from "./AppSettingsClient";

export const metadata = {
  title: "App Settings- ACC Career Club",
  description: "Manage settings for ACC Career Club members",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AppSettings = () => {
  return <AppSettingsClient />;
};

export default AppSettings;
