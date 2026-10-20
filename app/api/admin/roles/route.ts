import { NextRequest, NextResponse } from "next/server";
import { sql, logAudit } from "@/lib/db";
import { requireMe, loadMatrix } from "@/lib/auth";
import { DEFAULT_MATRIX, isLevel, isPerm, LEVEL_BY_ID, PERMISSIONS } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/** GET /api/admin/roles → the live level × permission matrix. Readable by anyone who manages people. */
export async function GET() {
  const g = await requireMe(["manage_roles", "manage_users_team", "manage_users_dept", "manage_users_all"]);
  if ("error" in g) return g.error;
  return NextResponse.json({ matrix: await loadMatrix(), defaults: DEFAULT_MATRIX });
}

/** PUT /api/admin/roles { level, permission, allowed } → one cell. Super Admin's row is fixed. */
export async function PUT(req: NextRequest) {
  const g = await requireMe(["manage_roles"]);
  if ("error" in g) return g.error;
  let b: { level?: unknown; permission?: unknown; allowed?: unknown };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isLevel(b.level) || !isPerm(b.permission) || typeof b.allowed !== "boolean") {
    return NextResponse.json({ error: "level, permission and allowed are required." }, { status: 400 });
  }
  if (b.level === "super_admin") {
    return NextResponse.json({ error: "Super Admin always has every permission." }, { status: 400 });
  }
  if (b.level === g.me.level && b.permission === "manage_roles" && !b.allowed) {
    return NextResponse.json({ error: "You can't remove your own access to this matrix." }, { status: 400 });
  }
  await sql()`
    INSERT INTO role_permissions (role, permission, allowed) VALUES (${b.level}, ${b.permission}, ${b.allowed})
    ON CONFLICT (role, permission) DO UPDATE SET allowed = EXCLUDED.allowed`;
  const label = PERMISSIONS.find((p) => p.id === b.permission)!.label;
  await logAudit(g.me, b.allowed ? "role.grant" : "role.revoke", LEVEL_BY_ID[b.level].label, label);
  return NextResponse.json({ matrix: await loadMatrix() });
}

/** DELETE /api/admin/roles → reset every override to the defaults. */
export async function DELETE() {
  const g = await requireMe(["manage_roles"]);
  if ("error" in g) return g.error;
  await sql()`DELETE FROM role_permissions`;
  await logAudit(g.me, "role.reset", "All levels", "Matrix reset to defaults");
  return NextResponse.json({ matrix: await loadMatrix() });
}
