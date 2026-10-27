import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireMe } from "@/lib/auth";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

/** GET → messages of one of the user's own chats. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const db = sql();
  const chat = await db`SELECT id, title FROM mitra_chats WHERE id = ${params.id} AND user_id = ${g.me.id}`;
  if (!chat.length) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  const messages = await db`
    SELECT id, role, content, sources, rating FROM mitra_messages
    WHERE chat_id = ${params.id} ORDER BY created_at ASC`;
  return NextResponse.json({ chat: chat[0], messages });
}

/** PATCH { title } → rename. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const title = String((await req.json().catch(() => ({})))?.title ?? "").trim().slice(0, 70);
  if (!title) return NextResponse.json({ error: "Give the chat a name." }, { status: 400 });
  await sql()`UPDATE mitra_chats SET title = ${title} WHERE id = ${params.id} AND user_id = ${g.me.id}`;
  return NextResponse.json({ ok: true });
}

/** DELETE → remove the chat and its messages. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  await sql()`DELETE FROM mitra_chats WHERE id = ${params.id} AND user_id = ${g.me.id}`;
  return NextResponse.json({ ok: true });
}
