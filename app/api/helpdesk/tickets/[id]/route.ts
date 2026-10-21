import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { getMyTicket, HelpdeskError } from "@/lib/helpdeskServer";
import { PREVIEW_TICKETS, UI_PREVIEW } from "@/lib/preview";

export const dynamic = "force-dynamic";

/** GET /api/helpdesk/tickets/:id → one of the caller's tickets with public replies and timeline. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const g = await requireMe(["raise_tickets"]);
  if ("error" in g) return g.error;
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  if (UI_PREVIEW) {
    const t = PREVIEW_TICKETS.find((x) => x.id === id);
    return t ? NextResponse.json({ ticket: t }) : NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }
  try {
    return NextResponse.json({ ticket: await getMyTicket(g.me, id) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Something went wrong." },
      { status: e instanceof HelpdeskError ? e.status : 500 },
    );
  }
}
