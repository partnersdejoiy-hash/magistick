import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import { getSessionUser, hashPassword, canAdminister } from "@/lib/auth";
import type { RoleId } from "@/lib/roles";

export const dynamic = "force-dynamic";

const VALID_ROLES: RoleId[] = ["admin", "collaborator", "employee"];

async function guard() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!canAdminister(user.role)) {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  await ensureSchema();
  return { user };
}

/** PATCH /api/admin/users/[id] { name?, role?, password? } */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard();
  if (g.error) return g.error;
  let body: { name?: string; role?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (typeof body.name === "string" && body.name.trim()) {
    updates.push(`name = $${i++}`);
    params.push(body.name.trim());
  }
  if (typeof body.role === "string") {
    if (!VALID_ROLES.includes(body.role as RoleId)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    if (ctx.params.id === g.user!.id && body.role !== "admin") {
      return NextResponse.json({ error: "You can't demote yourself." }, { status: 400 });
    }
    updates.push(`role = $${i++}`);
    params.push(body.role);
  }
  if (typeof body.password === "string" && body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    updates.push(`password_hash = $${i++}`);
    params.push(await hashPassword(body.password));
  }
  if (updates.length === 0) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const db = sql();
  params.push(ctx.params.id);
  // Column names are fixed literals above — only values are parameterized.
  await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = $${i}`, params);

  const rows = (await db`SELECT id, email, name, role FROM users WHERE id = ${ctx.params.id} LIMIT 1`) as {
    id: string;
    email: string;
    name: string;
    role: RoleId;
  }[];
  if (rows.length === 0) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ user: rows[0] });
}

/** DELETE /api/admin/users/[id] */
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const g = await guard();
  if (g.error) return g.error;
  if (ctx.params.id === g.user!.id) {
    return NextResponse.json({ error: "You can't delete yourself." }, { status: 400 });
  }
  const db = sql();
  await db`DELETE FROM users WHERE id = ${ctx.params.id}`;
  return NextResponse.json({ ok: true });
}
