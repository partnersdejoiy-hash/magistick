import { NextResponse } from "next/server";
import { sql, type DbApp } from "@/lib/db";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/apps → apps the signed-in user's level AND department may open. */
export async function GET() {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const { level, department } = g.me;
  const rows = (await sql()`
    SELECT a.id, a.name, a.blurb, a.category, a.href, a.icon, a.color, a.sort_order
    FROM apps a
    LEFT JOIN app_permissions p ON p.app_id = a.id AND p.role = ${level}
    WHERE COALESCE(p.allowed, TRUE) = TRUE
      AND (NOT EXISTS (SELECT 1 FROM app_departments d WHERE d.app_id = a.id)
           OR EXISTS (SELECT 1 FROM app_departments d WHERE d.app_id = a.id AND d.department = ${department}))
    ORDER BY a.sort_order ASC, a.name ASC
  `) as DbApp[];
  return NextResponse.json({ apps: rows });
}
