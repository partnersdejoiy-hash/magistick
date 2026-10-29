import ActionForm from "@/components/uplift/ActionForm";
import { Empty, Field, Panel, PageHead, PersonCell, PersonSelect, btn, day, input } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { loadScope, todayIST } from "@/lib/uplift";

export const metadata = { title: "Away & delegations" };

type Del = { id: number; from_id: string; to_id: string; starts: string; ends: string };

const CHANGELOG = [
  {
    v: "1.0",
    on: "2026-10-30",
    items: [
      "Meetings with acknowledgement, templates and alerts",
      "Agenda builder and weekly compliance summary",
      "Wellness sessions, check-ins and the wellness desk",
      "Volunteer log, interim deactivation and competency assessments",
      "Out of office and team delegation",
    ],
  },
];

export default async function Me() {
  const s = (await loadScope())!;
  const today = todayIST();
  const [ooo] = (await sql()`SELECT to_char(from_date, 'YYYY-MM-DD') AS f, to_char(to_date, 'YYYY-MM-DD') AS t, note FROM up_ooo
                              WHERE user_id = ${s.me.id} AND to_date >= ${today}`) as { f: string; t: string; note: string }[];
  const dels = (await sql()`SELECT id, from_id, to_id, to_char(starts, 'YYYY-MM-DD') AS starts, to_char(ends, 'YYYY-MM-DD') AS ends
                              FROM up_delegations WHERE (from_id = ${s.me.id} OR to_id = ${s.me.id}) AND ends >= ${today}
                             ORDER BY starts`) as Del[];
  const others = s.people.filter((p) => p.id !== s.me.id);
  const given = dels.filter((d) => d.from_id === s.me.id);
  const got = dels.filter((d) => d.to_id === s.me.id);

  return (
    <div className="space-y-5">
      <PageHead title="Away & delegations">
        Going on leave? Mark yourself away and hand your team to someone, so their coaching doesn&rsquo;t stop while you&rsquo;re gone.
      </PageHead>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Out of office">
          {ooo ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-[14px] text-ink">
                Away <span className="tabular font-semibold">{day(ooo.f)} – {day(ooo.t)}</span>
                {ooo.note && <span className="block text-[13px] text-stone-600">{ooo.note}</span>}
              </p>
              <ActionForm action="ooo.clear">
                <button className={btn.quiet}>I&rsquo;m back</button>
              </ActionForm>
            </div>
          ) : (
            <ActionForm action="ooo.set" className="grid gap-3.5 p-5 sm:grid-cols-2">
              <Field label="First day away">
                <input type="date" name="from_date" required min={today} className={input} />
              </Field>
              <Field label="Last day away">
                <input type="date" name="to_date" required min={today} className={input} />
              </Field>
              <Field label="Note" className="sm:col-span-2" hint="Shown on your Uplift profile.">
                <input name="note" maxLength={300} placeholder="On leave, back Monday" className={input} />
              </Field>
              {s.directs.length > 0 && (
                <Field label="Who covers your team?" className="sm:col-span-2" hint="They can log delegated coaching for your team while you're away.">
                  <PersonSelect name="delegate_id" people={others} placeholder="No one" required={false} />
                </Field>
              )}
              <div className="sm:col-span-2">
                <button className={btn.primary}>Mark me away</button>
              </div>
            </ActionForm>
          )}
        </Panel>

        <Panel title="Delegations">
          {given.length + got.length === 0 ? (
            <Empty title="No delegations">Hand your team to someone for a few days, or see whose team you&rsquo;re covering.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {[...got, ...given].map((d) => {
                const mineToGive = d.from_id === s.me.id;
                return (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="space-y-1">
                      <p className="text-[12px] font-medium text-stone-500">{mineToGive ? "Covering your team" : "You cover their team"}</p>
                      <PersonCell p={s.byId.get(mineToGive ? d.to_id : d.from_id)} sub={`${day(d.starts)} – ${day(d.ends)}`} />
                    </div>
                    {mineToGive && (
                      <ActionForm action="delegation.delete" confirm="End this delegation now?">
                        <input type="hidden" name="id" value={d.id} />
                        <button className={btn.danger}>End</button>
                      </ActionForm>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {s.directs.length > 0 && (
            <ActionForm action="delegation.add" reset className="grid gap-3 border-t border-line p-5 sm:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
              <Field label="Hand my team to">
                <PersonSelect name="to_id" people={others} />
              </Field>
              <Field label="From">
                <input type="date" name="starts" required defaultValue={today} className={input} />
              </Field>
              <Field label="Until">
                <input type="date" name="ends" required min={today} className={input} />
              </Field>
              <div className="sm:col-span-3">
                <button className={btn.quiet}>Add delegation</button>
              </div>
            </ActionForm>
          )}
        </Panel>
      </div>

      <Panel title="What's new in Uplift">
        <ul className="divide-y divide-line">
          {CHANGELOG.map((c) => (
            <li key={c.v} className="grid gap-2 px-5 py-4 sm:grid-cols-[140px_minmax(0,1fr)]">
              <p className="tabular text-[13px] text-stone-600">
                <span className="font-semibold text-ink">{c.v}</span> · {day(c.on)}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-[13.5px] text-stone-700 marker:text-stone-400">
                {c.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
