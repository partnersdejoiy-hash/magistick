import { sql } from "./db";
import type { Me } from "./auth";
import { CATEGORY_BY_ID, REPLY_PREFIX } from "./helpdesk";
import { orbitdeskConfigured, proxyToOrbitDesk } from "./orbitdesk";

/**
 * Get Help ↔ OrbitDesk, server side only.
 *
 * magistick talks to OrbitDesk as one integration account and owns the
 * "who raised what" mapping (helpdesk_tickets), so an employee can only ever
 * read or reply to tickets they raised here. Internal notes never leave this
 * file: only comments with isInternal === false are returned.
 */

export class HelpdeskError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

type OrbitTicket = {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  departmentName: string | null;
  assigneeName: string | null;
  slaDeadline: string | null;
  slaBreached: boolean;
  createdAt: string;
  updatedAt: string;
  category?: string | null;
  subcategory?: string | null;
  comments?: OrbitComment[];
  history?: { action: string; oldValue: string | null; newValue: string | null; changedByName?: string; createdAt: string }[];
};
type OrbitComment = { id: number; content: string; isInternal: boolean; authorId: number; authorName?: string; createdAt: string };

async function orbit<T>(path: string, init: { method?: string; body?: unknown; query?: string } = {}): Promise<T> {
  if (!orbitdeskConfigured()) throw new HelpdeskError("OrbitDesk is not connected yet.", 503);
  const r = await proxyToOrbitDesk(path, {
    method: init.method,
    query: init.query,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  let data: unknown = null;
  try {
    data = r.body ? JSON.parse(r.body) : null;
  } catch {
    data = null;
  }
  if (r.status >= 400) {
    const d = data as { error?: string; message?: string } | null;
    throw new HelpdeskError(d?.message || d?.error || `OrbitDesk returned ${r.status}`, r.status === 404 ? 404 : 502);
  }
  return data as T;
}

/** The integration account's own OrbitDesk user id (to tell its posts apart). */
let selfId: number | null = null;
async function integrationUserId(): Promise<number | null> {
  if (selfId !== null) return selfId;
  try {
    const me = await orbit<{ id?: number; user?: { id?: number } }>("auth/me");
    selfId = Number(me?.user?.id ?? me?.id) || null;
  } catch {
    selfId = null;
  }
  return selfId;
}

/** Find the employee's OrbitDesk account by email (via name search; the API has no email filter). */
const orbitUserCache = new Map<string, number | null>();
async function orbitUserIdFor(me: Me): Promise<number | null> {
  const key = me.email.toLowerCase();
  if (orbitUserCache.has(key)) return orbitUserCache.get(key)!;
  let id: number | null = null;
  try {
    const rows = await orbit<{ id: number; email?: string; role?: string; isActive?: boolean }[] | { users?: { id: number; email?: string }[] }>(
      "directory",
      { query: `?name=${encodeURIComponent(me.name)}` },
    );
    const list = Array.isArray(rows) ? rows : (rows?.users ?? []);
    id = list.find((u) => (u.email ?? "").toLowerCase() === key)?.id ?? null;
  } catch {
    id = null;
  }
  orbitUserCache.set(key, id);
  return id;
}

/** OrbitDesk department id for a category: first name match, else none (OrbitDesk classifies). */
let deptCache: { at: number; list: { id: number; name: string }[] } | null = null;
async function departmentFor(names: string[]): Promise<number | undefined> {
  if (!deptCache || Date.now() - deptCache.at > 10 * 60_000) {
    try {
      const d = await orbit<{ id: number; name: string }[] | { departments?: { id: number; name: string }[] }>("departments");
      deptCache = { at: Date.now(), list: Array.isArray(d) ? d : (d?.departments ?? []) };
    } catch {
      deptCache = { at: Date.now(), list: [] };
    }
  }
  for (const n of names) {
    const hit = deptCache.list.find((d) => d.name.trim().toLowerCase() === n.toLowerCase());
    if (hit) return hit.id;
  }
  return undefined;
}

export type MyTicket = {
  id: number;
  ticketNumber: string;
  category: string;
  subcategory: string;
  subject: string;
  status: string;
  priority: string;
  assignee: string;
  department: string;
  slaDeadline: string | null;
  createdAt: string;
  updatedAt: string;
};

const rowToTicket = (r: Record<string, unknown>): MyTicket => ({
  id: Number(r.orbit_id),
  ticketNumber: String(r.ticket_number),
  category: String(r.category),
  subcategory: String(r.subcategory),
  subject: String(r.subject),
  status: String(r.status),
  priority: String(r.priority),
  assignee: String(r.assignee ?? ""),
  department: String(r.department ?? ""),
  slaDeadline: (r.sla_deadline as string | null) ?? null,
  createdAt: new Date(String(r.created_at)).toISOString(),
  updatedAt: new Date(String(r.updated_at)).toISOString(),
});

async function cache(t: OrbitTicket) {
  await sql()`
    UPDATE helpdesk_tickets SET status = ${t.status}, priority = ${t.priority},
      assignee = ${t.assigneeName ?? ""}, department = ${t.departmentName ?? ""},
      sla_deadline = ${t.slaDeadline}, updated_at = ${t.updatedAt}, synced_at = now()
    WHERE orbit_id = ${t.id}`;
}

/** The employee's tickets, newest first. Open tickets not synced for 2+ minutes are refreshed (max 10). */
export async function listMyTickets(me: Me): Promise<MyTicket[]> {
  const rows = (await sql()`
    SELECT * FROM helpdesk_tickets WHERE user_id = ${me.id} ORDER BY created_at DESC LIMIT 200`) as Record<string, unknown>[];
  if (orbitdeskConfigured()) {
    const stale = rows
      .filter((r) => !["closed"].includes(String(r.status)) && Date.now() - new Date(String(r.synced_at)).getTime() > 120_000)
      .slice(0, 10);
    const fresh = await Promise.allSettled(stale.map((r) => orbit<OrbitTicket>(`tickets/${Number(r.orbit_id)}`)));
    for (const f of fresh) if (f.status === "fulfilled" && f.value?.id) await cache(f.value);
    if (stale.length) {
      const again = (await sql()`
        SELECT * FROM helpdesk_tickets WHERE user_id = ${me.id} ORDER BY created_at DESC LIMIT 200`) as Record<string, unknown>[];
      return again.map(rowToTicket);
    }
  }
  return rows.map(rowToTicket);
}

export type NewTicket = { categoryId: string; subcategory: string; subject: string; description: string; priority?: string };

export async function createTicket(me: Me, input: NewTicket): Promise<MyTicket> {
  const cat = CATEGORY_BY_ID[input.categoryId];
  const sub = cat?.subcategories.find((s) => s.name === input.subcategory);
  if (!cat || !sub) throw new HelpdeskError("Choose a category and subcategory.", 400);
  const subject = input.subject.trim();
  const description = input.description.trim();
  if (subject.length < 4 || subject.length > 200) throw new HelpdeskError("Subject should be 4–200 characters.", 400);
  if (description.length < 10 || description.length > 8000) throw new HelpdeskError("Describe the issue in 10–8000 characters.", 400);
  const priority = ["low", "medium", "high", "urgent"].includes(input.priority ?? "") ? input.priority! : (sub.priority ?? "medium");

  const [raisedForUserId, departmentId] = await Promise.all([orbitUserIdFor(me), departmentFor(cat.orbitDepartments)]);
  const header = [`Raised by: ${me.name} <${me.email}>`, me.title && `Title: ${me.title}`, `Department: ${me.department}`, `Via: magistick Get Help`]
    .filter(Boolean)
    .join("\n");

  const t = await orbit<OrbitTicket>("tickets", {
    method: "POST",
    body: {
      subject,
      description: `${description}\n\n---\n${header}`,
      priority,
      category: cat.name,
      subcategory: sub.name,
      ...(departmentId ? { departmentId } : {}),
      ...(raisedForUserId ? { raisedForUserId } : {}),
      raisedForName: me.name,
      raisedForEmail: me.email,
      tags: ["magistick"],
    },
  });
  if (!t?.id) throw new HelpdeskError("OrbitDesk did not return the new ticket.");

  await sql()`
    INSERT INTO helpdesk_tickets (orbit_id, ticket_number, user_id, category, subcategory, subject, status, priority, assignee, department, sla_deadline, created_at, updated_at)
    VALUES (${t.id}, ${t.ticketNumber}, ${me.id}, ${cat.name}, ${sub.name}, ${subject}, ${t.status}, ${t.priority},
            ${t.assigneeName ?? ""}, ${t.departmentName ?? ""}, ${t.slaDeadline}, ${t.createdAt}, ${t.updatedAt})
    ON CONFLICT (orbit_id) DO NOTHING`;
  const [row] = (await sql()`SELECT * FROM helpdesk_tickets WHERE orbit_id = ${t.id}`) as Record<string, unknown>[];
  return rowToTicket(row);
}

async function ownedRow(me: Me, id: number) {
  const [row] = (await sql()`
    SELECT * FROM helpdesk_tickets WHERE orbit_id = ${id} AND user_id = ${me.id} LIMIT 1`) as Record<string, unknown>[];
  if (!row) throw new HelpdeskError("Ticket not found.", 404);
  return row;
}

export type Message = { id: number; from: "you" | "support"; author: string; body: string; at: string };
export type TicketView = MyTicket & {
  description: string;
  slaBreached: boolean;
  messages: Message[];
  timeline: { label: string; at: string }[];
};

const HISTORY_LABEL: Record<string, (h: { oldValue: string | null; newValue: string | null }) => string | null> = {
  created: () => "Ticket raised",
  status_changed: (h) => `Status: ${(h.newValue ?? "").replace("_", " ")}`,
  assignee_changed: () => "Assigned to an agent",
  priority_changed: (h) => `Priority: ${h.newValue}`,
};

/** One ticket the employee owns, with public replies only, freshly read from OrbitDesk. */
export async function getMyTicket(me: Me, id: number): Promise<TicketView> {
  const row = await ownedRow(me, id);
  const [t, botId] = await Promise.all([orbit<OrbitTicket>(`tickets/${id}`), integrationUserId()]);
  await cache(t);
  const comments = (t.comments ?? (await orbit<OrbitComment[]>(`tickets/${id}/comments`))).filter((c) => c.isInternal === false);
  const mine = `${REPLY_PREFIX}${me.name}:\n\n`;
  const messages: Message[] = comments.map((c) => {
    const byPortal = botId !== null ? c.authorId === botId : c.content.startsWith(REPLY_PREFIX);
    const yours = byPortal && c.content.startsWith(mine);
    return {
      id: c.id,
      from: yours ? "you" : "support",
      author: yours ? me.name : c.authorName || "Support team",
      body: yours ? c.content.slice(mine.length) : c.content,
      at: c.createdAt,
    };
  });
  const timeline = (t.history ?? [])
    .map((h) => ({ label: HISTORY_LABEL[h.action]?.(h) ?? null, at: h.createdAt }))
    .filter((h): h is { label: string; at: string } => !!h.label);
  const base = rowToTicket({ ...row, status: t.status, priority: t.priority, assignee: t.assigneeName ?? "", department: t.departmentName ?? "", sla_deadline: t.slaDeadline, updated_at: t.updatedAt });
  return {
    ...base,
    description: t.description.split("\n\n---\nRaised by:")[0],
    slaBreached: !!t.slaBreached,
    messages,
    timeline,
  };
}

/** Post the employee's public reply (sent by the integration account, marked with their name). */
export async function replyToMyTicket(me: Me, id: number, text: string): Promise<void> {
  const body = text.trim();
  if (body.length < 1 || body.length > 6000) throw new HelpdeskError("Write a reply of up to 6000 characters.", 400);
  const row = await ownedRow(me, id);
  if (String(row.status) === "closed") throw new HelpdeskError("This ticket is closed. Raise a new one if you still need help.", 409);
  await orbit(`tickets/${id}/comments`, { method: "POST", body: { content: `${REPLY_PREFIX}${me.name}:\n\n${body}`, isInternal: false } });
  await sql()`UPDATE helpdesk_tickets SET synced_at = now() - interval '1 hour' WHERE orbit_id = ${id}`;
}
