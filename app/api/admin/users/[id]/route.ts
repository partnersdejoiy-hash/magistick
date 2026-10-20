import { NextRequest, NextResponse } from "next/server";
import { sql, logAudit } from "@/lib/db";
import { requireMe, hashPassword } from "@/lib/auth";
import { isDept, isLevel, LEVEL_BY_ID, DEPT_BY_ID } from "@/lib/rbac";
import { chainFrom, loadPeople, mayManage, type Person } from "@/lib/people";

export const dynamic = "force-dynamic";

const MANAGE = ["manage_users_team", "manage_users_dept", "manage_users_all"] as const;

async function load(id: string) {
  const g = await requireMe([...MANAGE]);
  if ("error" in g) return g;
  const people = await loadPeople();
  const byId = new Map(people.map((p) => [p.id, p]));
  const target = byId.get(id);
  if (!target) return { error: NextResponse.json({ error: "Not found." }, { status: 404 }) };
  if (target.id === g.me.id) {
    return { error: NextResponse.json({ error: "You can't change your own account here." }, { status: 400 }) };
  }
  if (!mayManage(g.me, target, byId)) {
    return { error: NextResponse.json({ error: "That person is outside your scope." }, { status: 403 }) };
  }
  return { me: g.me, target, byId };
}

/** PATCH /api/admin/users/[id] { name?, title?, level?, department?, manager_id?, location?, status?, password? } */
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  const l = await load(ctx.params.id);
  if ("error" in l) return l.error;
  const { me, target, byId } = l;
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const next: Person = { ...target };
  if (typeof b.name === "string" && b.name.trim()) next.name = b.name.trim();
  if (typeof b.title === "string") next.title = b.title.trim();
  if (typeof b.location === "string") next.location = b.location.trim();
  if (b.level !== undefined) {
    if (!isLevel(b.level) || b.level === "super_admin") {
      return NextResponse.json({ error: "Invalid level." }, { status: 400 });
    }
    next.level = b.level;
  }
  if (b.department !== undefined) {
    if (!isDept(b.department)) return NextResponse.json({ error: "Invalid department." }, { status: 400 });
    next.department = b.department;
  }
  if (b.status !== undefined) {
    if (b.status !== "active" && b.status !== "suspended") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    next.status = b.status;
  }
  if (b.manager_id !== undefined) {
    const mid = b.manager_id ? String(b.manager_id) : null;
    if (mid && !byId.has(mid)) return NextResponse.json({ error: "Manager not found." }, { status: 400 });
    if (mid && (mid === target.id || chainFrom(mid, byId).some((p) => p.id === target.id))) {
      return NextResponse.json({ error: "That would make a reporting loop." }, { status: 400 });
    }
    next.manager_id = mid;
  }
  // The result must still be inside the caller's scope (no promoting past yourself).
  if (!mayManage(me, next, byId)) {
    return NextResponse.json({ error: "That change would move them outside your scope." }, { status: 403 });
  }

  let password_hash: string | null = null;
  if (typeof b.password === "string" && b.password) {
    if (b.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    password_hash = await hashPassword(b.password);
  }

  await sql()`
    UPDATE users SET name = ${next.name}, title = ${next.title}, location = ${next.location},
      role = ${next.level}, department = ${next.department}, status = ${next.status},
      manager_id = ${next.manager_id},
      password_hash = COALESCE(${password_hash}, password_hash)
    WHERE id = ${target.id}`;

  const changes: string[] = [];
  if (next.level !== target.level) changes.push(`level ${LEVEL_BY_ID[target.level].label} → ${LEVEL_BY_ID[next.level].label}`);
  if (next.department !== target.department) changes.push(`dept ${DEPT_BY_ID[target.department].label} → ${DEPT_BY_ID[next.department].label}`);
  if (next.status !== target.status) changes.push(`status ${next.status}`);
  if (next.manager_id !== target.manager_id) changes.push(`manager ${next.manager_id ? byId.get(next.manager_id)!.name : "none"}`);
  if (password_hash) changes.push("password reset");
  await logAudit(me, "user.update", target.name, changes.join("; ") || "profile");
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/users/[id] — permanent; direct reports move up to the removed person's manager. */
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const l = await load(ctx.params.id);
  if ("error" in l) return l.error;
  const db = sql();
  await db`UPDATE users SET manager_id = ${l.target.manager_id} WHERE manager_id = ${l.target.id}`;
  await db`DELETE FROM users WHERE id = ${l.target.id}`;
  await logAudit(l.me, "user.delete", l.target.name);
  return NextResponse.json({ ok: true });
}
