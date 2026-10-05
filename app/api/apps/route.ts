import { NextResponse } from "next/server";
import { sql, ensureSchema, type DbApp } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/apps → apps the signed-in user's role may open. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    await ensureSchema();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database not reachable." },
      { status: 503 },
    );
  }
  const db = sql();
  const rows = (await db`
    SELECT a.id, a.name, a.blurb, a.category, a.href, a.icon, a.color, a.sort_order
    FROM apps a
    LEFT JOIN app_permissions p ON p.app_id = a.id AND p.role = ${user.role}
    WHERE COALESCE(p.allowed, TRUE) = TRUE
    ORDER BY a.sort_order ASC, a.name ASC
  `) as DbApp[];
  return NextResponse.json({ apps: rows });
}
