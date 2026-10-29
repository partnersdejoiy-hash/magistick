import Link from "next/link";
import { Chev, Empty, Panel, PageHead, PersonCell, btn, day, td, th } from "@/components/uplift/ui";
import { addDays, isDate, loadScope, meetingRows, mondayOf, todayIST, TYPE_BY_ID } from "@/lib/uplift";

export const metadata = { title: "Summary" };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function Summary({ searchParams }: { searchParams: { w?: string; view?: string } }) {
  const s = (await loadScope())!;
  const today = todayIST();
  const week = mondayOf(isDate(searchParams.w) ? searchParams.w : today);
  const end = addDays(week, 6);
  const whole = searchParams.view === "all";
  const people = whole ? s.team : s.directs;
  const ids = people.map((p) => p.id);
  const rows = ids.length ? await meetingRows(`p.user_id = ANY($1) AND m.held_on BETWEEN $2 AND $3`, [ids, week, end]) : [];
  const counted = rows.filter((r) => TYPE_BY_ID[r.type]?.counts);

  const lines = people
    .map((p) => {
      const mine = counted.filter((r) => r.user_id === p.id);
      return {
        p,
        mine,
        acked: mine.filter((r) => r.ack_at).length,
        days: DAYS.map((_, i) => mine.filter((r) => r.held_on === addDays(week, i))),
      };
    })
    .sort((a, b) => Number(a.acked > 0) - Number(b.acked > 0) || a.p.name.localeCompare(b.p.name));
  const compliant = lines.filter((l) => l.acked > 0).length;
  const pct = people.length ? Math.round((compliant / people.length) * 100) : null;
  const link = (w: string, v = searchParams.view) => `/uplift/summary?w=${w}${v ? `&view=${v}` : ""}`;

  return (
    <div>
      <PageHead title="Summary">
        A team member counts as coached for the week once a regular, delegated or PIP coaching log with them is acknowledged. Mentoring and power-ups
        are welcome extras and don&rsquo;t count.
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
        {week !== mondayOf(today) && (
          <Link href={link(mondayOf(today))} className={btn.small}>
            This week
          </Link>
        )}
        <div className="ml-auto flex rounded-lg border border-line bg-ground p-0.5 text-[13px]">
          {[
            { v: "", label: "Direct reports" },
            { v: "all", label: "Whole team" },
          ].map((o) => (
            <Link
              key={o.v}
              href={link(week, o.v)}
              aria-current={(searchParams.view ?? "") === o.v ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 ${(searchParams.view ?? "") === o.v ? "bg-panel font-semibold shadow-card" : "text-stone-600"}`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>

      <Panel
        title={whole ? "Whole team" : "Direct reports"}
        aside={
          pct !== null && (
            <p className="tabular text-[13.5px] text-stone-700">
              Compliance <span className="font-semibold text-ink">{compliant}/{people.length}</span>
              <span className={`ml-2 rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${pct >= 90 ? "bg-ok-tint text-ok" : pct >= 60 ? "bg-warn-tint text-warn" : "bg-bad-tint text-bad"}`}>
                {pct}%
              </span>
            </p>
          )
        }
      >
        {people.length === 0 ? (
          <Empty title={whole ? "No one reports into your line yet" : "No direct reports"}>
            When people are set to report to you in magistick&rsquo;s directory, they show up here.
          </Empty>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Name</th>
                  <th className={th}>
                    <span className="flex gap-[9px]">
                      {DAYS.map((d) => (
                        <span key={d} className="w-6 text-center">
                          {d.slice(0, 2)}
                        </span>
                      ))}
                    </span>
                  </th>
                  <th className={th}>Meeting logs</th>
                  <th className={th}>Compliance</th>
                  <th className={th}>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lines.map(({ p, mine, acked, days }) => (
                  <tr key={p.id}>
                    <td className={td}>
                      <PersonCell p={p} href={`/uplift/people/${p.id}`} />
                    </td>
                    <td className={td}>
                      <span className="flex gap-[9px]" aria-label={`${mine.length} coaching logs this week`}>
                        {days.map((d, i) => {
                          const ack = d.some((r) => r.ack_at);
                          return (
                            <span
                              key={i}
                              title={d.length ? `${d.length} log${d.length > 1 ? "s" : ""}${ack ? ", acknowledged" : ""}` : undefined}
                              className={`h-6 w-6 rounded-md ${ack ? "bg-ok" : d.length ? "bg-warn/60" : addDays(week, i) > today ? "border border-dashed border-line" : "bg-parchment"}`}
                            />
                          );
                        })}
                      </span>
                    </td>
                    <td className={`${td} tabular`}>
                      {mine.length} <span className="text-stone-500">· {acked} acknowledged</span>
                    </td>
                    <td className={td}>
                      {acked > 0 ? (
                        <span className="rounded-md bg-ok-tint px-2 py-0.5 text-[12px] font-medium text-ok">Coached</span>
                      ) : (
                        <span className="rounded-md bg-parchment px-2 py-0.5 text-[12px] font-medium text-stone-700">Not yet</span>
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      {acked === 0 && (
                        <Link href={`/uplift/new?with=${p.id}`} className={btn.small}>
                          Log a 1:1
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <p className="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-stone-600">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-ok" /> Acknowledged</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-warn/60" /> Logged, waiting</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-parchment" /> No coaching</span>
      </p>
    </div>
  );
}
