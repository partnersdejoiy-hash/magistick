import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { sql, ensureSchema } from "./db";
import type { RoleId } from "./roles";

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
  role: RoleId;
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
    if (p.role !== "admin" && p.role !== "collaborator" && p.role !== "employee") return null;
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

export function canManagePosts(role: RoleId): boolean {
  return role === "admin" || role === "collaborator";
}

export function canAdminister(role: RoleId): boolean {
  return role === "admin";
}

/**
 * First-login bootstrap: when the users table is empty, the very first login
 * with the ADMIN_EMAIL creates the admin account (Deepak) from the
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
    INSERT INTO users (id, email, name, password_hash, role)
    VALUES (${randomUUID()}, ${adminEmail}, 'Deepak Sharma', ${await hashPassword(adminPassword)}, 'admin')
    ON CONFLICT (email) DO NOTHING`;
  return true;
}
