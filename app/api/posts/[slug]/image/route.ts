import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/posts/:id/image → an uploaded banner's bytes (the [slug] segment carries the post id here). */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const rows = (await sql()`SELECT image FROM posts WHERE id = ${params.slug} LIMIT 1`) as { image: string }[];
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(rows[0]?.image ?? "");
  if (!m) return new NextResponse(null, { status: 404 });
  return new NextResponse(Buffer.from(m[2], "base64"), {
    headers: { "Content-Type": m[1], "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" },
  });
}
