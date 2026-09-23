// app/dashboard/certificates/page.js

import React from "react";
import AdminCertificatesClient from "./AdminCertificatesClient";


export const metadata = {
  title: "Certificates - ACC Career Club",
  description: "Manage certificates for ACC Career Club members",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AdminCertificates = () => {
  return <AdminCertificatesClient />;
};

export default AdminCertificates;
