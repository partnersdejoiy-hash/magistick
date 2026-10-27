import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/mitra/chats?q= → the signed-in user's chats, newest first. */
export async function GET(req: NextRequest) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const q = `%${(req.nextUrl.searchParams.get("q") ?? "").trim().replace(/[%_\\]/g, "\\$&")}%`;
  const chats = await sql()`
    SELECT id, title, updated_at FROM mitra_chats
    WHERE user_id = ${g.me.id} AND title ILIKE ${q}
    ORDER BY updated_at DESC LIMIT 100`;
  return NextResponse.json({ chats });
}

/** DELETE /api/mitra/chats → clear all of the user's conversations. */
export async function DELETE() {
  const g = await requireMe();
  if ("error" in g) return g.error;
  await sql()`DELETE FROM mitra_chats WHERE user_id = ${g.me.id}`;
  return NextResponse.json({ ok: true });
}
