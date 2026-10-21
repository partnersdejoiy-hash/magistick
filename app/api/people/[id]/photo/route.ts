import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/people/:id/photo → the person's photo bytes, or 404 (the UI falls back to initials). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const rows = (await sql()`SELECT photo FROM users WHERE id = ${params.id} LIMIT 1`) as { photo: string }[];
  const m = /^data:(image\/[a-z]+);base64,(.+)$/.exec(rows[0]?.photo ?? "");
  // Short private cache: a new photo shows up for others within 5 minutes; your own busts via ?v=.
  const cache = { "Cache-Control": "private, max-age=300" };
  if (!m) return new NextResponse(null, { status: 404, headers: cache });
  return new NextResponse(Buffer.from(m[2], "base64"), {
    headers: { ...cache, "Content-Type": m[1], "X-Content-Type-Options": "nosniff" },
  });
}
