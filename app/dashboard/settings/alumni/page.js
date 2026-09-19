// app/dashboard/settings/alumni/page.js
import React from "react";
import AlumniClient from "./AlumniClient";

export const metadata = {
  title: "Alumni Settings - ACC Career Club",
  description: "Manage settings for ACC Career Club alumni",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AlumniSettings = () => {
  return <AlumniClient />;
};

export default AlumniSettings;
