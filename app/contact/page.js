// app/contact/page.js
import React from "react";
import ContactUs from "./ContactUs";

export const metadata = {
  title: "Contact Us - ACC Career Club",
  description:
    "Get in touch with ACC Career Club at Adamjee Cantonment College. Reach the IT Secretary for technical help, Prefect or Assistant Prefect for administrative matters, or visit the college for in-person support.",
  keywords: [
    "ACC Career Club contact",
    "Adamjee Cantonment College",
    "Career Club IT secretary",
    "Career Club prefect",
    "Club moderator contact",
  ],
  openGraph: {
    title: "Contact ACC Career Club",
    description:
      "Reach the right person for technical support, administrative queries, or in-person visits at Adamjee Cantonment College.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#3D444C",
};

const ContactPage = () => {
  return <ContactUs />;
};

export default ContactPage;