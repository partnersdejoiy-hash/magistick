import ActionForm from "@/components/uplift/ActionForm";
import { Empty, Field, Panel, PageHead, PersonCell, Tabs, area, btn, day, input, td, th } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { loadScope, todayIST } from "@/lib/uplift";

export const metadata = { title: "Volunteer" };

type V = {
  id: number;
  user_id: string;
  activity: string;
  on_date: string;
  hours: string;
  schedule: string;
  sponsored: boolean;
  partner: string;
  event: string;
  remarks: string;
};

export default async function Volunteer({ searchParams }: { searchParams: { view?: string } }) {
  const s = (await loadScope())!;
  const team = searchParams.view === "team" && s.team.length > 0;
  const ids = team ? Array.from(s.teamIds) : [s.me.id];
  const rows = (await sql().query(
    `SELECT id, user_id, activity, to_char(on_date, 'YYYY-MM-DD') AS on_date, hours::text AS hours, schedule, sponsored, partner, event, remarks
       FROM up_volunteer WHERE user_id = ANY($1) ORDER BY on_date DESC, id DESC LIMIT 500`,
    [ids],
  )) as V[];
  const year = todayIST().slice(0, 4);
  const hoursThisYear = rows.filter((r) => r.on_date.startsWith(year)).reduce((n, r) => n + Number(r.hours), 0);
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  return (
    <div>
      <PageHead title="Volunteer">
        Time you give back counts. Log drives, school visits and community days here, sponsored by DEJOIY or on your own.
      </PageHead>
      {s.team.length > 0 && (
        <div className="mb-5">
          <Tabs
            active={team ? "team" : "me"}
            items={[
              { id: "me", label: "My activities", href: "/uplift/volunteer" },
              { id: "team", label: "My team", href: "/uplift/volunteer?view=team" },
            ]}
          />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel
          title={team ? "Team activities" : "My activities"}
          aside={<p className="tabular text-[13px] text-stone-600">{fmt(hoursThisYear)} hours in {year}</p>}
        >
          {rows.length === 0 ? (
            <Empty title={team ? "Your team hasn't logged anything yet" : "Nothing logged yet"}>
              {team ? "Activities show up here as people log them." : "Your first activity goes in the form beside this list."}
            </Empty>
          ) : (
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    {team && <th className={th}>Who</th>}
                    <th className={th}>Activity</th>
                    <th className={th}>Date</th>
                    <th className={th}>Hours</th>
                    <th className={th}>Schedule</th>
                    <th className={th}>Sponsored</th>
                    <th className={th}>Partner · event</th>
                    {!team && (
                      <th className={th}>
                        <span className="sr-only">Action</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      {team && (
                        <td className={td}>
                          <PersonCell p={s.byId.get(r.user_id)} />
                        </td>
                      )}
                      <td className={td}>
                        <span className="font-medium">{r.activity}</span>
                        {r.remarks && <span className="block max-w-[18rem] truncate text-[12px] text-stone-500">{r.remarks}</span>}
                      </td>
                      <td className={`${td} tabular whitespace-nowrap`}>{day(r.on_date)}</td>
                      <td className={`${td} tabular`}>{fmt(Number(r.hours))}</td>
                      <td className={td}>{r.schedule || "—"}</td>
                      <td className={td}>{r.sponsored ? "DEJOIY" : "Own time"}</td>
                      <td className={`${td} text-[13px]`}>{[r.partner, r.event].filter(Boolean).join(" · ") || "—"}</td>
                      {!team && (
                        <td className={`${td} text-right`}>
                          <ActionForm action="volunteer.delete" confirm={`Remove “${r.activity}”?`}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className={btn.danger}>Remove</button>
                          </ActionForm>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Log an activity" className="self-start">
          <ActionForm action="volunteer.add" reset className="grid gap-3.5 p-5">
            <Field label="Activity">
              <input name="activity" required maxLength={160} placeholder="Blood donation camp" className={input} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" name="on_date" required max={todayIST()} className={input} />
              </Field>
              <Field label="Hours">
                <input type="number" name="hours" required min="0.5" max="24" step="0.5" className={input} />
              </Field>
            </div>
            <Field label="Schedule">
              <select name="schedule" className={input}>
                <option value="">—</option>
                <option>Before shift</option>
                <option>After shift</option>
                <option>Week off</option>
                <option>During work hours</option>
              </select>
            </Field>
            <Field label="Partnering organisation">
              <input name="partner" maxLength={160} className={input} />
            </Field>
            <Field label="Event name">
              <input name="event" maxLength={160} className={input} />
            </Field>
            <Field label="Remarks">
              <textarea name="remarks" rows={2} maxLength={1000} className={area} />
            </Field>
            <label className="flex items-center gap-2 text-[13.5px]">
              <input type="checkbox" name="sponsored" className="accent-[#C2185B]" />
              Sponsored by DEJOIY
            </label>
            <button className={btn.primary}>Log activity</button>
          </ActionForm>
        </Panel>
      </div>
    </div>
  );
}
