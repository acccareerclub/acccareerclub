// app/all-notice/[noticeId]/page.js
import React from "react";
import SingleNotice from "./SingleNotice";

export async function generateMetadata({ params }) {
  const { noticeId } = await params;
  return {
    title: `Notice - ACC Career Club`,
    description: "View notice details",
  };
}

const SingleNoticePage = () => {
  return <SingleNotice />;
};

export default SingleNoticePage;