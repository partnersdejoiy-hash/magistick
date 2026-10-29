import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { rankOf } from "@/lib/rbac";
import {
  COMPETENCIES,
  DEACT_KINDS,
  isDate,
  isType,
  loadScope,
  todayIST,
  type Scope,
} from "@/lib/uplift";

export const dynamic = "force-dynamic";

/**
 * POST /api/uplift  { action, ...fields }  — every Uplift write goes through here.
 * Each action checks the caller's scope (their reporting line, delegations, HR, admin)
 * on the server; the pages only hide what this would refuse anyway.
 */

type Body = Record<string, unknown>;
class Bad extends Error {}

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const need = (v: unknown, what: string, max = 200) => {
  const s = str(v, max);
  if (!s) throw new Bad(`Add ${what}.`);
  return s;
};
const date = (v: unknown, what: string) => {
  if (!isDate(v)) throw new Bad(`Pick ${what}.`);
  return v;
};
const int = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};
const list = (v: unknown) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x));

function inTeam(s: Scope, id: string) {
  if (!s.teamIds.has(id)) throw new Bad("That person isn't in your team.");
}
const canDecide = (s: Scope) => s.isHR || rankOf(s.me.level) >= rankOf("ops_manager");

async function meetingOf(s: Scope, id: number) {
  const rows = (await sql()`SELECT id, coach_id FROM up_meetings WHERE id = ${id}`) as { id: number; coach_id: string }[];
  if (!rows[0]) throw new Bad("That meeting no longer exists.");
  return rows[0];
}

const actions: Record<string, (s: Scope, b: Body) => Promise<{ redirect?: string; message?: string }>> = {
  async "meeting.create"(s, b) {
    const db = sql();
    const type = b.type;
    if (!isType(type)) throw new Bad("Pick a meeting type.");
    const format = b.format === "team" ? "team" : "one";
    const held = date(b.held_on, "when the meeting happens");
    const people = Array.from(new Set(list(b.participants)));
    if (!people.length) throw new Bad("Choose who you're meeting with.");
    if (format === "one" && people.length > 1) throw new Bad("A 1:1 has exactly one person. Switch to a team meeting for more.");
    // Mentoring crosses reporting lines; everything else stays inside your team.
    if (type !== "mentor") people.forEach((id) => inTeam(s, id));
    else if (people.some((id) => !s.byId.has(id) || id === s.me.id)) throw new Bad("Pick someone from the directory.");
    let behalf: string | null = null;
    if (type === "delegated") {
      behalf = str(b.on_behalf_of);
      if (!s.delegators.some((d) => d.id === behalf)) throw new Bad("Delegated coaching needs someone who handed you their team.");
    }
    const title = need(b.title, "a meeting title");
    const agenda = str(b.agenda);
    const notes = str(b.notes, 20000);
    const visible = b.visible === "on" || b.visible === true;
    const [m] = (await db`
      INSERT INTO up_meetings (coach_id, on_behalf_of, format, type, title, agenda, notes, visible, held_on)
      VALUES (${s.me.id}, ${behalf}, ${format}, ${type}, ${title}, ${agenda}, ${notes}, ${visible}, ${held})
      RETURNING id`) as { id: number }[];
    for (const id of people) await db`INSERT INTO up_participants (meeting_id, user_id) VALUES (${m.id}, ${id})`;
    if (b.save_template === "on") {
      await db`INSERT INTO up_templates (owner_id, name, title, agenda, notes)
               VALUES (${s.me.id}, ${str(b.template_name, 80) || title}, ${title}, ${agenda}, ${notes})`;
    }
    return { redirect: `/uplift/m/${m.id}` };
  },

  async "meeting.update"(s, b) {
    const m = await meetingOf(s, int(b.id));
    if (m.coach_id !== s.me.id) throw new Bad("Only the coach can edit this log.");
    const acked = (await sql()`SELECT 1 FROM up_participants WHERE meeting_id = ${m.id} AND ack_at IS NOT NULL LIMIT 1`) as unknown[];
    if (acked.length) throw new Bad("Someone already acknowledged this log, so it's locked.");
    await sql()`
      UPDATE up_meetings SET title = ${need(b.title, "a meeting title")}, agenda = ${str(b.agenda)}, notes = ${str(b.notes, 20000)},
             visible = ${b.visible === "on"}, held_on = ${date(b.held_on, "the meeting date")}, updated_at = now()
       WHERE id = ${m.id}`;
    return { message: "Saved." };
  },

  async "meeting.delete"(s, b) {
    const m = await meetingOf(s, int(b.id));
    if (m.coach_id !== s.me.id) throw new Bad("Only the coach can delete this log.");
    const acked = (await sql()`SELECT 1 FROM up_participants WHERE meeting_id = ${m.id} AND ack_at IS NOT NULL LIMIT 1`) as unknown[];
    if (acked.length) throw new Bad("Acknowledged logs stay on the record.");
    await sql()`DELETE FROM up_meetings WHERE id = ${m.id}`;
    return { redirect: "/uplift" };
  },

  async "meeting.ack"(s, b) {
    const id = int(b.id);
    const rows = (await sql()`
      SELECT m.type, to_char(m.held_on, 'YYYY-MM-DD') AS held_on FROM up_meetings m
        JOIN up_participants p ON p.meeting_id = m.id
       WHERE m.id = ${id} AND p.user_id = ${s.me.id}`) as { type: string; held_on: string }[];
    if (!rows[0]) throw new Bad("This log isn't addressed to you.");
    if (rows[0].held_on > todayIST()) throw new Bad("You can acknowledge once the meeting has happened.");
    await sql()`UPDATE up_participants SET ack_at = now(), ack_note = ${str(b.note, 2000)}
                 WHERE meeting_id = ${id} AND user_id = ${s.me.id} AND ack_at IS NULL`;
    return { message: "Acknowledged. Your coach can see your note." };
  },

  async "template.delete"(s, b) {
    await sql()`DELETE FROM up_templates WHERE id = ${int(b.id)} AND owner_id = ${s.me.id}`;
    return {};
  },

  async "agenda.add"(s, b) {
    const report = str(b.report_id);
    if (!s.directs.some((p) => p.id === report)) throw new Bad("Agendas are for your direct reports.");
    await sql()`INSERT INTO up_agenda (owner_id, report_id, week, topic)
                VALUES (${s.me.id}, ${report}, ${date(b.week, "a week")}, ${need(b.topic, "a topic", 300)})`;
    return {};
  },
  async "agenda.toggle"(s, b) {
    await sql()`UPDATE up_agenda SET done = NOT done WHERE id = ${int(b.id)} AND owner_id = ${s.me.id}`;
    return {};
  },
  async "agenda.delete"(s, b) {
    await sql()`DELETE FROM up_agenda WHERE id = ${int(b.id)} AND owner_id = ${s.me.id}`;
    return {};
  },

  async "wellness.request"(s, b) {
    const service = b.service === "counselling" ? "counselling" : "life_coaching";
    const mode = ["video", "phone", "in_person"].includes(String(b.mode)) ? String(b.mode) : "video";
    await sql()`INSERT INTO up_wellness (user_id, kind, service, mode, preferred_on, slot, note)
                VALUES (${s.me.id}, 'session', ${service}, ${mode}, ${date(b.preferred_on, "a preferred date")}, ${str(b.slot, 60)}, ${str(b.note, 2000)})`;
    return { message: "Request sent. Only the wellness desk sees it." };
  },
  async "wellness.checkin"(s, b) {
    const mood = int(b.mood);
    if (!(mood >= 1 && mood <= 5)) throw new Bad("Pick how you're feeling.");
    await sql()`INSERT INTO up_wellness (user_id, kind, mood, note, status) VALUES (${s.me.id}, 'checkin', ${mood}, ${str(b.note, 2000)}, 'done')`;
    return { message: "Thanks for checking in." };
  },
  async "wellness.update"(s, b) {
    if (!s.isHR) throw new Bad("Only the wellness desk (HR) can update sessions.");
    const status = ["requested", "scheduled", "completed", "cancelled"].includes(String(b.status)) ? String(b.status) : "requested";
    await sql()`UPDATE up_wellness SET status = ${status}, coach = ${str(b.coach, 120)}, scheduled_for = ${str(b.scheduled_for, 60)},
                       action_items = ${str(b.action_items, 2000)}
                 WHERE id = ${int(b.id)} AND kind = 'session'`;
    return { message: "Session updated." };
  },
  async "wellness.survey"(s, b) {
    const n = int(b.survey);
    if (!(n >= 1 && n <= 5)) throw new Bad("Pick a rating from 1 to 5.");
    await sql()`UPDATE up_wellness SET survey = ${n} WHERE id = ${int(b.id)} AND user_id = ${s.me.id} AND status = 'completed'`;
    return { message: "Thanks — that helps us pick the right coaches." };
  },
  async "wellness.cancel"(s, b) {
    await sql()`UPDATE up_wellness SET status = 'cancelled' WHERE id = ${int(b.id)} AND user_id = ${s.me.id} AND status IN ('requested','scheduled')`;
    return {};
  },

  async "volunteer.add"(s, b) {
    const hours = Number(b.hours);
    if (!(hours > 0 && hours <= 24)) throw new Bad("Hours must be between 0 and 24.");
    await sql()`INSERT INTO up_volunteer (user_id, activity, on_date, hours, schedule, sponsored, partner, event, remarks)
                VALUES (${s.me.id}, ${need(b.activity, "the activity", 160)}, ${date(b.on_date, "the date")}, ${hours},
                        ${str(b.schedule, 60)}, ${b.sponsored === "on"}, ${str(b.partner, 160)}, ${str(b.event, 160)}, ${str(b.remarks, 1000)})`;
    return { message: "Logged. Thank you for showing up." };
  },
  async "volunteer.delete"(s, b) {
    await sql()`DELETE FROM up_volunteer WHERE id = ${int(b.id)} AND user_id = ${s.me.id}`;
    return {};
  },

  async "deact.raise"(s, b) {
    if (rankOf(s.me.level) < rankOf("team_leader")) throw new Bad("Team leaders and above raise deactivation cases.");
    const user = str(b.user_id);
    inTeam(s, user);
    const kind = DEACT_KINDS.find((k) => k.id === b.kind)?.id;
    if (!kind) throw new Bad("Pick NCNS or LWD+1.");
    const instances = Math.max(1, Math.min(30, int(b.instances) || 1));
    await sql()`INSERT INTO up_deactivations (user_id, raised_by, kind, from_date, shift, instances, reason)
                VALUES (${user}, ${s.me.id}, ${kind}, ${date(b.from_date, "the first missed date")}, ${str(b.shift, 40)}, ${instances}, ${need(b.reason, "a reason", 1000)})`;
    return { message: "Case raised. A manager or HR will decide." };
  },
  async "deact.decide"(s, b) {
    if (!canDecide(s)) throw new Bad("Operations managers and HR decide these cases.");
    const status = ["approved", "rejected", "reactivated"].includes(String(b.status)) ? String(b.status) : "";
    if (!status) throw new Bad("Pick a decision.");
    const rows = (await sql()`SELECT user_id, raised_by FROM up_deactivations WHERE id = ${int(b.id)}`) as { user_id: string; raised_by: string }[];
    if (!rows[0]) throw new Bad("That case no longer exists.");
    if (rows[0].raised_by === s.me.id && !s.isAdmin) throw new Bad("Someone other than the person who raised it decides.");
    if (!s.isHR) inTeam(s, rows[0].user_id);
    await sql()`UPDATE up_deactivations SET status = ${status}, decided_by = ${s.me.id}, decided_at = now(), decision_note = ${str(b.note, 1000)}
                 WHERE id = ${int(b.id)}`;
    return { message: "Decision saved." };
  },

  async "assess.create"(s, b) {
    if (rankOf(s.me.level) < rankOf("ops_manager")) throw new Bad("Competency assessments are for operations managers and up.");
    const user = str(b.user_id);
    inTeam(s, user);
    const scores: Record<string, { rating: number; note: string }> = {};
    for (const c of COMPETENCIES) {
      const rating = int(b[`r_${c.id}`]);
      if (!(rating >= 1 && rating <= 5)) throw new Bad(`Rate ${c.label}.`);
      scores[c.id] = { rating, note: str(b[`n_${c.id}`], 1000) };
    }
    const [a] = (await sql()`INSERT INTO up_assessments (user_id, created_by, scores, comment)
                             VALUES (${user}, ${s.me.id}, ${JSON.stringify(scores)}, ${str(b.comment, 4000)}) RETURNING id`) as { id: number }[];
    return { redirect: `/uplift/assessments/${a.id}` };
  },
  async "assess.ack"(s, b) {
    await sql()`UPDATE up_assessments SET ack_at = now(), ack_note = ${str(b.note, 2000)}
                 WHERE id = ${int(b.id)} AND user_id = ${s.me.id} AND ack_at IS NULL`;
    return { message: "Acknowledged." };
  },

  async "ooo.set"(s, b) {
    const from = date(b.from_date, "the first day away");
    const to = date(b.to_date, "the day you're back");
    if (to < from) throw new Bad("The last day can't be before the first.");
    await sql()`INSERT INTO up_ooo (user_id, from_date, to_date, note) VALUES (${s.me.id}, ${from}, ${to}, ${str(b.note, 300)})
                ON CONFLICT (user_id) DO UPDATE SET from_date = EXCLUDED.from_date, to_date = EXCLUDED.to_date, note = EXCLUDED.note`;
    const to_id = str(b.delegate_id);
    if (to_id) {
      if (!s.byId.has(to_id) || to_id === s.me.id) throw new Bad("Pick who covers your team.");
      await sql()`INSERT INTO up_delegations (from_id, to_id, starts, ends) VALUES (${s.me.id}, ${to_id}, ${from}, ${to})`;
    }
    return { message: "You're marked out of office." };
  },
  async "ooo.clear"(s) {
    await sql()`DELETE FROM up_ooo WHERE user_id = ${s.me.id}`;
    return {};
  },
  async "delegation.add"(s, b) {
    const to_id = str(b.to_id);
    if (!s.byId.has(to_id) || to_id === s.me.id) throw new Bad("Pick who covers your team.");
    const starts = date(b.starts, "a start date");
    const ends = date(b.ends, "an end date");
    if (ends < starts) throw new Bad("The end date can't be before the start.");
    await sql()`INSERT INTO up_delegations (from_id, to_id, starts, ends) VALUES (${s.me.id}, ${to_id}, ${starts}, ${ends})`;
    return { message: "Delegation saved." };
  },
  async "delegation.delete"(s, b) {
    await sql()`DELETE FROM up_delegations WHERE id = ${int(b.id)} AND from_id = ${s.me.id}`;
    return {};
  },
};

export async function POST(req: NextRequest) {
  let s: Scope | null;
  try {
    s = await loadScope();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Database not reachable." }, { status: 503 });
  }
  if (!s) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Body;
  const run = actions[String(body.action)];
  if (!run) return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...(await run(s, body)) });
  } catch (err) {
    if (err instanceof Bad) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("uplift", body.action, err);
    return NextResponse.json({ error: "Something went wrong saving that. Try again." }, { status: 500 });
  }
}

/** GET /api/uplift?export=assessments — the caller's visible assessments as CSV. */
export async function GET(req: NextRequest) {
  const s = await loadScope().catch(() => null);
  if (!s) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (req.nextUrl.searchParams.get("export") !== "assessments") return NextResponse.json({ error: "Unknown export." }, { status: 400 });
  const rows = (await sql()`
    SELECT id, user_id, created_by, scores, comment, ack_at::text AS ack_at, to_char(created_at, 'YYYY-MM-DD') AS created_on
      FROM up_assessments ORDER BY created_at DESC`) as {
    id: number; user_id: string; created_by: string; scores: Record<string, { rating: number }>; comment: string; ack_at: string | null; created_on: string;
  }[];
  const mine = rows.filter((r) => r.user_id === s.me.id || r.created_by === s.me.id || s.teamIds.has(r.user_id));
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Employee", "Email", "Position", "Created on", "Created by", "Status", ...COMPETENCIES.map((c) => c.label), "Comment"];
  const lines = mine.map((r) => {
    const p = s.byId.get(r.user_id);
    return [p?.name, p?.email, p?.title, r.created_on, s.byId.get(r.created_by)?.name, r.ack_at ? "Acknowledged" : "For acknowledgement",
      ...COMPETENCIES.map((c) => r.scores[c.id]?.rating ?? ""), r.comment].map(cell).join(",");
  });
  return new NextResponse([head.map(cell).join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="uplift-assessments-${todayIST()}.csv"` },
  });
}
