import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "@/lib/db";
import { getSessionUser, hashPassword, canAdminister } from "@/lib/auth";
import type { RoleId } from "@/lib/roles";

export const dynamic = "force-dynamic";

const VALID_ROLES: RoleId[] = ["admin", "collaborator", "employee"];

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
  return { user };
}

/** GET /api/admin/users → all users (never password hashes). */
export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  const db = sql();
  const rows = (await db`
    SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC
  `) as { id: string; email: string; name: string; role: RoleId; created_at: string }[];
  return NextResponse.json({ users: rows });
}

/** POST /api/admin/users { email, name, role, password } → create user. */
export async function POST(req: NextRequest) {
  const g = await guard();
  if (g.error) return g.error;
  let body: { email?: string; name?: string; role?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const role = body.role as RoleId;
  const password = body.password ?? "";
  if (!email || !name) return NextResponse.json({ error: "Email and name are required." }, { status: 400 });
  if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const db = sql();
  const existing = (await db`SELECT id FROM users WHERE lower(email) = ${email} LIMIT 1`) as {
    id: string;
  }[];
  if (existing.length > 0) {
    return NextResponse.json({ error: "That email already has an account." }, { status: 409 });
  }
  const id = randomUUID();
  await db`
    INSERT INTO users (id, email, name, password_hash, role)
    VALUES (${id}, ${email}, ${name}, ${await hashPassword(password)}, ${role})`;
  return NextResponse.json({ user: { id, email, name, role } }, { status: 201 });
}
