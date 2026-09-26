// app/api/users/articles/[slug]/route.js
import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/app/lib/articles/queries";

export const revalidate = 120;

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 },
      );
    }

    const data = await getArticleBySlug(slug);
    if (!data?.article) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, ...data },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("❌ Public get article error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load article" },
      { status: 500 },
    );
  }
}