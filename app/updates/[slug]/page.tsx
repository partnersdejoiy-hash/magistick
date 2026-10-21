import { notFound, redirect } from "next/navigation";
import { sql, rowToPost } from "@/lib/db";
import { getMe } from "@/lib/auth";
import { PREVIEW_POST_ROWS, UI_PREVIEW } from "@/lib/preview";
import ArticleView from "./ArticleView";

export const dynamic = "force-dynamic";

/** One update, only if it is company-wide or for the reader's department. */
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const me = await getMe();
  if (!me) redirect(`/login?next=/updates/${params.slug}`);
  const all = UI_PREVIEW
    ? PREVIEW_POST_ROWS
    : ((await sql()`
    SELECT id, slug, title, excerpt, category, author, date, body, audience, region,
      CASE WHEN image LIKE 'data:%' THEN 'data' ELSE image END AS image
    FROM posts WHERE (audience = 'all' OR audience = ${me.department})
      AND (region = 'global' OR lower(region) = lower(${me.location}))
    ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[]);
  const idx = all.findIndex((r) => r.slug === params.slug);
  if (idx < 0) notFound();
  const pick = (i: number) => (i >= 0 && i < all.length ? rowToPost(all[i]) : undefined);
  return <ArticleView article={rowToPost(all[idx])} prev={pick(idx - 1)} next={pick(idx + 1)} />;
}
