import Link from "next/link";
import { Empty, Field, Panel, PageHead, PersonCell, Tabs, btn, day, input, td, th } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { rankOf } from "@/lib/rbac";
import { avg, loadScope } from "@/lib/uplift";

export const metadata = { title: "Competency assessment" };

type A = { id: number; user_id: string; created_by: string; scores: Record<string, { rating: number }>; ack_at: string | null; created_on: string };

export default async function Assessments({ searchParams }: { searchParams: { view?: string; from?: string; to?: string; q?: string } }) {
  const s = (await loadScope())!;
  const lead = rankOf(s.me.level) >= rankOf("ops_manager");
  const view = searchParams.view === "team" ? "team" : "mine";
  const all = (await sql()`
    SELECT id, user_id, created_by, scores, ack_at::text AS ack_at, to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS created_on
      FROM up_assessments ORDER BY created_at DESC LIMIT 500`) as A[];
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const rows = all
    .filter((a) => (view === "mine" ? a.user_id === s.me.id : a.created_by === s.me.id || s.teamIds.has(a.user_id)))
    .filter((a) => (!searchParams.from || a.created_on >= searchParams.from) && (!searchParams.to || a.created_on <= searchParams.to))
    .filter((a) => !q || (s.byId.get(a.user_id)?.name ?? "").toLowerCase().includes(q) || (s.byId.get(a.user_id)?.email ?? "").toLowerCase().includes(q));

  return (
    <div>
      <PageHead
        title="Competency assessment"
        actions={
          <>
            <a href="/api/uplift?export=assessments" className={btn.quiet}>
              Download CSV
            </a>
            {lead && (
              <Link href="/uplift/assessments/new" className={btn.primary}>
                Create assessment
              </Link>
            )}
          </>
        }
      >
        A considered look at six competencies, done by operations managers and up. The person sees every rating and note, and acknowledges it.
      </PageHead>

      <Tabs
        active={view}
        items={[
          { id: "mine", label: "My assessments", href: "/uplift/assessments", count: all.filter((a) => a.user_id === s.me.id && !a.ack_at).length },
          { id: "team", label: "My team's assessments", href: "/uplift/assessments?view=team" },
        ]}
      />

      <form action="/uplift/assessments" className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,1fr))_auto]">
        <input type="hidden" name="view" value={view} />
        <Field label="Employee">
          <input name="q" defaultValue={searchParams.q} placeholder="Name or email" className={input} />
        </Field>
        <Field label="From">
          <input type="date" name="from" defaultValue={searchParams.from} className={input} />
        </Field>
        <Field label="To">
          <input type="date" name="to" defaultValue={searchParams.to} className={input} />
        </Field>
        <div className="flex items-end">
          <button className={btn.quiet}>Apply</button>
        </div>
      </form>

      <Panel className="mt-4">
        {rows.length === 0 ? (
          <Empty title={view === "mine" ? "No assessments about you yet" : "No team assessments yet"}>
            {view === "team" && lead ? "Create one for someone in your line; it takes about ten minutes to do well." : null}
          </Empty>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Employee</th>
                  <th className={th}>Position</th>
                  <th className={th}>Created on</th>
                  <th className={th}>Created by</th>
                  <th className={th}>Average</th>
                  <th className={th}>Status</th>
                  <th className={th}>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => {
                  const p = s.byId.get(a.user_id);
                  return (
                    <tr key={a.id}>
                      <td className={td}>
                        <PersonCell p={p} sub={p?.email} />
                      </td>
                      <td className={`${td} text-[13px]`}>{p?.title || "—"}</td>
                      <td className={`${td} tabular`}>{day(a.created_on)}</td>
                      <td className={`${td} text-[13px]`}>{s.byId.get(a.created_by)?.name ?? "—"}</td>
                      <td className={`${td} tabular font-medium`}>{avg(a.scores).toFixed(1)} / 5</td>
                      <td className={td}>
                        <span className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${a.ack_at ? "bg-ok-tint text-ok" : "bg-warn-tint text-warn"}`}>
                          {a.ack_at ? "Acknowledged" : "For acknowledgement"}
                        </span>
                      </td>
                      <td className={`${td} text-right`}>
                        <Link href={`/uplift/assessments/${a.id}`} className={btn.small}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
