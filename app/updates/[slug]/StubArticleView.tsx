"use client";

import { notFound } from "next/navigation";
import { usePosts } from "@/lib/posts-store";
import ArticleView from "./ArticleView";

/**
 * Fallback for stub-created posts (Manage posts UI). Seed slugs are handled
 * statically by page.tsx; anything created in the browser only exists in the
 * localStorage delta, so it renders here on the client.
 * TODO(phase-2): single server path once posts are API-backed.
 */
export default function StubArticleView({ slug }: { slug: string }) {
  const { posts } = usePosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) notFound();
  const article = posts[idx];
  return <ArticleView article={article} prev={posts[idx - 1]} next={posts[idx + 1]} />;
}
