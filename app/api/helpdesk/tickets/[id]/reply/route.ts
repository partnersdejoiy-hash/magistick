import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { HelpdeskError, replyToMyTicket } from "@/lib/helpdeskServer";

export const dynamic = "force-dynamic";

/** POST /api/helpdesk/tickets/:id/reply {text} → adds the caller's public reply in OrbitDesk. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const g = await requireMe(["raise_tickets"]);
  if ("error" in g) return g.error;
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  try {
    await replyToMyTicket(g.me, id, String(b.text ?? ""));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: e instanceof HelpdeskError ? e.status : 500 },
    );
  }
}
