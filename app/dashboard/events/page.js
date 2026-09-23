// app/dashboard/events/page.js
import React from "react";
import EventsClient from "./EventClient";


export const metadata = {
  title: "Events - ACC Career Club",
  description: "Manage events for ACC Career Club members",
};

export const viewport = {
  themeColor: "#3D444C",
};

const AdminEvents = () => {
  return <EventsClient />;
};

export default AdminEvents;
