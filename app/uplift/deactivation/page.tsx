import ActionForm from "@/components/uplift/ActionForm";
import { Empty, Field, Panel, PageHead, PersonCell, PersonSelect, Tabs, btn, day, input, td, th } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { DEPT_BY_ID, rankOf } from "@/lib/rbac";
import { DEACT_KINDS, loadScope, todayIST } from "@/lib/uplift";

export const metadata = { title: "Interim deactivation" };

type D = {
  id: number;
  user_id: string;
  raised_by: string;
  kind: string;
  from_date: string;
  shift: string;
  instances: number;
  reason: string;
  status: string;
  decided_by: string | null;
  decision_note: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-warn-tint text-warn" },
  approved: { label: "Deactivated", cls: "bg-bad-tint text-bad" },
  rejected: { label: "Not needed", cls: "bg-parchment text-stone-700" },
  reactivated: { label: "Reactivated", cls: "bg-ok-tint text-ok" },
};

export default async function Deactivation({ searchParams }: { searchParams: { kind?: string; status?: string } }) {
  const s = (await loadScope())!;
  const kind = searchParams.kind === "lwd" ? "lwd" : "ncns";
  const all = (await sql()`
    SELECT id, user_id, raised_by, kind, to_char(from_date, 'YYYY-MM-DD') AS from_date, shift, instances, reason, status, decided_by, decision_note
      FROM up_deactivations WHERE kind = ${kind} ORDER BY (status = 'pending') DESC, from_date DESC LIMIT 500`) as D[];
  const visible = all.filter((d) => s.isHR || d.raised_by === s.me.id || s.teamIds.has(d.user_id));
  const rows = visible.filter((d) => !searchParams.status || d.status === searchParams.status);
  const canRaise = rankOf(s.me.level) >= rankOf("team_leader") && s.team.length > 0;
  const canDecide = s.isHR || rankOf(s.me.level) >= rankOf("ops_manager");

  return (
    <div>
      <PageHead title="Interim deactivation">
        When someone stops turning up without word (NCNS) or is still active after their last working day (LWD+1), their team leader raises a case
        here and an operations manager or HR decides.
      </PageHead>

      <Tabs
        active={kind}
        items={DEACT_KINDS.map((k) => ({
          id: k.id,
          label: k.short,
          href: `/uplift/deactivation?kind=${k.id}`,
          count: all.filter((d) => d.status === "pending" && (s.isHR || s.teamIds.has(d.user_id))).length || undefined,
        }))}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title={DEACT_KINDS.find((k) => k.id === kind)!.label}
          aside={
            <form action="/uplift/deactivation" className="flex items-center gap-2">
              <input type="hidden" name="kind" value={kind} />
              <label className="sr-only" htmlFor="st">Status</label>
              <select id="st" name="status" defaultValue={searchParams.status ?? ""} className="h-8 rounded-md border border-line px-2 text-[12.5px]">
                <option value="">All statuses</option>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <button className={btn.small}>Filter</button>
            </form>
          }
        >
          {rows.length === 0 ? (
            <Empty title="No cases">Nothing to look at here. That&rsquo;s a good sign.</Empty>
          ) : (
            <div className="scroll-thin overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Supervisor</th>
                    <th className={th}>Campaign</th>
                    <th className={th}>{kind === "ncns" ? "NCNS from" : "Last day +1"}</th>
                    <th className={th}>Shift</th>
                    <th className={th}>Instances</th>
                    <th className={th}>Status</th>
                    <th className={th}>Reason · decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((d) => {
                    const p = s.byId.get(d.user_id);
                    const sup = p?.manager_id ? s.byId.get(p.manager_id) : undefined;
                    const mayDecide = canDecide && d.raised_by !== s.me.id && (s.isHR || s.teamIds.has(d.user_id));
                    return (
                      <tr key={d.id} className="align-top">
                        <td className={td}>
                          <PersonCell p={p} sub={p?.email} />
                        </td>
                        <td className={`${td} text-[13px]`}>{sup?.name ?? "—"}</td>
                        <td className={`${td} text-[13px]`}>
                          {p ? DEPT_BY_ID[p.department].label : "—"}
                          {p?.title && <span className="block text-[12px] text-stone-500">{p.title}</span>}
                        </td>
                        <td className={`${td} tabular whitespace-nowrap`}>{day(d.from_date)}</td>
                        <td className={`${td} text-[13px]`}>{d.shift || "—"}</td>
                        <td className={`${td} tabular`}>{d.instances}</td>
                        <td className={td}>
                          <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[12px] font-medium ${STATUS[d.status]?.cls}`}>{STATUS[d.status]?.label}</span>
                        </td>
                        <td className={`${td} min-w-[15rem] text-[13px]`}>
                          <p className="leading-snug text-stone-700">{d.reason}</p>
                          <p className="mt-1 text-[12px] text-stone-500">Raised by {s.byId.get(d.raised_by)?.name ?? "—"}</p>
                          {d.decided_by && (
                            <p className="mt-1 text-[12px] text-stone-600">
                              {s.byId.get(d.decided_by)?.name}: {d.decision_note || STATUS[d.status]?.label}
                            </p>
                          )}
                          {mayDecide && (
                            <ActionForm action="deact.decide" className="mt-2 flex flex-wrap gap-1.5">
                              <input type="hidden" name="id" value={d.id} />
                              <input name="note" placeholder="Note" aria-label="Decision note" maxLength={1000} className="h-7 w-full rounded-md border border-line px-2 text-[12.5px] focus:border-ember focus:outline-none" />
                              {d.status === "pending" && (
                                <>
                                  <button name="status" value="approved" className={btn.small}>
                                    Deactivate
                                  </button>
                                  <button name="status" value="rejected" className={btn.small}>
                                    Not needed
                                  </button>
                                </>
                              )}
                              {d.status === "approved" && (
                                <button name="status" value="reactivated" className={btn.small}>
                                  Reactivate
                                </button>
                              )}
                            </ActionForm>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {canRaise ? (
          <Panel title="Raise a case" className="self-start">
            <ActionForm action="deact.raise" reset className="grid gap-3.5 p-5">
              <input type="hidden" name="kind" value={kind} />
              <Field label="Team member">
                <PersonSelect name="user_id" people={s.team} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={kind === "ncns" ? "First missed day" : "Last working day +1"}>
                  <input type="date" name="from_date" required max={todayIST()} className={input} />
                </Field>
                <Field label={kind === "ncns" ? "Days missed" : "Instances"}>
                  <input type="number" name="instances" min="1" max="30" defaultValue={kind === "ncns" ? 3 : 1} className={input} />
                </Field>
              </div>
              <Field label="Shift">
                <input name="shift" maxLength={40} placeholder="22:00–07:00" className={input} />
              </Field>
              <Field label="Reason" hint="What you tried: calls, messages, emergency contact.">
                <textarea name="reason" required rows={3} maxLength={1000} className="w-full rounded-lg border border-line px-3 py-2 text-[13.5px] focus:border-ember focus:outline-none" />
              </Field>
              <button className={btn.primary}>Raise {DEACT_KINDS.find((k) => k.id === kind)!.short} case</button>
              <p className="text-[12px] leading-snug text-stone-500">This is a record for the decision. It doesn&rsquo;t switch off anyone&rsquo;s magistick login by itself.</p>
            </ActionForm>
          </Panel>
        ) : (
          <p className="self-start rounded-xl border border-dashed border-line px-5 py-4 text-[13px] leading-relaxed text-stone-600">
            Team leaders and above raise cases for people in their team.
          </p>
        )}
      </div>
    </div>
  );
}
