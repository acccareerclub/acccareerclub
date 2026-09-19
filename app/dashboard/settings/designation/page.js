// app/dashboard/settings/designation/page.js

import React from "react";
import DesignationClient from "./DesignationClient";

export const metadata = {
  title: "Designation - ACC Career Club",
  description: "Manage settings for ACC Career Club members",
};

export const viewport = {
  themeColor: "#3D444C",
};

const Designation = () => {
  return (
    <div>
      <DesignationClient />
    </div>
  );
};

export default Designation;
