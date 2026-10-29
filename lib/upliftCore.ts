/** Uplift vocabulary, IST date helpers and status rules. Pure: safe on server and client. */

// ---------------------------------------------------------------- vocabulary

export const MEETING_TYPES = [
  { id: "regular", label: "Regular coaching", ack: true, counts: true, blurb: "Your weekly coaching with a direct report. Needs their acknowledgement." },
  { id: "delegated", label: "Delegated coaching", ack: true, counts: true, blurb: "Coaching someone's team while they are away. Needs acknowledgement." },
  { id: "mentor", label: "Mentor session", ack: true, counts: false, blurb: "Mentoring outside the reporting line. Needs acknowledgement; doesn't count towards compliance." },
  { id: "powerup", label: "Power-up", ack: false, counts: false, blurb: "Extra coaching towards a certification or skill." },
  { id: "pip", label: "Improvement plan (PIP)", ack: true, counts: true, blurb: "Coaching for someone on a Performance Improvement Plan. Needs acknowledgement." },
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number]["id"];
export const TYPE_BY_ID = Object.fromEntries(MEETING_TYPES.map((t) => [t.id, t])) as Record<MeetingType, (typeof MEETING_TYPES)[number]>;
export const isType = (v: unknown): v is MeetingType => typeof v === "string" && v in TYPE_BY_ID;

export const COMPETENCIES = [
  { id: "communication", label: "Communication", hint: "Clear, calm and kind with customers and the team." },
  { id: "process", label: "Process knowledge", hint: "Knows the workflow, tools and policies of the program." },
  { id: "quality", label: "Quality focus", hint: "Gets it right first time; acts on QA feedback." },
  { id: "ownership", label: "Ownership", hint: "Follows through, shows up, owns the outcome." },
  { id: "problem", label: "Problem solving", hint: "Finds the root cause and a fix, not a workaround." },
  { id: "people", label: "Coaching & people", hint: "Lifts others: shares knowledge, gives honest feedback." },
] as const;

/** Mean rating across the competencies that were scored. */
export function avg(scores: Record<string, { rating: number }>) {
  const r = COMPETENCIES.map((c) => scores[c.id]?.rating ?? 0).filter(Boolean);
  return r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0;
}

export const RATING = ["", "Needs support", "Developing", "Meets the bar", "Strong", "Role model"] as const;

export const MOODS = ["", "Rough", "Low", "Okay", "Good", "Great"] as const;

export const DEACT_KINDS = [
  { id: "ncns", label: "No call, no show", short: "NCNS" },
  { id: "lwd", label: "Past last working day", short: "LWD+1" },
] as const;

// ---------------------------------------------------------------- dates (IST)

export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}
export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Monday of the week containing `iso`. */
export function mondayOf(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return mondayOf(todayIST());
  return addDays(iso, -((d.getUTCDay() + 6) % 7));
}
export const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
export const code = (id: number) => `UP-${String(id).padStart(5, "0")}`;

export type MeetingRow = {
  id: number;
  coach_id: string;
  on_behalf_of: string | null;
  format: "one" | "team";
  type: MeetingType;
  title: string;
  agenda: string;
  notes: string;
  visible: boolean;
  held_on: string;
  user_id: string;
  ack_at: string | null;
  ack_note: string;
};

export type Status = "pending" | "for_ack" | "acknowledged" | "logged";

export function statusOf(m: Pick<MeetingRow, "held_on" | "type" | "ack_at">, today = todayIST()): Status {
  if (m.ack_at) return "acknowledged";
  if (m.held_on > today) return "pending";
  return TYPE_BY_ID[m.type]?.ack ? "for_ack" : "logged";
}

export const STATUS_LABEL: Record<Status, string> = {
  pending: "Pending",
  for_ack: "For acknowledgement",
  acknowledged: "Acknowledged",
  logged: "Logged",
};

/** Self-checks for the date helpers; run with `npx tsx lib/uplift.ts --check`. */
if (typeof process !== "undefined" && process.argv.includes("--check")) {
  const assert = (ok: boolean, m: string) => {
    if (!ok) throw new Error(m);
  };
  assert(mondayOf("2026-10-30") === "2026-10-26", "friday → monday");
  assert(mondayOf("2026-10-26") === "2026-10-26", "monday stays");
  assert(mondayOf("2026-11-01") === "2026-10-26", "sunday → previous monday");
  assert(statusOf({ held_on: "2099-01-01", type: "regular", ack_at: null }) === "pending", "future = pending");
  assert(statusOf({ held_on: "2020-01-01", type: "powerup", ack_at: null }) === "logged", "powerup no ack");
  assert(statusOf({ held_on: "2020-01-01", type: "regular", ack_at: null }) === "for_ack", "needs ack");
  console.log("uplift checks ok");
}
