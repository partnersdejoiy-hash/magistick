import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql, rowToPost, logAudit, type PostInput } from "@/lib/db";
import { requireMe, allowedAudience } from "@/lib/auth";
import { cleanImageInput, cleanRegion } from "@/lib/postImages";

export const dynamic = "force-dynamic";

const PUBLISH = ["publish_posts_dept", "publish_posts_all"] as const;

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
  const g = await requireMe([...PUBLISH]);
  if ("error" in g) return g.error;
  const all = g.me.perms.includes("publish_posts_all");
  const rows = (await sql()`
    SELECT id, slug, title, excerpt, category, author, date, body, audience, region,
      CASE WHEN image LIKE 'data:%' THEN 'data' ELSE image END AS image
    FROM posts WHERE ${all} OR audience = ${g.me.department}
    ORDER BY date DESC, created_at DESC
  `) as Record<string, unknown>[];
  return NextResponse.json({ posts: rows.map(rowToPost) });
}

/** POST /api/admin/posts → create. */
export async function POST(req: NextRequest) {
  const g = await requireMe([...PUBLISH]);
  if ("error" in g) return g.error;
  let input: Partial<PostInput>;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!valid(input)) return NextResponse.json({ error: "Fill title, excerpt, date and body." }, { status: 400 });
  const audience = allowedAudience(g.me, input.audience);
  if (!audience) return NextResponse.json({ error: "You can only publish to your own department." }, { status: 403 });
  const region = cleanRegion(input.region);
  const image = cleanImageInput(input.image ?? "");
  if (region === null) return NextResponse.json({ error: "Region should be Global or a location name." }, { status: 400 });
  if (image === null) return NextResponse.json({ error: "Use a library photo or a JPEG/PNG/WebP under about 650 KB." }, { status: 400 });
  const db = sql();
  let slug = slugify(input.title);
  const clash = (await db`SELECT id FROM posts WHERE slug = ${slug} LIMIT 1`) as { id: string }[];
  if (clash.length > 0) slug = `${slug}-${Date.now().toString(36)}`;
  const id = randomUUID();
  await db`
    INSERT INTO posts (id, slug, title, excerpt, category, author, date, body, audience, region, image)
    VALUES (${id}, ${slug}, ${input.title.trim()}, ${input.excerpt.trim()},
            ${input.category.trim() || "Announcements"}, ${input.author.trim() || g.me.name},
            ${input.date}, ${JSON.stringify(input.body.map((p) => p.trim()).filter(Boolean))}, ${audience},
            ${region}, ${image})`;
  await logAudit(g.me, "post.publish", input.title.trim(), `audience: ${audience}`);
  const rows = (await db`
    SELECT id, slug, title, excerpt, category, author, date, body, audience, region,
      CASE WHEN image LIKE 'data:%' THEN 'data' ELSE image END AS image FROM posts WHERE id = ${id} LIMIT 1
  `) as Record<string, unknown>[];
  return NextResponse.json({ post: rowToPost(rows[0]) }, { status: 201 });
}
