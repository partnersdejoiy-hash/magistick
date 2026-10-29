import ActionForm from "@/components/uplift/ActionForm";
import { Empty, Field, Panel, PageHead, PersonCell, Tabs, area, btn, day, input, td, th } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { MOODS, loadScope, todayIST } from "@/lib/uplift";

export const metadata = { title: "Wellness" };

type W = {
  id: number;
  user_id: string;
  kind: "session" | "checkin";
  service: string;
  mode: string;
  preferred_on: string | null;
  slot: string;
  mood: number | null;
  note: string;
  status: string;
  coach: string;
  scheduled_for: string;
  action_items: string;
  survey: number | null;
  created_on: string;
};

const SERVICE: Record<string, string> = { life_coaching: "Life coaching", counselling: "Counselling" };
const MODE: Record<string, string> = { video: "Video call", phone: "Phone", in_person: "In person" };
const STATUS: Record<string, string> = {
  requested: "bg-parchment text-stone-700",
  scheduled: "bg-sky-50 text-sky-800",
  completed: "bg-ok-tint text-ok",
  cancelled: "bg-stone-100 text-stone-500",
};
const MOOD_TINT = ["", "#B3261E", "#C2561A", "#8A8A92", "#1F6F78", "#2F6B3B"];
const sid = (id: number) => `W-${String(id).padStart(4, "0")}`;
const cols = `id, user_id, kind, service, mode, to_char(preferred_on, 'YYYY-MM-DD') AS preferred_on, slot, mood, note, status, coach,
              scheduled_for, action_items, survey, to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS created_on`;

export default async function Wellness({ searchParams }: { searchParams: { view?: string } }) {
  const s = (await loadScope())!;
  const desk = s.isHR && searchParams.view === "desk";
  const mine = (await sql().query(`SELECT ${cols} FROM up_wellness WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`, [s.me.id])) as W[];
  const queue = desk
    ? ((await sql().query(`SELECT ${cols} FROM up_wellness WHERE kind = 'session' ORDER BY (status = 'requested') DESC, created_at DESC LIMIT 300`)) as W[])
    : [];
  const sessions = mine.filter((w) => w.kind === "session");
  const checkins = mine.filter((w) => w.kind === "checkin").slice(0, 14);
  const waiting = s.isHR ? ((await sql()`SELECT count(*)::int AS c FROM up_wellness WHERE kind = 'session' AND status = 'requested'`) as { c: number }[])[0].c : 0;

  return (
    <div>
      <PageHead title="Wellness">
        Talk to a life coach or a counsellor, or just note how you&rsquo;re doing. What you share here stays between you and the wellness desk. Your
        team leader and managers never see it.
      </PageHead>

      {s.isHR && (
        <div className="mb-5">
          <Tabs
            active={desk ? "desk" : "me"}
            items={[
              { id: "me", label: "My wellness", href: "/uplift/wellness" },
              { id: "desk", label: "Wellness desk", href: "/uplift/wellness?view=desk", count: waiting },
            ]}
          />
        </div>
      )}

      {desk ? (
        <Panel title="Session requests">
          {queue.length === 0 ? (
            <Empty title="No session requests yet" />
          ) : (
            <ul className="divide-y divide-line">
              {queue.map((w) => (
                <li key={w.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <PersonCell p={s.byId.get(w.user_id)} />
                    <p className="text-[12.5px] leading-relaxed text-stone-600">
                      <span className="tabular font-medium text-ink">{sid(w.id)}</span> · {SERVICE[w.service]} · {MODE[w.mode]}
                      <br />
                      Prefers {day(w.preferred_on)}
                      {w.slot && `, ${w.slot}`}
                    </p>
                    {w.note && <p className="rounded-lg bg-ground px-3 py-2 text-[13px] leading-snug text-stone-700">{w.note}</p>}
                    {w.survey && <p className="text-[12.5px] text-stone-600">Rated the session {w.survey}/5</p>}
                  </div>
                  <ActionForm action="wellness.update" className="grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={w.id} />
                    <Field label="Status">
                      <select name="status" defaultValue={w.status} className={input}>
                        {Object.keys(STATUS).map((k) => (
                          <option key={k} value={k}>
                            {k[0].toUpperCase() + k.slice(1)}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Coach or counsellor">
                      <input name="coach" defaultValue={w.coach} maxLength={120} className={input} />
                    </Field>
                    <Field label="Scheduled for" hint="Date and time as you'll tell them.">
                      <input name="scheduled_for" defaultValue={w.scheduled_for} maxLength={60} placeholder="4 Nov, 3:30 pm" className={input} />
                    </Field>
                    <Field label="Action items">
                      <input name="action_items" defaultValue={w.action_items} maxLength={2000} className={input} />
                    </Field>
                    <div className="sm:col-span-2">
                      <button className={btn.quiet}>Save</button>
                    </div>
                  </ActionForm>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <Panel title="Request a session">
              <ActionForm action="wellness.request" reset className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Who would help most?">
                  <select name="service" className={input}>
                    <option value="life_coaching">Life coach: goals, stress, balance</option>
                    <option value="counselling">Counsellor: a licensed professional</option>
                  </select>
                </Field>
                <Field label="How">
                  <select name="mode" className={input}>
                    {Object.entries(MODE).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Preferred date">
                  <input type="date" name="preferred_on" required min={todayIST()} className={input} />
                </Field>
                <Field label="Best time" hint="Around your shift.">
                  <input name="slot" maxLength={60} placeholder="After 6 pm" className={input} />
                </Field>
                <Field label="Anything we should know first?" className="sm:col-span-2" hint="Optional. Only the wellness desk reads this.">
                  <textarea name="note" rows={3} maxLength={2000} className={area} />
                </Field>
                <div className="sm:col-span-2">
                  <button className={btn.primary}>Request session</button>
                </div>
              </ActionForm>
            </Panel>

            <div className="space-y-5">
              <Panel title="Check in">
                <ActionForm action="wellness.checkin" reset className="space-y-3 p-5">
                  <fieldset>
                    <legend className="mb-2 text-[13.5px] text-ink">How are you feeling today?</legend>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className="cursor-pointer">
                          <input type="radio" name="mood" value={n} required className="peer sr-only" />
                          <span className="flex h-14 flex-col items-center justify-center gap-1 rounded-lg border border-line text-[12px] text-stone-600 transition-colors peer-checked:border-ember peer-checked:bg-ember-tint/50 peer-checked:font-semibold peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ember">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: MOOD_TINT[n] }} aria-hidden />
                            {MOODS[n]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <input name="note" maxLength={2000} placeholder="A word on why (optional)" aria-label="Note" className={input} />
                  <button className={btn.quiet}>Save check-in</button>
                </ActionForm>
                {checkins.length > 0 && (
                  <div className="border-t border-line px-5 py-3">
                    <p className="mb-2 text-[12px] font-medium text-stone-500">Your last {checkins.length} check-ins, newest first</p>
                    <div className="flex flex-wrap gap-1.5">
                      {checkins.map((c) => (
                        <span
                          key={c.id}
                          title={`${day(c.created_on)}: ${MOODS[c.mood ?? 0]}${c.note ? ` — ${c.note}` : ""}`}
                          className="h-5 w-5 rounded"
                          style={{ background: MOOD_TINT[c.mood ?? 3] }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Panel>

              <section className="rounded-xl border border-bad/25 bg-bad-tint/50 px-5 py-4">
                <h2 className="font-sans text-[14.5px] font-semibold tracking-normal text-ink">Need someone right now?</h2>
                <ul className="mt-2 space-y-1.5 text-[13.5px] text-stone-700">
                  <li>
                    <a href="tel:14416" className="font-semibold text-bad underline-offset-2 hover:underline">
                      Tele-MANAS 14416
                    </a>{" "}
                    — free mental-health support, 24×7, in many Indian languages
                  </li>
                  <li>
                    <a href="tel:112" className="font-semibold text-bad underline-offset-2 hover:underline">
                      112
                    </a>{" "}
                    — emergency, if you or someone near you is in danger
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <Panel title="My sessions">
            {sessions.length === 0 ? (
              <Empty title="No sessions yet">When you request one, it shows here with your coach and date once it&rsquo;s scheduled.</Empty>
            ) : (
              <div className="scroll-thin overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr>
                      <th className={th}>Session ID</th>
                      <th className={th}>Coach</th>
                      <th className={th}>Type</th>
                      <th className={th}>Date</th>
                      <th className={th}>Status</th>
                      <th className={th}>Survey</th>
                      <th className={th}>Action items</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {sessions.map((w) => (
                      <tr key={w.id}>
                        <td className={`${td} tabular font-medium`}>{sid(w.id)}</td>
                        <td className={td}>{w.coach || <span className="text-stone-500">To be assigned</span>}</td>
                        <td className={td}>
                          {SERVICE[w.service]}
                          <span className="block text-[12px] text-stone-500">{MODE[w.mode]}</span>
                        </td>
                        <td className={`${td} tabular`}>{w.scheduled_for || `Prefers ${day(w.preferred_on)}`}</td>
                        <td className={td}>
                          <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium capitalize ${STATUS[w.status]}`}>{w.status}</span>
                          {(w.status === "requested" || w.status === "scheduled") && (
                            <ActionForm action="wellness.cancel" confirm="Cancel this session request?" className="mt-1">
                              <input type="hidden" name="id" value={w.id} />
                              <button className="text-[12px] text-stone-500 hover:text-bad">Cancel</button>
                            </ActionForm>
                          )}
                        </td>
                        <td className={td}>
                          {w.status !== "completed" ? (
                            <span className="text-stone-400">—</span>
                          ) : w.survey ? (
                            <span className="tabular">{w.survey}/5</span>
                          ) : (
                            <ActionForm action="wellness.survey" className="flex gap-1">
                              <input type="hidden" name="id" value={w.id} />
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} name="survey" value={n} className="h-7 w-7 rounded-md border border-line text-[12px] hover:border-ember hover:text-ember" aria-label={`Rate ${n} of 5`}>
                                  {n}
                                </button>
                              ))}
                            </ActionForm>
                          )}
                        </td>
                        <td className={`${td} max-w-[16rem] text-[13px] text-stone-700`}>{w.action_items || <span className="text-stone-400">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
