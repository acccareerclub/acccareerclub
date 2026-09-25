// app/dashboard/settings/user-deletion-and-deactivation/page.js
import React from "react";
import UserDeleteAndDeactivateSettings from "./UserDeleteAndDeactivateSettings";

export const metadata = {
  title: "User Deletion & Deactivation - ACC Career Club",
  description:
    "Safely manage account state for ACC Career Club members with OTP-verified actions.",
};

export const viewport = {
  themeColor: "#3D444C",
};

const UserDeleteAndDeactivate = () => {
  return <UserDeleteAndDeactivateSettings />;
};

export default UserDeleteAndDeactivate;