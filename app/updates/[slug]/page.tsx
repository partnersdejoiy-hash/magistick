import { notFound } from "next/navigation";
import { sql, ensureSchema, rowToPost, type DbPost } from "@/lib/db";
import ArticleView from "./ArticleView";

export const dynamic = "force-dynamic";

/** Single source of truth: posts live in Postgres now. */
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  await ensureSchema();
  const db = sql();
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body
    FROM posts WHERE slug = ${params.slug} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) notFound();
  const article: DbPost = rowToPost(rows[0]);

  const all = (await db`
    SELECT slug, title FROM posts ORDER BY date DESC, created_at DESC
  `) as { slug: string; title: string }[];
  const idx = all.findIndex((r) => r.slug === params.slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <ArticleView
      article={article}
      prev={prev ? ({ slug: prev.slug, title: prev.title } as DbPost) : undefined}
      next={next ? ({ slug: next.slug, title: next.title } as DbPost) : undefined}
    />
  );
}
