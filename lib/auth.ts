import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "./db";
import { UI_PREVIEW } from "./preview";
import { buildMatrix, isDept, isLevel, PERM_IDS, type DeptId, type LevelId, type Matrix, type PermId } from "./rbac";

/**
 * Session auth for magistick phase 2 — email + password, server-side sessions.
 *
 * - Passwords are bcrypt-hashed (bcryptjs, 12 rounds). Plaintext passwords
 *   NEVER touch the repo, logs, or chat.
 * - Sessions are HS256 JWTs in an httpOnly cookie (7-day expiry).
 * - First ever login bootstraps the admin from ADMIN_EMAIL/ADMIN_PASSWORD
 *   env vars (set once in Vercel, sensitive). After that the env password is
 *   never consulted again — rotation happens in /admin users.
 */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: LevelId;
};

export const SESSION_COOKIE = "magistick_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("AUTH_SECRET is not set (min 16 chars) — add it in Vercel env vars.");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function readSession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const p = payload as Record<string, unknown>;
    if (typeof p.id !== "string" || typeof p.email !== "string" || typeof p.name !== "string") {
      return null;
    }
    if (!isLevel(p.role)) return null;
    return { id: p.id, email: p.email, name: p.name, role: p.role };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return readSession(token);
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(pw, hash);
  } catch {
    return false;
  }
}

/** The signed-in user as the database knows them right now (role changes apply instantly). */
export type Me = {
  id: string;
  email: string;
  name: string;
  level: LevelId;
  department: DeptId;
  title: string;
  manager_id: string | null;
  location: string;
  /** Epoch ms of the current profile photo; 0 = none. */
  photo_at: number;
  perms: PermId[];
};

export async function loadMatrix(): Promise<Matrix> {
  const rows = (await sql()`SELECT role, permission, allowed FROM role_permissions`) as {
    role: string;
    permission: string;
    allowed: boolean;
  }[];
  return buildMatrix(rows);
}

export async function getMe(): Promise<Me | null> {
  if (UI_PREVIEW) {
    return {
      id: "ui-preview",
      email: "preview@magistick.local",
      name: "Preview Admin",
      level: "super_admin",
      department: "leadership",
      title: "",
      manager_id: null,
      location: "Delhi",
      photo_at: 0,
      perms: [...PERM_IDS],
    };
  }
  const s = await getSessionUser();
  if (!s) return null;
  await ensureSchema();
  const rows = (await sql()`
    SELECT id, email, name, role, department, title, manager_id, location, status, photo_at
    FROM users WHERE id = ${s.id} LIMIT 1`) as Record<string, string | null>[];
  const r = rows[0];
  if (!r || r.status !== "active" || !isLevel(r.role)) return null;
  const level = r.role;
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    level,
    department: isDept(r.department) ? r.department : "operations",
    title: String(r.title ?? ""),
    manager_id: r.manager_id,
    location: String(r.location ?? ""),
    photo_at: Number(r.photo_at ?? 0),
    perms: (await loadMatrix())[level],
  };
}

/**
 * API guard: signed in, active, and holding at least one of `anyOf` (if given).
 * Usage: const g = await requireMe(["manage_apps"]); if ("error" in g) return g.error;
 */
export async function requireMe(anyOf: PermId[] = []): Promise<{ me: Me } | { error: NextResponse }> {
  let me: Me | null;
  try {
    me = await getMe();
  } catch (err) {
    return {
      error: NextResponse.json(
        { error: err instanceof Error ? err.message : "Database not reachable." },
        { status: 503 },
      ),
    };
  }
  if (!me) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (anyOf.length && !anyOf.some((p) => me!.perms.includes(p))) {
    return { error: NextResponse.json({ error: "Your level doesn't allow this." }, { status: 403 }) };
  }
  return { me };
}

/** Company-wide publishers may target any audience; department publishers only their own. */
export function allowedAudience(me: Me, audience: unknown): string | null {
  const a = typeof audience === "string" && audience ? audience : "all";
  if (me.perms.includes("publish_posts_all")) return a === "all" || isDept(a) ? a : null;
  return a === me.department ? a : null;
}

/**
 * First-login bootstrap: when the users table is empty, the very first login
 * with the ADMIN_EMAIL creates the Super Admin account from the
 * ADMIN_PASSWORD env var, hashed. Returns true if it created the account.
 * Throws when the portal isn't initialized yet.
 */
export async function bootstrapAdminIfEmpty(email: string): Promise<boolean> {
  await ensureSchema();
  const db = sql();
  const count = (await db`SELECT COUNT(*)::int AS c FROM users`) as { c: number }[];
  if (count[0].c > 0) return false;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Portal not initialized — set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel env vars, redeploy, then sign in.",
    );
  }
  if (email.trim().toLowerCase() !== adminEmail) return false;

  await db`
    INSERT INTO users (id, email, name, password_hash, role, department, title)
    VALUES (${randomUUID()}, ${adminEmail}, 'Super Admin', ${await hashPassword(adminPassword)}, 'super_admin', 'leadership', 'Founder')
    ON CONFLICT (email) DO NOTHING`;
  return true;
}
