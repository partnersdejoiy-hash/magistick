import { NextRequest, NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";
import {
  bootstrapAdminIfEmpty,
  setSessionCookie,
  signSession,
  verifyPassword,
  type SessionUser,
} from "@/lib/auth";
import type { RoleId } from "@/lib/roles";

export const dynamic = "force-dynamic";

/** POST /api/auth/login { email, password } → sets session cookie. */
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    await ensureSchema();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Database not reachable." },
      { status: 503 },
    );
  }

  // First-ever login bootstraps the admin from env vars.
  try {
    await bootstrapAdminIfEmpty(email);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Portal not initialized." },
      { status: 503 },
    );
  }

  const db = sql();
  const rows = (await db`
    SELECT id, email, name, password_hash, role FROM users
    WHERE lower(email) = ${email} LIMIT 1
  `) as { id: string; email: string; name: string; password_hash: string; role: RoleId }[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No account for that email." }, { status: 401 });
  }
  const row = rows[0];
  if (!(await verifyPassword(password, row.password_hash))) {
    return NextResponse.json({ error: "Wrong password. Try again." }, { status: 401 });
  }

  const user: SessionUser = { id: row.id, email: row.email, name: row.name, role: row.role };
  const token = await signSession(user);
  setSessionCookie(token);
  return NextResponse.json({ user });
}
