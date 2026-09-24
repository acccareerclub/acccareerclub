// app/dashboard/settings/qrgenerator/page.js
import React from "react";
import QRGenerator from "./QRGenerator";

export const metadata = {
  title: "QR Code Generator - ACC Career Club",
  description:
    "Generate high-resolution QR codes from any text or URL and download them instantly.",
};

export const viewport = {
  themeColor: "#3D444C",
};

const QRGeneratorPage = () => {
  return <QRGenerator />;
};

export default QRGeneratorPage;