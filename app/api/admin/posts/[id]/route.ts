import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema, rowToPost } from "@/lib/db";
import { getSessionUser, canManagePosts } from "@/lib/auth";
import type { PostInput } from "@/lib/db";

export const dynamic = "force-dynamic";

async function guard() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!canManagePosts(user.role)) {
    return { error: NextResponse.json({ error: "Not allowed for your role." }, { status: 403 }) };
  }
  await ensureSchema();
  return {};
}

/** PATCH /api/admin/posts/[id] → update. */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard();
  if (g.error) return g.error;
  let input: Partial<PostInput>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const updates: string[] = [];
  const params: unknown[] = [];
  let i = 1;
  const setStr = (col: string, v: unknown) => {
    if (typeof v === "string") {
      updates.push(`${col} = $${i++}`);
      params.push(v.trim());
    }
  };
  setStr("title", input.title);
  setStr("excerpt", input.excerpt);
  setStr("category", input.category);
  setStr("author", input.author);
  if (typeof input.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    updates.push(`date = $${i++}`);
    params.push(input.date);
  }
  if (Array.isArray(input.body)) {
    updates.push(`body = $${i++}`);
    params.push(JSON.stringify(input.body.map((p) => String(p).trim()).filter(Boolean)));
  }
  if (updates.length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  updates.push(`updated_at = now()`);

  const db = sql();
  params.push(ctx.params.id);
  await db.query(`UPDATE posts SET ${updates.join(", ")} WHERE id = $${i}`, params);
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body
    FROM posts WHERE id = ${ctx.params.id} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post: rowToPost(rows[0]) });
}

/** DELETE /api/admin/posts/[id] */
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard();
  if (g.error) return g.error;
  const db = sql();
  await db`DELETE FROM posts WHERE id = ${ctx.params.id}`;
  return NextResponse.json({ ok: true });
}
