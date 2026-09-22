// app/dashboard/sessions/page.js
import React from "react";
import SessionsClient from "./SessionsClient";

export const metadata = {
  title: "Sessions - ACC Career Club",
  description: "Manage sessions for ACC Career Club members",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AdminSessions = () => {
  return <SessionsClient />;
};

export default AdminSessions;
