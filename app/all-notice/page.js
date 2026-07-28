// app/all-notice/page.js
import React from "react";
import AllNoticeClient from "./AllNoticeClient";

export const metadata = {
  title: "All Notices - ACC Career Club | Adamjee Cantonment College",
  description: "View all notices and announcements from ACC Career Club",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AllNoticePage = () => {
  return <AllNoticeClient />;
};

export default AllNoticePage;