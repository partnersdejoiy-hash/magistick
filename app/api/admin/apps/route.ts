import { NextRequest, NextResponse } from "next/server";
import { sql, logAudit, type DbApp } from "@/lib/db";
import { requireMe } from "@/lib/auth";
import { LEVEL_IDS } from "@/lib/rbac";

export const dynamic = "force-dynamic";

async function guard() {
  const g = await requireMe(["manage_apps"]);
  return "error" in g ? g : { me: g.me };
}

/** GET /api/admin/apps → full catalog (admin view, unfiltered). */
export async function GET() {
  const g = await guard();
  if ("error" in g) return g.error;
  const db = sql();
  const rows = (await db`
    SELECT id, name, blurb, category, href, icon, logo, color, sort_order
    FROM apps ORDER BY sort_order ASC, name ASC
  `) as DbApp[];
  return NextResponse.json({ apps: rows });
}

/** POST /api/admin/apps { name, blurb?, category?, href, icon?, color? } */
export async function POST(req: NextRequest) {
  const g = await guard();
  if ("error" in g) return g.error;
  let body: Partial<DbApp>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  const href = (body.href ?? "").trim();
  if (!name || !href) return NextResponse.json({ error: "Name and URL are required." }, { status: 400 });
  if (!/^https?:\/\//i.test(href)) {
    return NextResponse.json({ error: "URL must start with http(s)://" }, { status: 400 });
  }
  const logo = (body.logo ?? "").trim();
  if (logo && !/^https:\/\//i.test(logo)) {
    return NextResponse.json({ error: "Logo link must start with https://" }, { status: 400 });
  }
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `app-${Date.now()}`;
  const db = sql();
  const existing = (await db`SELECT id FROM apps WHERE id = ${id} LIMIT 1`) as { id: string }[];
  if (existing.length > 0) {
    return NextResponse.json({ error: "An app with a similar name already exists." }, { status: 409 });
  }
  const app: DbApp = {
    id,
    name,
    blurb: (body.blurb ?? "").trim(),
    category: (body.category ?? "Tools").trim() || "Tools",
    href,
    icon: (body.icon ?? "globe").trim() || "globe",
    logo,
    color: (body.color ?? "#2563EB").trim() || "#2563EB",
    sort_order: 99,
  };
  await db`
    INSERT INTO apps (id, name, blurb, category, href, icon, logo, color, sort_order)
    VALUES (${app.id}, ${app.name}, ${app.blurb}, ${app.category}, ${app.href}, ${app.icon}, ${app.logo}, ${app.color}, ${app.sort_order})`;
  for (const role of LEVEL_IDS) {
    await db`INSERT INTO app_permissions (app_id, role, allowed) VALUES (${id}, ${role}, TRUE)`;
  }
  await logAudit(g.me, "app.create", app.name);
  return NextResponse.json({ app }, { status: 201 });
}
