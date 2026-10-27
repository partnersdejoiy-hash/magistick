import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { bearerOk } from "@/lib/sso";

export const dynamic = "force-dynamic";

/** GET /api/sso/people (Bearer SSO_SECRET) → every active employee, for Workloom's people sync. */
export async function GET(req: NextRequest) {
  if (!bearerOk(req.headers.get("authorization"))) return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  await ensureSchema();
  const people = await sql()`
    SELECT u.email, u.name, u.role AS level, u.department, u.title, u.location, m.email AS manager_email
    FROM users u LEFT JOIN users m ON m.id = u.manager_id
    WHERE u.status = 'active'
    ORDER BY u.name`;
  return NextResponse.json({ people });
}
