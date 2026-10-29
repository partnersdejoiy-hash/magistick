import Link from "next/link";
import { Empty, Field, Panel, PageHead, PersonCell, StatusChip, Tabs, TypeTag, btn, day, input, td, th } from "@/components/uplift/ui";
import { addDays, code, loadScope, meetingRows, statusOf, todayIST, STATUS_LABEL, type Status } from "@/lib/uplift";

export const metadata = { title: "Meetings" };

const TABS = [
  { id: "team", label: "My team" },
  { id: "managers", label: "My managers" },
  { id: "one", label: "1:1 meetings" },
  { id: "powerup", label: "Power-ups" },
  { id: "mentor", label: "Mentoring" },
  { id: "pip", label: "PIP" },
  { id: "alerts", label: "Alerts" },
] as const;

type SP = { tab?: string; status?: string; from?: string; to?: string; q?: string };

export default async function Meetings({ searchParams }: { searchParams: SP }) {
  const s = (await loadScope())!;
  const today = todayIST();
  const ids = [s.me.id, ...Array.from(s.teamIds)];
  const rows = await meetingRows(`m.coach_id = ANY($1) OR p.user_id = ANY($1)`, [ids]);
  const withStatus = rows.map((r) => ({ ...r, status: statusOf(r, today) }));

  const late = (r: (typeof withStatus)[number]) => r.status === "for_ack" && r.held_on <= addDays(today, -2) && r.coach_id !== r.user_id;
  const byTab: Record<string, (r: (typeof withStatus)[number]) => boolean> = {
    team: (r) => r.coach_id === s.me.id || s.teamIds.has(r.user_id),
    managers: (r) => r.user_id === s.me.id,
    one: (r) => r.format === "one" && (r.coach_id === s.me.id || r.user_id === s.me.id),
    powerup: (r) => r.type === "powerup",
    mentor: (r) => r.type === "mentor",
    pip: (r) => r.type === "pip",
    alerts: (r) => late(r) && (r.coach_id === s.me.id || r.user_id === s.me.id || s.teamIds.has(r.coach_id)),
  };
  const tab = TABS.some((t) => t.id === searchParams.tab) ? searchParams.tab! : "team";
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const status = searchParams.status as Status | undefined;
  const list = withStatus.filter(
    (r) =>
      byTab[tab](r) &&
      (!status || r.status === status) &&
      (!searchParams.from || r.held_on >= searchParams.from) &&
      (!searchParams.to || r.held_on <= searchParams.to) &&
      (!q ||
        r.title.toLowerCase().includes(q) ||
        code(r.id).toLowerCase().includes(q) ||
        (s.byId.get(r.user_id)?.name ?? "").toLowerCase().includes(q) ||
        (s.byId.get(r.coach_id)?.name ?? "").toLowerCase().includes(q)),
  );
  const myAcks = withStatus.filter((r) => r.user_id === s.me.id && r.status === "for_ack").length;
  const alerts = withStatus.filter(byTab.alerts).length;
  const href = (t: string) => `/uplift?tab=${t}`;

  return (
    <div>
      <PageHead
        title="Meetings"
        actions={
          <Link href="/uplift/new" className={btn.primary}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Log a meeting
          </Link>
        }
      >
        Every 1:1, team huddle, power-up and PIP conversation, with what was agreed. Team members acknowledge each log, so both sides keep the same record.
      </PageHead>

      <Tabs
        active={tab}
        items={TABS.map((t) => ({ ...t, href: href(t.id), count: t.id === "managers" ? myAcks : t.id === "alerts" ? alerts : undefined }))}
      />

      <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_repeat(2,minmax(0,0.9fr))_auto]" action="/uplift">
        <input type="hidden" name="tab" value={tab} />
        <Field label="Search meetings">
          <input name="q" defaultValue={searchParams.q} placeholder="Title, UP-ID or name" className={input} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={status ?? ""} className={input}>
            <option value="">All</option>
            {(Object.keys(STATUS_LABEL) as Status[]).map((k) => (
              <option key={k} value={k}>
                {STATUS_LABEL[k]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input type="date" name="from" defaultValue={searchParams.from} className={input} />
        </Field>
        <Field label="To">
          <input type="date" name="to" defaultValue={searchParams.to} className={input} />
        </Field>
        <div className="flex items-end gap-2">
          <button className={btn.quiet}>Apply</button>
          {(q || status || searchParams.from || searchParams.to) && (
            <Link href={href(tab)} className="h-9 px-1 text-[13px] leading-9 text-stone-600 hover:text-ember">
              Clear
            </Link>
          )}
        </div>
      </form>

      <Panel className="mt-4">
        {list.length === 0 ? (
          tab === "alerts" ? (
            <Empty title="No alerts">Logs that stay unacknowledged for more than two days show up here.</Empty>
          ) : rows.length === 0 ? (
            <Empty title="No meetings logged yet">
              Log your first 1:1 after your next conversation. It takes a minute, and your team member gets it to acknowledge.
              <div className="mt-4">
                <Link href="/uplift/new" className={btn.primary}>
                  Log a meeting
                </Link>
              </div>
            </Empty>
          ) : (
            <Empty title="Nothing matches">Try another view, or clear the filters.</Empty>
          )
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr>
                  <th className={th}>Coaching ID</th>
                  <th className={th}>Date</th>
                  <th className={th}>Type</th>
                  <th className={th}>Coach</th>
                  <th className={th}>Team member</th>
                  <th className={th}>Status</th>
                  <th className={th}>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((r) => (
                  <tr key={`${r.id}-${r.user_id}`} className="hover:bg-ground/60">
                    <td className={`${td} tabular whitespace-nowrap font-medium`}>
                      <Link href={`/uplift/m/${r.id}`} className="hover:text-ember">
                        {code(r.id)}
                      </Link>
                      <span className="block max-w-[16rem] truncate text-[12px] font-normal text-stone-500">{r.title}</span>
                    </td>
                    <td className={`${td} tabular whitespace-nowrap`}>{day(r.held_on)}</td>
                    <td className={td}>
                      <TypeTag type={r.type} />
                    </td>
                    <td className={td}>
                      <PersonCell p={s.byId.get(r.coach_id)} href={`/uplift/people/${r.coach_id}`} />
                    </td>
                    <td className={td}>
                      <PersonCell p={s.byId.get(r.user_id)} href={`/uplift/people/${r.user_id}`} />
                    </td>
                    <td className={td}>
                      <StatusChip status={r.status} />
                    </td>
                    <td className={`${td} text-right`}>
                      <Link href={`/uplift/m/${r.id}`} className={btn.small}>
                        {r.user_id === s.me.id && r.status === "for_ack" ? "Acknowledge" : "Open"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
