import Link from "next/link";
import ActionForm from "@/components/uplift/ActionForm";
import { Chev, Empty, Panel, PageHead, PersonCell, StatusChip, btn, day, input } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { addDays, code, isDate, loadScope, meetingRows, mondayOf, statusOf, todayIST } from "@/lib/uplift";

export const metadata = { title: "Agenda builder" };

type Item = { id: number; report_id: string; topic: string; done: boolean };

export default async function Agenda({ searchParams }: { searchParams: { w?: string } }) {
  const s = (await loadScope())!;
  const today = todayIST();
  const week = mondayOf(isDate(searchParams.w) ? searchParams.w : today);
  const end = addDays(week, 6);
  const items = (await sql()`SELECT id, report_id, topic, done FROM up_agenda WHERE owner_id = ${s.me.id} AND week = ${week} ORDER BY id`) as Item[];
  const ids = s.directs.map((p) => p.id);
  const meetings = ids.length ? await meetingRows(`m.coach_id = $1 AND p.user_id = ANY($2) AND m.held_on BETWEEN $3 AND $4`, [s.me.id, ids, week, end]) : [];
  const people = [...s.directs].sort((a, b) => a.name.localeCompare(b.name));
  const ready = people.filter((p) => items.some((i) => i.report_id === p.id)).length;
  const link = (w: string) => `/uplift/agenda?w=${w}`;

  return (
    <div>
      <PageHead title="Agenda builder">
        Jot topics for each direct report as they come up during the week. When it&rsquo;s time for the 1:1, open topics carry straight into the meeting log.
      </PageHead>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-line bg-panel">
          <Link href={link(addDays(week, -7))} className="flex px-2.5 py-2 text-stone-600 hover:text-ember" aria-label="Previous week">
            <Chev dir="left" />
          </Link>
          <span className="tabular border-x border-line px-3 py-2 text-[13.5px] font-medium">
            {day(week)} – {day(end)}
          </span>
          <Link href={link(addDays(week, 7))} className="flex px-2.5 py-2 text-stone-600 hover:text-ember" aria-label="Next week">
            <Chev dir="right" />
          </Link>
        </div>
        {people.length > 0 && (
          <p className="tabular text-[13px] text-stone-600">
            {ready} of {people.length} have an agenda this week
          </p>
        )}
      </div>

      <Panel>
        {people.length === 0 ? (
          <Empty title="No direct reports">Agendas are built for the people who report to you.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {people.map((p) => {
              const mine = items.filter((i) => i.report_id === p.id);
              const open = mine.filter((i) => !i.done).map((i) => i.topic);
              const met = meetings.filter((m) => m.user_id === p.id);
              return (
                <li key={p.id} className="grid gap-4 px-5 py-4 md:grid-cols-[220px_minmax(0,1fr)_auto]">
                  <div className="space-y-2">
                    <PersonCell p={p} href={`/uplift/people/${p.id}`} />
                    {met.map((m) => (
                      <Link key={m.id} href={`/uplift/m/${m.id}`} className="flex flex-wrap items-center gap-2 text-[12.5px] text-stone-600 hover:text-ember">
                        <span className="tabular">{code(m.id)}</span>
                        <StatusChip status={statusOf(m, today)} />
                      </Link>
                    ))}
                  </div>
                  <div>
                    {mine.length > 0 && (
                      <ul className="mb-2 space-y-1">
                        {mine.map((i) => (
                          <li key={i.id} className="group flex items-start gap-2">
                            <ActionForm action="agenda.toggle">
                              <input type="hidden" name="id" value={i.id} />
                              <button
                                aria-label={i.done ? `Mark “${i.topic}” as open` : `Mark “${i.topic}” as covered`}
                                aria-pressed={i.done}
                                className={`mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded border ${i.done ? "border-ok bg-ok text-white" : "border-stone-300 bg-panel hover:border-ember"}`}
                              >
                                {i.done && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                                  </svg>
                                )}
                              </button>
                            </ActionForm>
                            <span className={`flex-1 text-[13.5px] leading-snug ${i.done ? "text-stone-500 line-through" : "text-ink"}`}>{i.topic}</span>
                            <ActionForm action="agenda.delete">
                              <input type="hidden" name="id" value={i.id} />
                              <button className="text-[12px] text-stone-400 opacity-100 hover:text-bad md:opacity-0 md:focus:opacity-100 md:group-hover:opacity-100">
                                Remove
                              </button>
                            </ActionForm>
                          </li>
                        ))}
                      </ul>
                    )}
                    <ActionForm action="agenda.add" reset className="flex gap-2">
                      <input type="hidden" name="report_id" value={p.id} />
                      <input type="hidden" name="week" value={week} />
                      <input name="topic" required maxLength={300} placeholder="Add a topic" aria-label={`Add a topic for ${p.name}`} className={input} />
                      <button className={btn.quiet}>Add</button>
                    </ActionForm>
                  </div>
                  <div className="md:text-right">
                    <Link href={`/uplift/new?with=${p.id}&agenda=${encodeURIComponent(open.join("\n"))}`} className={btn.small}>
                      Start the 1:1
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
