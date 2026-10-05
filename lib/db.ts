import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import { ARTICLES } from "./data";
import type { RoleId } from "./roles";

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
];

export const ROLE_IDS: RoleId[] = ["admin", "collaborator", "employee"];

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
    color: "#D9480F",
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
        for (const role of ROLE_IDS) {
          await db`
            INSERT INTO app_permissions (app_id, role, allowed)
            VALUES (${a.id}, ${role}, TRUE)
            ON CONFLICT (app_id, role) DO NOTHING`;
        }
      }
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
};

/** Input shape for creating/updating a bulletin post. */
export type PostInput = {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string; // YYYY-MM-DD
  body: string[];
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
  };
}
