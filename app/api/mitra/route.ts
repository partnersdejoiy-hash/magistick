import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";
import { requireMe } from "@/lib/auth";
import { prepare, streamAnswer } from "@/lib/mitra";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_INPUT = 6000;

/**
 * POST /api/mitra { chatId?, message } → NDJSON stream:
 *   {"type":"meta","chatId","sources"} · {"type":"delta","text"}… · {"type":"done","messageId"} | {"type":"error","error"}
 */
export async function POST(req: NextRequest) {
  const g = await requireMe();
  if ("error" in g) return g.error;
  const me = g.me;
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  if (message.length > MAX_INPUT) return NextResponse.json({ error: `Keep it under ${MAX_INPUT} characters.` }, { status: 400 });

  const db = sql();
  let chatId = typeof body?.chatId === "string" ? body.chatId : "";
  if (chatId) {
    const own = await db`SELECT 1 FROM mitra_chats WHERE id = ${chatId} AND user_id = ${me.id}`;
    if (!own.length) return NextResponse.json({ error: "That chat no longer exists." }, { status: 404 });
  } else {
    chatId = randomUUID();
    const title = message.replace(/\s+/g, " ").slice(0, 70);
    await db`INSERT INTO mitra_chats (id, user_id, title) VALUES (${chatId}, ${me.id}, ${title})`;
  }

  const history = (await db`
    SELECT role, content FROM mitra_messages WHERE chat_id = ${chatId}
    ORDER BY created_at DESC LIMIT 12`).reverse() as { role: string; content: string }[];
  await db`INSERT INTO mitra_messages (id, chat_id, role, content) VALUES (${randomUUID()}, ${chatId}, 'user', ${message})`;

  const { system, sources } = await prepare(me, message);
  const messages = [{ role: "system", content: system }, ...history, { role: "user", content: message }];
  const enc = new TextEncoder();
  const line = (o: unknown) => enc.encode(JSON.stringify(o) + "\n");

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(line({ type: "meta", chatId, sources }));
      let answer = "";
      try {
        for await (const text of streamAnswer(messages, req.signal)) {
          answer += text;
          controller.enqueue(line({ type: "delta", text }));
        }
        if (!answer.trim()) throw new Error("Mitra got an empty answer. Please ask again.");
        // Keep only the sources the answer actually cites; all of them if it cites none.
        const cited = sources.filter((s) => answer.includes(`[${s.n}]`));
        const messageId = randomUUID();
        await db`INSERT INTO mitra_messages (id, chat_id, role, content, sources)
                 VALUES (${messageId}, ${chatId}, 'assistant', ${answer}, ${JSON.stringify(cited.length ? cited : sources)})`;
        await db`UPDATE mitra_chats SET updated_at = now() WHERE id = ${chatId}`;
        controller.enqueue(line({ type: "done", messageId }));
      } catch (err) {
        controller.enqueue(line({ type: "error", error: err instanceof Error ? err.message : "Mitra could not answer." }));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
