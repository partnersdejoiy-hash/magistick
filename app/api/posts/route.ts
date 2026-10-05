import { NextResponse } from "next/server";
import { sql, ensureSchema, rowToPost } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/posts → bulletin list, newest first. */
export async function GET() {
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
    FROM posts ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[];
  return NextResponse.json({ posts: rows.map(rowToPost) });
}
