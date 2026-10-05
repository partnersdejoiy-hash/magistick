import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, ensureSchema, rowToPost, type PostInput } from "@/lib/db";
import { getSessionUser, canManagePosts } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function guard() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Sign in required." }, { status: 401 }) };
  if (!canManagePosts(user.role)) {
    return { error: NextResponse.json({ error: "Not allowed for your role." }, { status: 403 }) };
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
  return {};
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return base || `post-${Date.now()}`;
}

function valid(input: Partial<PostInput>): input is PostInput {
  return (
    typeof input.title === "string" &&
    input.title.trim().length > 2 &&
    typeof input.excerpt === "string" &&
    typeof input.category === "string" &&
    typeof input.author === "string" &&
    typeof input.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(input.date) &&
    Array.isArray(input.body) &&
    input.body.some((p) => typeof p === "string" && p.trim().length > 0)
  );
}

/** GET /api/admin/posts → all posts with bodies (for the manager). */
export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  const db = sql();
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body
    FROM posts ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[];
  return NextResponse.json({ posts: rows.map(rowToPost) });
}

/** POST /api/admin/posts → create. */
export async function POST(req: NextRequest) {
  const g = await guard();
  if (g.error) return g.error;
  let input: Partial<PostInput>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!valid(input)) return NextResponse.json({ error: "Fill title, excerpt, date and body." }, { status: 400 });
  const db = sql();
  let slug = slugify(input.title);
  const clash = (await db`SELECT id FROM posts WHERE slug = ${slug} LIMIT 1`) as { id: string }[];
  if (clash.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
  const id = randomUUID();
  await db`
    INSERT INTO posts (id, slug, title, excerpt, category, author, date, body)
    VALUES (${id}, ${slug}, ${input.title.trim()}, ${input.excerpt.trim()},
            ${input.category.trim() || "Announcements"}, ${input.author.trim() || "Magistick Team"},
            ${input.date}, ${JSON.stringify(input.body.map((p) => p.trim()).filter(Boolean))})`;
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body FROM posts WHERE id = ${id} LIMIT 1
  `) as Record<string, unknown>[];
  return NextResponse.json({ post: rowToPost(rows[0]) }, { status: 201 });
}
