import Link from "next/link";
import ActionForm from "@/components/uplift/ActionForm";
import MeetingFields from "@/components/uplift/MeetingFields";
import { Field, Panel, PageHead, btn, input } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { isType, loadScope, todayIST } from "@/lib/uplift";

export const metadata = { title: "Log a meeting" };

type Tpl = { id: number; name: string; title: string; agenda: string; notes: string };

export default async function NewMeeting({ searchParams }: { searchParams: { t?: string; with?: string; agenda?: string; type?: string } }) {
  const s = (await loadScope())!;
  const templates = (await sql()`SELECT id, name, title, agenda, notes FROM up_templates WHERE owner_id = ${s.me.id} ORDER BY name`) as Tpl[];
  const tpl = templates.find((t) => String(t.id) === searchParams.t);
  const slim = (p: { id: string; name: string; title: string }) => ({ id: p.id, name: p.name, title: p.title });
  const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name);

  return (
    <div>
      <PageHead title="Log a meeting">
        Save it right after the conversation while it&rsquo;s fresh. A future date keeps it as pending; once the day comes, your team member can
        acknowledge it.
      </PageHead>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
        <Panel>
          <ActionForm action="meeting.create" className="space-y-5 p-5 sm:p-6">
            <MeetingFields
              key={tpl?.id ?? searchParams.with ?? "blank"}
              team={s.team.map(slim).sort(byName)}
              everyone={s.people.filter((p) => p.id !== s.me.id).map(slim).sort(byName)}
              delegators={s.delegators.map(slim)}
              defaults={{
                type: isType(searchParams.type) ? searchParams.type : "regular",
                with: searchParams.with ?? "",
                title: tpl?.title ?? "",
                agenda: tpl?.agenda ?? searchParams.agenda ?? "",
                notes: tpl?.notes ?? "",
                held_on: todayIST(),
              }}
            />
            <label className="flex items-center gap-2 text-[13.5px] text-ink">
              <input type="checkbox" name="visible" defaultChecked className="accent-[#C2185B]" />
              Team member can read the notes
            </label>
            <details className="rounded-lg border border-line px-3.5 py-2.5">
              <summary className="cursor-pointer text-[13px] font-medium text-stone-700">Save as a template too</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
                <label className="flex h-9 items-center gap-2 text-[13.5px]">
                  <input type="checkbox" name="save_template" className="accent-[#C2185B]" />
                  Save
                </label>
                <Field label="Template name">
                  <input name="template_name" maxLength={80} placeholder="Weekly 1:1" className={input} />
                </Field>
              </div>
            </details>
            <div className="flex flex-wrap gap-2 border-t border-line pt-5">
              <button className={btn.primary}>Save meeting</button>
              <Link href="/uplift" className={btn.quiet}>
                Cancel
              </Link>
            </div>
          </ActionForm>
        </Panel>

        <aside>
          <Panel title="My templates">
            {templates.length === 0 ? (
              <p className="px-5 py-4 text-[13px] leading-relaxed text-stone-600">
                Running the same 1:1 every week? Tick &ldquo;Save as a template&rdquo; once and start from it next time.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {templates.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 px-5 py-2.5">
                    <Link
                      href={`/uplift/new?t=${t.id}`}
                      aria-current={tpl?.id === t.id ? "true" : undefined}
                      className={`truncate text-[13.5px] hover:text-ember ${tpl?.id === t.id ? "font-semibold text-ember" : "text-ink"}`}
                    >
                      {t.name}
                    </Link>
                    <ActionForm action="template.delete" confirm={`Delete the template “${t.name}”?`}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="text-[12px] text-stone-500 hover:text-bad">Delete</button>
                    </ActionForm>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
