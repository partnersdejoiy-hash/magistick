import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema, ROLE_IDS, type DbApp } from "@/lib/db";
import { getSessionUser, canAdminister } from "@/lib/auth";
import type { RoleId } from "@/lib/roles";

export const dynamic = "force-dynamic";

async function guard() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!canAdminister(user.role)) {
    return { error: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  try {
    await ensureSchema();
  } catch (err) {
    return {
      error: NextResponse.json(
        { error: err instanceof Error ? err.message : "Database not reachable." },
        { status: 503 },
      ),
    };
  }
  return {};
}

export type AppMatrix = Record<string, Record<RoleId, boolean>>;

/** GET /api/admin/permissions → { apps, matrix } */
export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  const db = sql();
  const apps = (await db`
    SELECT id, name, blurb, category, href, icon, color, sort_order
    FROM apps ORDER BY sort_order ASC, name ASC
  `) as DbApp[];
  const perms = (await db`SELECT app_id, role, allowed FROM app_permissions`) as {
    app_id: string;
    role: RoleId;
    allowed: boolean;
  }[];
  const matrix: AppMatrix = {};
  for (const a of apps) {
    matrix[a.id] = { admin: true, collaborator: true, employee: true };
  }
  for (const p of perms) {
    if (matrix[p.app_id]) matrix[p.app_id][p.role] = p.allowed;
  }
  return NextResponse.json({ apps, matrix });
}

/** PUT /api/admin/permissions { matrix: { appId: { role: boolean } } } */
export async function PUT(req: NextRequest) {
  const g = await guard();
  if (g.error) return g.error;
  let body: { matrix?: AppMatrix };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const matrix = body.matrix;
  if (!matrix || typeof matrix !== "object") {
    return NextResponse.json({ error: "matrix is required." }, { status: 400 });
  }
  const db = sql();
  const appIds = (
    (await db`SELECT id FROM apps`) as { id: string }[]
  ).map((r) => r.id);

  for (const [appId, roles] of Object.entries(matrix)) {
    if (!appIds.includes(appId) || !roles || typeof roles !== "object") continue;
    const entries = ROLE_IDS.filter((r) => typeof roles[r] === "boolean").map(
      (r) => ({ role: r, allowed: (roles[r] as boolean) === true }),
    );
    if (entries.length === 0) continue;
    if (entries.every((e) => !e.allowed)) continue; // an app must stay usable by someone
    for (const e of entries) {
      await db`
        INSERT INTO app_permissions (app_id, role, allowed)
        VALUES (${appId}, ${e.role}, ${e.allowed})
        ON CONFLICT (app_id, role) DO UPDATE SET allowed = EXCLUDED.allowed`;
    }
  }
  return NextResponse.json({ ok: true });
}
