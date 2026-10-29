import Link from "next/link";
import { Empty, Panel, PageHead, PersonCell, input, btn } from "@/components/uplift/ui";
import { DEPT_BY_ID } from "@/lib/rbac";
import { loadScope } from "@/lib/uplift";

export const metadata = { title: "Search an employee" };

export default async function People({ searchParams }: { searchParams: { q?: string } }) {
  const s = (await loadScope())!;
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const pool = [s.byId.get(s.me.id)!, ...s.team].filter(Boolean);
  const hits = q ? pool.filter((p) => [p.name, p.email, p.title].some((f) => f.toLowerCase().includes(q))).slice(0, 50) : s.directs;

  return (
    <div>
      <PageHead title="Search an employee">Open anyone in your line to see their coaching history, assessments and time given back.</PageHead>
      <form action="/uplift/people" className="mb-4 flex max-w-lg gap-2">
        <input name="q" defaultValue={searchParams.q} placeholder="Name, email or title" aria-label="Search" className={input} autoFocus />
        <button className={btn.quiet}>Search</button>
      </form>
      <Panel title={q ? `${hits.length} ${hits.length === 1 ? "person" : "people"}` : "Your direct reports"}>
        {hits.length === 0 ? (
          <Empty title={q ? "No one in your line matches" : "No direct reports"}>
            {q ? "Uplift only searches you and the people who report into you." : null}
          </Empty>
        ) : (
          <ul className="divide-y divide-line">
            {hits.map((p) => (
              <li key={p.id}>
                <Link href={`/uplift/people/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ground/60">
                  <PersonCell p={p} />
                  <span className="hidden text-[12.5px] text-stone-500 sm:block">{DEPT_BY_ID[p.department].label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
