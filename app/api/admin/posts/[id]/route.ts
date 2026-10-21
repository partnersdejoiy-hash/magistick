import { NextRequest, NextResponse } from "next/server";
import { sql, rowToPost, logAudit } from "@/lib/db";
import { requireMe, allowedAudience } from "@/lib/auth";
import { cleanImageInput, cleanRegion } from "@/lib/postImages";
import type { PostInput } from "@/lib/db";

export const dynamic = "force-dynamic";

/** The post exists and this publisher may touch it (dept publishers: own department only). */
async function guard(id: string) {
  const g = await requireMe(["publish_posts_dept", "publish_posts_all"]);
  if ("error" in g) return g;
  const rows = (await sql()`SELECT audience, title FROM posts WHERE id = ${id} LIMIT 1`) as {
    audience: string;
    title: string;
  }[];
  if (rows.length === 0) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  if (!g.me.perms.includes("publish_posts_all") && rows[0].audience !== g.me.department) {
    return { error: NextResponse.json({ error: "That post belongs to another audience." }, { status: 403 }) };
  }
  return { me: g.me, title: rows[0].title };
}

/** PATCH /api/admin/posts/[id] → update. */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard(ctx.params.id);
  if ("error" in g) return g.error;
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
  if (input.audience !== undefined) {
    const audience = allowedAudience(g.me, input.audience);
    if (!audience) return NextResponse.json({ error: "You can only publish to your own department." }, { status: 403 });
    updates.push(`audience = $${i++}`);
    params.push(audience);
  }
  if (input.region !== undefined) {
    const region = cleanRegion(input.region);
    if (region === null) return NextResponse.json({ error: "Region should be Global or a location name." }, { status: 400 });
    updates.push(`region = $${i++}`);
    params.push(region);
  }
  // "data" means "keep the uploaded banner": lists only ever see that marker.
  if (input.image !== undefined && input.image !== "data") {
    const image = cleanImageInput(input.image);
    if (image === null) return NextResponse.json({ error: "Use a library photo or a JPEG/PNG/WebP under about 650 KB." }, { status: 400 });
    updates.push(`image = $${i++}`);
    params.push(image);
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
  await logAudit(g.me, "post.edit", g.title);
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body, audience, region,
      CASE WHEN image LIKE 'data:%' THEN 'data' ELSE image END AS image
    FROM posts WHERE id = ${ctx.params.id} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ post: rowToPost(rows[0]) });
}

/** DELETE /api/admin/posts/[id] */
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard(ctx.params.id);
  if ("error" in g) return g.error;
  await sql()`DELETE FROM posts WHERE id = ${ctx.params.id}`;
  await logAudit(g.me, "post.delete", g.title);
  return NextResponse.json({ ok: true });
}
