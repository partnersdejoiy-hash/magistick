import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema, type DbApp } from "@/lib/db";
import { getSessionUser, canAdminister } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function guard() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!canAdminister(user.role)) {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  await ensureSchema();
  return {};
}

/** PATCH /api/admin/apps/[id] { name?, blurb?, category?, href?, icon?, color? } */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard();
  if (g.error) return g.error;
  let body: Partial<DbApp>;
  try {
    body = await req.json();
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
  setStr("name", body.name);
  setStr("blurb", body.blurb);
  setStr("category", body.category);
  setStr("href", body.href);
  setStr("icon", body.icon);
  setStr("color", body.color);
  if (updates.length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  if (body.href && !/^https?:\/\//i.test(String(body.href))) {
    return NextResponse.json({ error: "URL must start with http(s)://" }, { status: 400 });
  }
  const db = sql();
  params.push(ctx.params.id);
  await db.query(`UPDATE apps SET ${updates.join(", ")} WHERE id = $${i}`, params);
  const rows = (await db`
    SELECT id, name, blurb, category, href, icon, color, sort_order
    FROM apps WHERE id = ${ctx.params.id} LIMIT 1
  `) as DbApp[];
  if (rows.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ app: rows[0] });
}

/** DELETE /api/admin/apps/[id] */
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard();
  if (g.error) return g.error;
  const db = sql();
  await db`DELETE FROM apps WHERE id = ${ctx.params.id}`;
  return NextResponse.json({ ok: true });
}
