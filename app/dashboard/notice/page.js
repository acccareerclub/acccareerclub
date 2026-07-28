// app/dashboard/notice/page.js
import React from "react";
import NoticeClient from "./NoticeClient";

export const metadata = {
  title: "Notice Management - ACC Career Club",
  description: "Create and manage notices for ACC Career Club members",
};

export const viewport = {
  themeColor: "#3D444C",
};

const Notice = () => {
  return <NoticeClient />;
};

export default Notice;