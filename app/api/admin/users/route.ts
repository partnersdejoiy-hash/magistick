import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, logAudit } from "@/lib/db";
import { requireMe, hashPassword } from "@/lib/auth";
import { isDept, isLevel, LEVEL_BY_ID, DEPT_BY_ID } from "@/lib/rbac";
import { loadPeople, mayManage } from "@/lib/people";

export const dynamic = "force-dynamic";

const MANAGE = ["manage_users_team", "manage_users_dept", "manage_users_all"] as const;

/** GET /api/admin/users → everyone, each flagged with whether the caller may manage them. */
export async function GET() {
  const g = await requireMe([...MANAGE]);
  if ("error" in g) return g.error;
  const people = await loadPeople();
  const byId = new Map(people.map((p) => [p.id, p]));
  return NextResponse.json({
    users: people.map((p) => ({ ...p, manageable: p.id !== g.me.id && mayManage(g.me, p, byId) })),
  });
}

/** POST /api/admin/users { email, name, password, level, department, title?, manager_id?, location? } */
export async function POST(req: NextRequest) {
  const g = await requireMe([...MANAGE]);
  if ("error" in g) return g.error;
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = String(b.email ?? "").trim().toLowerCase();
  const name = String(b.name ?? "").trim();
  const password = String(b.password ?? "");
  const level = b.level;
  const department = b.department;
  const manager_id = b.manager_id ? String(b.manager_id) : null;
  if (!email || !name) return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }
  if (!isLevel(level) || !isDept(department)) {
    return NextResponse.json({ error: "Pick a valid level and department." }, { status: 400 });
  }
  if (level === "super_admin") return NextResponse.json({ error: "There is only one Super Admin." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  const people = await loadPeople();
  const byId = new Map(people.map((p) => [p.id, p]));
  if (manager_id && !byId.has(manager_id)) return NextResponse.json({ error: "Manager not found." }, { status: 400 });
  const id = randomUUID();
  if (!mayManage(g.me, { id, level, department, manager_id }, byId)) {
    return NextResponse.json(
      { error: "You can only add people below your level, inside your scope." },
      { status: 403 },
    );
  }
  if (people.some((p) => p.email === email)) {
    return NextResponse.json({ error: "That email already has an account." }, { status: 409 });
  }
  await sql()`
    INSERT INTO users (id, email, name, password_hash, role, department, title, manager_id, location)
    VALUES (${id}, ${email}, ${name}, ${await hashPassword(password)}, ${level}, ${department},
            ${String(b.title ?? "").trim()}, ${manager_id}, ${String(b.location ?? "").trim()})`;
  await logAudit(g.me, "user.create", name, `${LEVEL_BY_ID[level].label} · ${DEPT_BY_ID[department].label}`);
  return NextResponse.json({ user: { id } }, { status: 201 });
}
