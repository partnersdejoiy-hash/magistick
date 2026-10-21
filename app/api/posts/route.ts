import { NextResponse } from "next/server";
import { sql, rowToPost } from "@/lib/db";
import { requireMe } from "@/lib/auth";
import { PREVIEW_POST_ROWS, UI_PREVIEW } from "@/lib/preview";

export const dynamic = "force-dynamic";

/** GET /api/posts → company-wide posts plus the reader's own department's, newest first. */
export async function GET() {
  const g = await requireMe();
  if ("error" in g) return g.error;
  if (UI_PREVIEW) return NextResponse.json({ posts: PREVIEW_POST_ROWS.map(rowToPost) });
  const rows = (await sql()`
    SELECT id, slug, title, excerpt, category, author, date, body, audience, region,
      CASE WHEN image LIKE 'data:%' THEN 'data' ELSE image END AS image
    FROM posts WHERE (audience = 'all' OR audience = ${g.me.department})
      AND (region = 'global' OR lower(region) = lower(${g.me.location}))
    ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[];
  return NextResponse.json({ posts: rows.map(rowToPost) });
}
