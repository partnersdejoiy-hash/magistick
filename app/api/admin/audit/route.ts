import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/audit → the latest 300 admin actions. */
export async function GET() {
  const g = await requireMe(["view_audit"]);
  if ("error" in g) return g.error;
  const rows = await sql()`
    SELECT id, actor_name, action, target, detail, at FROM audit_log ORDER BY at DESC LIMIT 300`;
  return NextResponse.json({ entries: rows });
}
