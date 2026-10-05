import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToPost } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/posts/[slug] → one post + prev/next slugs. */
export async function GET(_req: Request, ctx: { params: { slug: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    await ensureSchema();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database not reachable." },
      { status: 503 },
    );
  }
  const db = sql();
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body
    FROM posts WHERE slug = ${ctx.params.slug} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const all = (await db`SELECT slug FROM posts ORDER BY date DESC, created_at DESC`) as {
    slug: string;
  }[];
  const idx = all.findIndex((r) => r.slug === ctx.params.slug);
  return NextResponse.json({
    post: rowToPost(rows[0]),
    prevSlug: idx > 0 ? all[idx - 1].slug : null,
    nextSlug: idx >= 0 && idx < all.length - 1 ? all[idx + 1].slug : null,
  });
}
