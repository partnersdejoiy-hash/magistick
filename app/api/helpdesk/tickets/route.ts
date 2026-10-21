import { NextResponse } from "next/server";
import { requireMe } from "@/lib/auth";
import { createTicket, HelpdeskError, listMyTickets } from "@/lib/helpdeskServer";
import { orbitdeskConfigured } from "@/lib/orbitdesk";

export const dynamic = "force-dynamic";

const fail = (e: unknown) =>
  NextResponse.json(
    { error: e instanceof Error ? e.message : "Something went wrong." },
    { status: e instanceof HelpdeskError ? e.status : 500 },
  );

/** GET /api/helpdesk/tickets → the caller's own tickets (never anyone else's). */
export async function GET() {
  const g = await requireMe(["raise_tickets"]);
  if ("error" in g) return g.error;
  try {
    return NextResponse.json({ connected: orbitdeskConfigured(), tickets: await listMyTickets(g.me) });
  } catch (e) {
    return fail(e);
  }
}

/** POST /api/helpdesk/tickets {categoryId, subcategory, subject, description, priority?} → creates it in OrbitDesk. */
export async function POST(req: Request) {
  const g = await requireMe(["raise_tickets"]);
  if ("error" in g) return g.error;
  const b = await req.json().catch(() => ({}));
  try {
    const ticket = await createTicket(g.me, {
      categoryId: String(b.categoryId ?? ""),
      subcategory: String(b.subcategory ?? ""),
      subject: String(b.subject ?? ""),
      description: String(b.description ?? ""),
      priority: typeof b.priority === "string" ? b.priority : undefined,
    });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (e) {
    return fail(e);
  }
}
