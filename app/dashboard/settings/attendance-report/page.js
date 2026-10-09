// app/dashboard/settings/attendance-report/AttendanceReportClient.jsx

import React from 'react'
import AttendanceReportClient from "./AttendanceReportClient"

export const metadata = {
  title: "Alumni Settings - ACC Career Club",
  description: "Manage settings for ACC Career Club alumni",
};

const page = () => {
  return (
    <div>
        <AttendanceReportClient />
    </div>
  )
}

export default page