// app/components/home/FacebookEmbaded.jsx
"use client";

import React, { useEffect } from "react";
import Script from "next/script";

const FacebookEmbaded = () => {
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-1">
      {/* 1. CRITICAL: Facebook SDK requires this element to exist */}
      <div id="fb-root"></div>

      {/* 2. Use Next.js native Script component for reliable loading */}
      <Script
        id="facebook-jssdk"
        strategy="lazyOnload"
        crossOrigin="anonymous"
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0"
        onLoad={() => {
          if (window.FB) {
            window.FB.init({
              xfbml: true,
              version: "v18.0",
            });
            window.FB.XFBML.parse();
          }
        }}
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-[#3D444C] to-[#58626e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                ACC Career Club
              </h3>
              <p className="text-blue-200 text-sm">
                Latest updates from our page
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 min-h-[500px] flex justify-center">
          <div className="mx-auto">
            <div
              className="fb-page w-full mx-auto"
              data-href="https://www.facebook.com/ACC.CareerClub/"
              data-tabs="timeline"
              data-width="500"
              data-height="600"
              data-small-header="false"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite="https://www.facebook.com/ACC.CareerClub/"
                className="fb-xfbml-parse-ignore"
              >
                <a href="https://www.facebook.com/ACC.CareerClub/">
                  Loading posts from Facebook...
                </a>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookEmbaded;
