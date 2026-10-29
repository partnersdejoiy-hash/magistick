import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Stamp";
import { Empty, Panel, StatusChip, TypeTag, btn, day, td, th } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { DEPT_BY_ID, LEVEL_BY_ID } from "@/lib/rbac";
import { avg, canSeeMeeting, code, loadScope, meetingRows, statusOf, todayIST } from "@/lib/uplift";

export const metadata = { title: "Employee" };

export default async function Person({ params }: { params: { id: string } }) {
  const s = (await loadScope())!;
  const p = s.byId.get(params.id);
  if (!p) notFound();
  const self = p.id === s.me.id;
  const inLine = self || s.teamIds.has(p.id);
  const today = todayIST();

  const meetings = (await meetingRows(`p.user_id = $1 OR m.coach_id = $1`, [p.id])).filter((r) =>
    inLine ? true : canSeeMeeting(s, r.coach_id, [r.user_id]) && (r.coach_id === s.me.id || r.user_id === s.me.id),
  );
  const asCoachee = meetings.filter((r) => r.user_id === p.id);
  const assessments = inLine
    ? ((await sql()`SELECT id, scores, ack_at::text AS ack_at, to_char(created_at, 'YYYY-MM-DD') AS created_on
                    FROM up_assessments WHERE user_id = ${p.id} ORDER BY created_at DESC`) as {
        id: number;
        scores: Record<string, { rating: number }>;
        ack_at: string | null;
        created_on: string;
      }[])
    : [];
  const [vol] = (await sql()`SELECT coalesce(sum(hours), 0)::float AS h, count(*)::int AS n FROM up_volunteer
                               WHERE user_id = ${p.id} AND extract(year FROM on_date) = ${Number(today.slice(0, 4))}`) as { h: number; n: number }[];
  const [ooo] = (await sql()`SELECT to_char(from_date, 'YYYY-MM-DD') AS f, to_char(to_date, 'YYYY-MM-DD') AS t, note FROM up_ooo
                               WHERE user_id = ${p.id} AND to_date >= ${today}`) as { f: string; t: string; note: string }[];
  const manager = p.manager_id ? s.byId.get(p.manager_id) : undefined;
  const acked = asCoachee.filter((r) => r.ack_at).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={p.name} dept={p.department} size={64} id={p.id} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[28px] font-semibold leading-tight text-ink">{p.name}</h1>
          <p className="mt-0.5 text-[13.5px] text-stone-600">
            {[p.title, LEVEL_BY_ID[p.level].label, DEPT_BY_ID[p.department].label].filter(Boolean).join(" · ")}
            {manager && <> · reports to {manager.name}</>}
          </p>
          {ooo && (
            <p className="mt-1.5 inline-flex rounded-md bg-gold-tint px-2 py-0.5 text-[12.5px] font-medium text-gold-ink">
              Out of office {day(ooo.f)} – {day(ooo.t)}
              {ooo.note && ` · ${ooo.note}`}
            </p>
          )}
        </div>
        {!self && s.teamIds.has(p.id) && (
          <Link href={`/uplift/new?with=${p.id}`} className={btn.primary}>
            Log a meeting
          </Link>
        )}
      </div>

      <dl className="tabular grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-[13px] sm:grid-cols-4">
        {[
          ["Coaching logs", asCoachee.length],
          ["Acknowledged", acked],
          ["Assessments", inLine ? assessments.length : "—"],
          [`Volunteer hours, ${today.slice(0, 4)}`, vol.h % 1 ? vol.h.toFixed(1) : vol.h],
        ].map(([k, v]) => (
          <div key={String(k)} className="bg-panel px-4 py-3">
            <dt className="text-stone-600">{k}</dt>
            <dd className="mt-0.5 text-[18px] font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Coaching history">
        {meetings.length === 0 ? (
          <Empty title="No coaching logs yet">{inLine ? null : "You only see logs you were part of, since they aren't in your line."}</Empty>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Coaching ID</th>
                  <th className={th}>Date</th>
                  <th className={th}>Type</th>
                  <th className={th}>With</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {meetings.map((r) => {
                  const other = r.user_id === p.id ? r.coach_id : r.user_id;
                  return (
                    <tr key={`${r.id}-${r.user_id}`} className="hover:bg-ground/60">
                      <td className={`${td} tabular font-medium`}>
                        <Link href={`/uplift/m/${r.id}`} className="hover:text-ember">
                          {code(r.id)}
                        </Link>
                        <span className="block max-w-[16rem] truncate text-[12px] font-normal text-stone-500">{r.title}</span>
                      </td>
                      <td className={`${td} tabular`}>{day(r.held_on)}</td>
                      <td className={td}>
                        <TypeTag type={r.type} />
                      </td>
                      <td className={`${td} text-[13px]`}>
                        {r.user_id === p.id ? "Coached by " : "Coached "}
                        {s.byId.get(other)?.name ?? "former employee"}
                      </td>
                      <td className={td}>
                        <StatusChip status={statusOf(r, today)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {inLine && (
        <Panel title="Competency assessments">
          {assessments.length === 0 ? (
            <Empty title="None yet" />
          ) : (
            <ul className="divide-y divide-line">
              {assessments.map((a) => (
                <li key={a.id}>
                  <Link href={`/uplift/assessments/${a.id}`} className="flex items-center justify-between px-5 py-3 text-[13.5px] hover:bg-ground/60">
                    <span className="tabular">{day(a.created_on)}</span>
                    <span className="tabular font-medium">{avg(a.scores).toFixed(1)} / 5</span>
                    <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${a.ack_at ? "bg-ok-tint text-ok" : "bg-warn-tint text-warn"}`}>
                      {a.ack_at ? "Acknowledged" : "For acknowledgement"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
