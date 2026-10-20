import { NextRequest, NextResponse } from "next/server";
import { sql, logAudit, type DbApp } from "@/lib/db";
import { requireMe } from "@/lib/auth";
import { LEVEL_IDS, isDept, type DeptId, type LevelId } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export type AppAccess = { levels: Record<LevelId, boolean>; departments: DeptId[] /* empty = all */ };

/** GET /api/admin/permissions → { apps, access: { appId: AppAccess } } */
export async function GET() {
  const g = await requireMe(["manage_app_access", "manage_apps"]);
  if ("error" in g) return g.error;
  const db = sql();
  const apps = (await db`
    SELECT id, name, blurb, category, href, icon, color, sort_order FROM apps ORDER BY sort_order ASC, name ASC
  `) as DbApp[];
  const perms = (await db`SELECT app_id, role, allowed FROM app_permissions`) as {
    app_id: string;
    role: string;
    allowed: boolean;
  }[];
  const depts = (await db`SELECT app_id, department FROM app_departments`) as { app_id: string; department: string }[];
  const access: Record<string, AppAccess> = {};
  for (const a of apps) {
    access[a.id] = {
      levels: Object.fromEntries(LEVEL_IDS.map((l) => [l, true])) as Record<LevelId, boolean>,
      departments: [],
    };
  }
  for (const p of perms) {
    if (access[p.app_id] && (LEVEL_IDS as string[]).includes(p.role)) {
      access[p.app_id].levels[p.role as LevelId] = p.allowed;
    }
  }
  for (const d of depts) if (access[d.app_id] && isDept(d.department)) access[d.app_id].departments.push(d.department);
  return NextResponse.json({ apps, access });
}

/** PUT /api/admin/permissions { appId, levels: {level: bool}, departments: DeptId[] } */
export async function PUT(req: NextRequest) {
  const g = await requireMe(["manage_app_access"]);
  if ("error" in g) return g.error;
  let b: { appId?: unknown; levels?: Record<string, unknown>; departments?: unknown };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const db = sql();
  const app = (await db`SELECT name FROM apps WHERE id = ${String(b.appId)} LIMIT 1`) as { name: string }[];
  if (app.length === 0) return NextResponse.json({ error: "App not found." }, { status: 404 });
  const appId = String(b.appId);
  const levels = LEVEL_IDS.filter((l) => typeof b.levels?.[l] === "boolean");
  if (levels.length && levels.every((l) => b.levels![l] === false)) {
    return NextResponse.json({ error: "At least one level must keep this app." }, { status: 400 });
  }
  for (const l of levels) {
    await db`
      INSERT INTO app_permissions (app_id, role, allowed) VALUES (${appId}, ${l}, ${b.levels![l] as boolean})
      ON CONFLICT (app_id, role) DO UPDATE SET allowed = EXCLUDED.allowed`;
  }
  if (Array.isArray(b.departments)) {
    const ds = b.departments.filter(isDept);
    await db`DELETE FROM app_departments WHERE app_id = ${appId}`;
    for (const d of ds) await db`INSERT INTO app_departments (app_id, department) VALUES (${appId}, ${d})`;
  }
  await logAudit(g.me, "app.access", app[0].name);
  return NextResponse.json({ ok: true });
}




