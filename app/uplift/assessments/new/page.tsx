import Link from "next/link";
import ActionForm from "@/components/uplift/ActionForm";
import { Field, Panel, PageHead, PersonSelect, area, btn, input } from "@/components/uplift/ui";
import { rankOf } from "@/lib/rbac";
import { COMPETENCIES, RATING, loadScope } from "@/lib/uplift";

export const metadata = { title: "Create assessment" };

export default async function NewAssessment() {
  const s = (await loadScope())!;
  if (rankOf(s.me.level) < rankOf("ops_manager")) {
    return (
      <Panel>
        <p className="px-6 py-10 text-center text-[14px] text-stone-600">Competency assessments are created by operations managers and up.</p>
      </Panel>
    );
  }
  return (
    <div>
      <PageHead title="Create assessment">
        Rate what you&rsquo;ve seen over the last few months, not the last week. A short note on each rating makes it useful to the person reading it.
      </PageHead>
      <Panel>
        <ActionForm action="assess.create" className="space-y-6 p-5 sm:p-6">
          <Field label="Who are you assessing?" className="max-w-md">
            <PersonSelect name="user_id" people={s.team} />
          </Field>
          <div className="divide-y divide-line rounded-xl border border-line">
            {COMPETENCIES.map((c) => (
              <fieldset key={c.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <legend className="contents">
                  <span className="block">
                    <span className="block text-[14px] font-semibold text-ink">{c.label}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-stone-600">{c.hint}</span>
                  </span>
                </legend>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label key={n} className="cursor-pointer">
                        <input type="radio" name={`r_${c.id}`} value={n} required className="peer sr-only" />
                        <span className="flex h-12 flex-col items-center justify-center rounded-lg border border-line text-center transition-colors peer-checked:border-ember peer-checked:bg-ember-tint/50 peer-focus-visible:ring-2 peer-focus-visible:ring-ember">
                          <span className="tabular text-[14px] font-semibold text-ink">{n}</span>
                          <span className="hidden text-[11px] leading-tight text-stone-600 sm:block">{RATING[n]}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <input name={`n_${c.id}`} maxLength={1000} placeholder="What you saw" aria-label={`${c.label} note`} className={input} />
                </div>
              </fieldset>
            ))}
          </div>
          <Field label="Overall" hint="Strengths to keep, one or two things to grow next.">
            <textarea name="comment" rows={4} maxLength={4000} className={area} />
          </Field>
          <div className="flex gap-2 border-t border-line pt-5">
            <button className={btn.primary}>Share assessment</button>
            <Link href="/uplift/assessments" className={btn.quiet}>
              Cancel
            </Link>
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}
