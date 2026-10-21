import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { sql } from "@/lib/db";
import { PREVIEW_TEAM, UI_PREVIEW } from "@/lib/preview";

export const dynamic = "force-dynamic";

/** GET /api/people/:id/photo → the person's photo bytes, or 404 (the UI falls back to initials). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  if (UI_PREVIEW) {
    const hit = PREVIEW_TEAM.some((p) => p.id === params.id);
    if (hit) return NextResponse.redirect(new URL(`/team-sample/${params.id}.webp`, _req.url));
    return new NextResponse(null, { status: 404 });
  }
  const rows = (await sql()`SELECT photo FROM users WHERE id = ${params.id} LIMIT 1`) as { photo: string }[];
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(rows[0]?.photo ?? "");
  // Short private cache: a new photo shows up for others within 5 minutes; your own busts via ?v=.
  const cache = { "Cache-Control": "private, max-age=300" };
  if (!m) return new NextResponse(null, { status: 404, headers: cache });
  return new NextResponse(Buffer.from(m[2], "base64"), {
    headers: { ...cache, "Content-Type": m[1], "X-Content-Type-Options": "nosniff" },
  });
}
