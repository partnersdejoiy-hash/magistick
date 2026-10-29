import { cache } from "react";
import { sql, ensureSchema } from "./db";
import { getMe, type Me } from "./auth";
import { loadPeople, type Person } from "./people";
import { rankOf } from "./rbac";
import { TYPE_BY_ID, addDays, todayIST, type MeetingRow } from "./upliftCore";
export * from "./upliftCore";

/**
 * Uplift — DEJOIY's coaching, check-in and growth log, living inside magistick.
 * Tables sit next to magistick's own in the BPO database (schema "portal"),
 * keyed by magistick user ids, created lazily like the rest of lib/db.ts.
 */

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS up_meetings (
     id SERIAL PRIMARY KEY,
     coach_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     on_behalf_of TEXT REFERENCES users(id) ON DELETE SET NULL,
     format TEXT NOT NULL,
     type TEXT NOT NULL,
     title TEXT NOT NULL,
     agenda TEXT NOT NULL DEFAULT '',
     notes TEXT NOT NULL DEFAULT '',
     visible BOOLEAN NOT NULL DEFAULT TRUE,
     held_on DATE NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS up_participants (
     meeting_id INTEGER NOT NULL REFERENCES up_meetings(id) ON DELETE CASCADE,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     ack_at TIMESTAMPTZ,
     ack_note TEXT NOT NULL DEFAULT '',
     PRIMARY KEY (meeting_id, user_id)
   )`,
  `CREATE INDEX IF NOT EXISTS up_participants_user_idx ON up_participants (user_id)`,
  `CREATE TABLE IF NOT EXISTS up_templates (
     id SERIAL PRIMARY KEY,
     owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     title TEXT NOT NULL DEFAULT '',
     agenda TEXT NOT NULL DEFAULT '',
     notes TEXT NOT NULL DEFAULT ''
   )`,
  `CREATE TABLE IF NOT EXISTS up_agenda (
     id SERIAL PRIMARY KEY,
     owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     report_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     week DATE NOT NULL,
     topic TEXT NOT NULL,
     done BOOLEAN NOT NULL DEFAULT FALSE
   )`,
  `CREATE TABLE IF NOT EXISTS up_wellness (
     id SERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     kind TEXT NOT NULL,
     service TEXT NOT NULL DEFAULT '',
     mode TEXT NOT NULL DEFAULT '',
     preferred_on DATE,
     slot TEXT NOT NULL DEFAULT '',
     mood INTEGER,
     note TEXT NOT NULL DEFAULT '',
     status TEXT NOT NULL DEFAULT 'requested',
     coach TEXT NOT NULL DEFAULT '',
     scheduled_for TEXT NOT NULL DEFAULT '',
     action_items TEXT NOT NULL DEFAULT '',
     survey INTEGER,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS up_volunteer (
     id SERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     activity TEXT NOT NULL,
     on_date DATE NOT NULL,
     hours NUMERIC(5,2) NOT NULL,
     schedule TEXT NOT NULL DEFAULT '',
     sponsored BOOLEAN NOT NULL DEFAULT FALSE,
     partner TEXT NOT NULL DEFAULT '',
     event TEXT NOT NULL DEFAULT '',
     remarks TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS up_deactivations (
     id SERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     raised_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     kind TEXT NOT NULL,
     from_date DATE NOT NULL,
     shift TEXT NOT NULL DEFAULT '',
     instances INTEGER NOT NULL DEFAULT 1,
     reason TEXT NOT NULL DEFAULT '',
     status TEXT NOT NULL DEFAULT 'pending',
     decided_by TEXT REFERENCES users(id) ON DELETE SET NULL,
     decided_at TIMESTAMPTZ,
     decision_note TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS up_assessments (
     id SERIAL PRIMARY KEY,
     user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     scores JSONB NOT NULL,
     comment TEXT NOT NULL DEFAULT '',
     ack_at TIMESTAMPTZ,
     ack_note TEXT NOT NULL DEFAULT '',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS up_ooo (
     user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     from_date DATE NOT NULL,
     to_date DATE NOT NULL,
     note TEXT NOT NULL DEFAULT ''
   )`,
  `CREATE TABLE IF NOT EXISTS up_delegations (
     id SERIAL PRIMARY KEY,
     from_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     to_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     starts DATE NOT NULL,
     ends DATE NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
];

let ready: Promise<void> | null = null;
export function ensureUplift(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await ensureSchema();
      for (const s of STATEMENTS) await sql().query(s);
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

// ---------------------------------------------------------------- who sees whom

export type Scope = {
  me: Me;
  people: Person[];
  byId: Map<string, Person>;
  /** Everyone below me in my line, plus the lines delegated to me right now. */
  team: Person[];
  teamIds: Set<string>;
  /** Direct reports, plus direct reports of people who delegated to me. */
  directs: Person[];
  /** People who delegated their team to me today. */
  delegators: Person[];
  isAdmin: boolean;
  isHR: boolean;
};

function below(id: string, people: Person[]): Person[] {
  const out: Person[] = [];
  const seen = new Set([id]);
  let frontier = [id];
  while (frontier.length) {
    const next = people.filter((p) => p.manager_id && frontier.includes(p.manager_id) && !seen.has(p.id));
    next.forEach((p) => seen.add(p.id));
    out.push(...next);
    frontier = next.map((p) => p.id);
  }
  return out;
}

/** Cached per request, so the layout and the page share one lookup. */
export const loadScope = cache(async (): Promise<Scope | null> => {
  const me = await getMe();
  if (!me) return null;
  await ensureUplift();
  const people = (await loadPeople()).filter((p) => p.status === "active");
  const byId = new Map(people.map((p) => [p.id, p]));
  const today = todayIST();
  const dels = (await sql()`SELECT from_id FROM up_delegations WHERE to_id = ${me.id} AND starts <= ${today} AND ends >= ${today}`) as { from_id: string }[];
  const delegators = dels.map((d) => byId.get(d.from_id)).filter((p): p is Person => !!p);
  const isAdmin = rankOf(me.level) >= rankOf("admin");
  const isHR = me.department === "hr" || isAdmin;

  const map = new Map<string, Person>();
  const add = (list: Person[]) => list.forEach((p) => p.id !== me.id && map.set(p.id, p));
  if (isAdmin) add(people);
  else {
    add(below(me.id, people));
    delegators.forEach((d) => add(below(d.id, people)));
  }
  const team = Array.from(map.values());
  const leads = new Set([me.id, ...delegators.map((d) => d.id)]);
  const directs = people.filter((p) => p.manager_id && leads.has(p.manager_id) && p.id !== me.id);
  return { me, people, byId, team, teamIds: new Set(team.map((p) => p.id)), directs, delegators, isAdmin, isHR };
});

// ---------------------------------------------------------------- meetings

/** One row per coach–participant pair, like a coaching log. */
export async function meetingRows(where: string, params: unknown[]): Promise<MeetingRow[]> {
  return (await sql().query(
    `SELECT m.id, m.coach_id, m.on_behalf_of, m.format, m.type, m.title, m.agenda, m.notes, m.visible,
            to_char(m.held_on, 'YYYY-MM-DD') AS held_on, p.user_id, p.ack_at::text AS ack_at, p.ack_note
       FROM up_meetings m JOIN up_participants p ON p.meeting_id = m.id
      WHERE ${where}
      ORDER BY m.held_on DESC, m.id DESC
      LIMIT 500`,
    params,
  )) as MeetingRow[];
}

/** May this person read a meeting? Coach, participant, their managers, admins. */
export function canSeeMeeting(s: Scope, coachId: string, participantIds: string[]) {
  if (s.isAdmin || coachId === s.me.id || participantIds.includes(s.me.id)) return true;
  return s.teamIds.has(coachId) || participantIds.some((id) => s.teamIds.has(id));
}

// ---------------------------------------------------------------- notifications

export type Notice = { href: string; text: string };

export async function notices(s: Scope): Promise<Notice[]> {
  const db = sql();
  const today = todayIST();
  const out: Notice[] = [];
  const acks = await meetingRows(`p.user_id = $1 AND p.ack_at IS NULL AND m.held_on <= $2`, [s.me.id, today]);
  for (const m of acks.filter((r) => TYPE_BY_ID[r.type]?.ack)) {
    out.push({ href: `/uplift/m/${m.id}`, text: `Acknowledge “${m.title}” with ${s.byId.get(m.coach_id)?.name ?? "your coach"}` });
  }
  const assess = (await db`SELECT id FROM up_assessments WHERE user_id = ${s.me.id} AND ack_at IS NULL`) as { id: number }[];
  for (const a of assess) out.push({ href: `/uplift/assessments/${a.id}`, text: "A competency assessment is waiting for your acknowledgement" });
  const late = await meetingRows(`m.coach_id = $1 AND p.ack_at IS NULL AND m.held_on <= $2`, [s.me.id, addDays(today, -2)]);
  const lateCount = late.filter((r) => TYPE_BY_ID[r.type]?.ack).length;
  if (lateCount) out.push({ href: "/uplift?tab=alerts", text: `${lateCount} of your coaching logs are still unacknowledged after 2 days` });
  if (rankOf(s.me.level) >= rankOf("ops_manager") || s.isHR) {
    const ids = Array.from(s.teamIds);
    const pend = (await db`SELECT count(*)::int AS c FROM up_deactivations WHERE status = 'pending' AND (${s.isHR} OR user_id = ANY(${ids}))`) as { c: number }[];
    if (pend[0].c) out.push({ href: "/uplift/deactivation", text: `${pend[0].c} interim deactivation ${pend[0].c === 1 ? "case needs" : "cases need"} a decision` });
  }
  if (s.isHR) {
    const w = (await db`SELECT count(*)::int AS c FROM up_wellness WHERE kind = 'session' AND status = 'requested'`) as { c: number }[];
    if (w[0].c) out.push({ href: "/uplift/wellness?view=desk", text: `${w[0].c} wellness ${w[0].c === 1 ? "request is" : "requests are"} waiting to be scheduled` });
  }
  for (const d of s.delegators) out.push({ href: "/uplift/summary", text: `You're covering ${d.name}'s team today` });
  return out;
}

