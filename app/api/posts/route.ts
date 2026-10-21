import { NextResponse } from "next/server";
import { sql, rowToPost } from "@/lib/db";
import { requireMe } from "@/lib/auth";
import { ARTICLES } from "@/lib/data";
import { UI_PREVIEW } from "@/lib/preview";

export const dynamic = "force-dynamic";

/** GET /api/posts → company-wide posts plus the reader's own department's, newest first. */
export async function GET() {
  const g = await requireMe();
  if ("error" in g) return g.error;
  if (UI_PREVIEW) {
    const posts = ARTICLES.map((a) => ({ ...a, id: a.slug, audience: "all" })).sort((x, y) => y.date.localeCompare(x.date));
    return NextResponse.json({ posts });
  }
  const rows = (await sql()`
    SELECT id, slug, title, excerpt, category, author, date, body, audience
    FROM posts WHERE audience = 'all' OR audience = ${g.me.department}
    ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[];
  return NextResponse.json({ posts: rows.map(rowToPost) });
}
