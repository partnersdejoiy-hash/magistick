import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** PATCH { rating: 1 | -1 | 0 } → thumbs up/down on one of Mitra's answers in the user's own chat. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const r = Number((await req.json().catch(() => ({})))?.rating);
  if (![1, -1, 0].includes(r)) return NextResponse.json({ error: "Rating must be 1, -1 or 0." }, { status: 400 });
  await sql()`
    UPDATE mitra_messages m SET rating = ${r === 0 ? null : r}
    FROM mitra_chats c
    WHERE m.id = ${params.id} AND m.role = 'assistant' AND c.id = m.chat_id AND c.user_id = ${g.me.id}`;
  return NextResponse.json({ ok: true });
}
