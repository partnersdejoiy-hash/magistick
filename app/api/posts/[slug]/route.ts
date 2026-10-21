import { NextResponse } from "next/server";
import { sql, rowToPost } from "@/lib/db";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/posts/[slug] → one post the reader may see + prev/next slugs. */
export async function GET(_req: Request, ctx: { params: { slug: string } }) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const dept = g.me.department;
  const db = sql();
  const all = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body, audience, region,
      CASE WHEN image LIKE 'data:%' THEN 'data' ELSE image END AS image
    FROM posts WHERE (audience = 'all' OR audience = ${dept})
      AND (region = 'global' OR lower(region) = lower(${g.me.location}))
    ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[];
  const idx = all.findIndex((r) => r.slug === ctx.params.slug);
  if (idx < 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({
    post: rowToPost(all[idx]),
    prevSlug: idx > 0 ? String(all[idx - 1].slug) : null,
    nextSlug: idx < all.length - 1 ? String(all[idx + 1].slug) : null,
  });
}
