// app/articles/[slug]/not-found.js
import Link from "next/link";
import { FaNewspaper, FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E7E3D8] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#E7E3D8] flex items-center justify-center mb-5">
          <FaNewspaper className="text-3xl text-[#994D35]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#3D444C] mb-2">
          Article Not Found
        </h1>
        <p className="text-[#3D444C]/60 text-sm mb-8">
          The article you're looking for doesn't exist or may have been removed.
        </p>
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 bg-[#994D35] hover:bg-[#3D444C] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <FaArrowLeft /> Back to Articles
        </Link>
      </div>
    </div>
  );
}