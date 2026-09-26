// app/lib/articles/queries.js
import { connectToDatabase } from "@/app/lib/mongodb";
import Article from "@/app/models/Article";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Fetch a single published article + its related reads + categories.
 * Returns null if not found.
 */
export async function getArticleBySlug(slug) {
  if (!slug) return null;

  await connectToDatabase();

  const article = await Article.findOne({
    slug: String(slug).toLowerCase(),
    status: "published",
    isDeleted: false,
  }).lean();

  if (!article) return null;

  // ---------- Related reads ----------
  const tagList = (article.tags || []).filter(Boolean);

  const [sameCategory, sameTags] = await Promise.all([
    Article.find({
      _id: { $ne: article._id },
      status: "published",
      isDeleted: false,
      category: article.category,
    })
      .select(
        "title slug thumbnail category author.fullName author.type publishedAt createdAt",
      )
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean(),
    tagList.length
      ? Article.find({
          _id: { $ne: article._id },
          status: "published",
          isDeleted: false,
          tags: { $in: tagList },
        })
        .select(
          "title slug thumbnail category author.fullName author.type publishedAt createdAt",
        )
        .sort({ publishedAt: -1 })
        .limit(6)
        .lean()
      : Promise.resolve([]),
  ]);

  const seen = new Set();
  const related = [];
  for (const a of [...sameCategory, ...sameTags]) {
    const key = a._id.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    related.push(a);
    if (related.length >= 6) break;
  }

  if (related.length < 6) {
    const latest = await Article.find({
      _id: { $ne: article._id, $nin: related.map((r) => r._id) },
      status: "published",
      isDeleted: false,
    })
      .select(
        "title slug thumbnail category author.fullName author.type publishedAt createdAt",
      )
      .sort({ publishedAt: -1 })
      .limit(6 - related.length)
      .lean();
    related.push(...latest);
  }

  // ---------- Read time ----------
  const plain = stripHtml(article.content);
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.round(words / 200));

  // ---------- Categories ----------
  const categories = await Article.distinct("category", {
    status: "published",
    isDeleted: false,
  });

  return {
    article: { ...article, readTimeMinutes },
    related,
    categories: categories.filter(Boolean).sort(),
  };
}

export { stripHtml };