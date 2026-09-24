// app/dashboard/reports/attendance/page.js
import React from "react";
import AttendanceReportsClient from "./AttendanceReportsClient";

export const metadata = {
  title: "Attendance Reports - ACC Career Club",
  description:
    "Event and session attendance insights, plus student-wise attendance history for ACC Career Club",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AttendanceReportsPage = () => {
  return <AttendanceReportsClient />;
};

export default AttendanceReportsPage;