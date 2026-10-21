import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import { ARTICLES } from "./data";
import { LEVEL_IDS } from "./rbac";

/**
 * Postgres (Neon) access for magistick phase 2.
 *
 * Tables are created lazily via ensureSchema() — CREATE TABLE IF NOT EXISTS,
 * so the first API call after deploy self-initializes. No separate migration
 * step; Deepak only adds DATABASE_URL in Vercel env vars.
 */

let _sql: ReturnType<typeof neon> | null = null;

export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set — add it in Vercel env vars.");
  if (!_sql) _sql = neon(url);
  return _sql;
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     password_hash TEXT NOT NULL,
     role TEXT NOT NULL DEFAULT 'employee',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS apps (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     blurb TEXT NOT NULL DEFAULT '',
     category TEXT NOT NULL DEFAULT 'Tools',
     href TEXT NOT NULL DEFAULT '#',
     icon TEXT NOT NULL DEFAULT 'globe',
     color TEXT NOT NULL DEFAULT '#2563EB',
     sort_order INTEGER NOT NULL DEFAULT 0,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS app_permissions (
     app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
     role TEXT NOT NULL,
     allowed BOOLEAN NOT NULL DEFAULT TRUE,
     PRIMARY KEY (app_id, role)
   )`,
  `CREATE TABLE IF NOT EXISTS posts (
     id TEXT PRIMARY KEY,
     slug TEXT UNIQUE NOT NULL,
     title TEXT NOT NULL,
     excerpt TEXT NOT NULL DEFAULT '',
     category TEXT NOT NULL DEFAULT 'Announcements',
     author TEXT NOT NULL DEFAULT '',
     date TEXT NOT NULL,
     body TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // ---- phase 3: BPO hierarchy, departments, permission matrix, audit ----
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT 'operations'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES users(id) ON DELETE SET NULL`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`,
  // Profile photo: a small data-URL JPEG; photo_at (epoch ms, 0 = none) busts caches.
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS photo TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_at BIGINT NOT NULL DEFAULT 0`,
  `CREATE TABLE IF NOT EXISTS role_permissions (
     role TEXT NOT NULL,
     permission TEXT NOT NULL,
     allowed BOOLEAN NOT NULL,
     PRIMARY KEY (role, permission)
   )`,
  `CREATE TABLE IF NOT EXISTS app_departments (
     app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
     department TEXT NOT NULL,
     PRIMARY KEY (app_id, department)
   )`,
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'all'`,
  `CREATE TABLE IF NOT EXISTS audit_log (
     id TEXT PRIMARY KEY,
     actor_id TEXT,
     actor_name TEXT NOT NULL DEFAULT '',
     action TEXT NOT NULL,
     target TEXT NOT NULL DEFAULT '',
     detail TEXT NOT NULL DEFAULT '',
     at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // Old 3-role model → BPO ladder (idempotent: only touches old ids).
  `UPDATE users SET role = 'team_leader' WHERE role = 'collaborator'`,
  `UPDATE users SET role = 'associate' WHERE role = 'employee'`,
  // Get Help: which magistick user raised which OrbitDesk ticket (ownership +
  // a cached status so "My tickets" loads without calling OrbitDesk each time).
  `CREATE TABLE IF NOT EXISTS helpdesk_tickets (
     orbit_id INTEGER PRIMARY KEY,
     ticket_number TEXT NOT NULL,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     category TEXT NOT NULL,
     subcategory TEXT NOT NULL,
     subject TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'open',
     priority TEXT NOT NULL DEFAULT 'medium',
     assignee TEXT NOT NULL DEFAULT '',
     department TEXT NOT NULL DEFAULT '',
     sla_deadline TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS helpdesk_tickets_user_idx ON helpdesk_tickets (user_id, created_at DESC)`,
  // App access: carry each old role's choice to the levels that replaced it.
  `INSERT INTO app_permissions (app_id, role, allowed)
   SELECT p.app_id, m.level, p.allowed FROM app_permissions p
   JOIN (VALUES ('admin','super_admin'),('collaborator','dept_head'),('collaborator','sr_manager'),
                ('collaborator','ops_manager'),('collaborator','asst_manager'),('collaborator','team_leader'),
                ('employee','specialist'),('employee','sr_associate'),('employee','associate'),('employee','trainee'))
     AS m(old, level) ON m.old = p.role
   ON CONFLICT (app_id, role) DO NOTHING`,
  `DELETE FROM app_permissions WHERE role IN ('collaborator', 'employee')`,
];


/** The two real launch apps, per Deepak (2026-10-05). */
const SEED_APPS = [
  {
    id: "chronix",
    name: "Chronix",
    blurb: "Your Chronix workspace",
    category: "Work",
    href: "https://chronix.dejoiy.com",
    icon: "clock",
    color: "#2563EB",
    sort_order: 1,
  },
  {
    id: "orbitdesk",
    name: "OrbitDesk",
    blurb: "Support tickets & help desk",
    category: "Support",
    href: "https://orbitdesk.dejoiy.com",
    icon: "ticket",
    color: "#7C3AED",
    sort_order: 2,
  },
];

let ready: Promise<void> | null = null;

/** Create tables + seed apps/permissions/posts. Idempotent — safe to call often. */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const db = sql();
      for (const stmt of SCHEMA_STATEMENTS) {
        await db.query(stmt);
      }
      // Seed the two real apps (never overwrite an admin's edits).
      for (const a of SEED_APPS) {
        await db`
          INSERT INTO apps (id, name, blurb, category, href, icon, color, sort_order)
          VALUES (${a.id}, ${a.name}, ${a.blurb}, ${a.category}, ${a.href}, ${a.icon}, ${a.color}, ${a.sort_order})
          ON CONFLICT (id) DO NOTHING`;
        for (const role of LEVEL_IDS) {
          await db`
            INSERT INTO app_permissions (app_id, role, allowed)
            VALUES (${a.id}, ${role}, TRUE)
            ON CONFLICT (app_id, role) DO NOTHING`;
        }
      }
      // Exactly one owner: the ADMIN_EMAIL account (or the oldest admin) is Super Admin.
      const owner = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
      await db`UPDATE users SET role = 'super_admin' WHERE role = 'admin' AND lower(email) = ${owner}`;
      await db`
        UPDATE users SET role = 'super_admin' WHERE id = (
          SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1
        ) AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin')`;
      // Seed bulletin posts once, from the curated article set.
      const count = (await db`SELECT COUNT(*)::int AS c FROM posts`) as { c: number }[];
      if (count[0].c === 0) {
        for (const a of ARTICLES) {
          await db`
            INSERT INTO posts (id, slug, title, excerpt, category, author, date, body)
            VALUES (${randomUUID()}, ${a.slug}, ${a.title}, ${a.excerpt}, ${a.category}, ${a.author}, ${a.date}, ${JSON.stringify(a.body)})
            ON CONFLICT (slug) DO NOTHING`;
        }
      }
    })().catch((err) => {
      ready = null; // let the next call retry
      throw err;
    });
  }
  return ready;
}

export type DbApp = {
  id: string;
  name: string;
  blurb: string;
  category: string;
  href: string;
  icon: string;
  color: string;
  sort_order: number;
};

export type DbPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  body: string[];
  audience: string; // 'all' or a department id
};

/** Input shape for creating/updating a bulletin post. */
export type PostInput = {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // YYYY-MM-DD
  body: string[];
  audience: string; // 'all' or a department id
};

export function rowToPost(row: Record<string, unknown>): DbPost {
  let body: string[] = [];
  try {
    const parsed: unknown = JSON.parse(String(row.body ?? "[]"));
    if (Array.isArray(parsed)) body = parsed.filter((p): p is string => typeof p === "string");
  } catch {
    body = [];
  }
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt ?? ""),
    category: String(row.category ?? "Announcements"),
    author: String(row.author ?? ""),
    date: String(row.date ?? ""),
    body,
    audience: String(row.audience ?? "all"),
  };
}

export async function logAudit(
  actor: { id: string; name: string },
  action: string,
  target: string,
  detail = "",
) {
  try {
    await sql()`
      INSERT INTO audit_log (id, actor_id, actor_name, action, target, detail)
      VALUES (${randomUUID()}, ${actor.id}, ${actor.name}, ${action}, ${target}, ${detail})`;
  } catch {
    /* audit must never block the action it records */
  }
}
