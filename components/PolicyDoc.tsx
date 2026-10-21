"use client";

import type { DocSection } from "@/lib/policyDocs";
import type { Policy } from "@/lib/policies";

const anchor = (n: number) => `section-${n + 1}`;

/**
 * The full, formal policy below the deck: numbered sections and clauses
 * (1, 1.1, 1.2…), tables, and a sticky table of contents. Prints cleanly.
 */
export default function PolicyDoc({ policy, sections }: { policy: Policy; sections: DocSection[] }) {
  return (
    <section aria-labelledby="doc-title" className="rounded-3xl border border-line bg-panel">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-6 py-6 sm:px-10">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: policy.accent }}>
            Full policy
          </p>
          <h2 id="doc-title" className="mt-1 text-[26px] font-semibold leading-tight text-ink">
            {policy.title}
          </h2>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-stone-600">
            <div className="flex gap-1">
              <dt>Owner:</dt>
              <dd className="font-medium text-ink">{policy.owner}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Version:</dt>
              <dd className="font-medium text-ink">{policy.version}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Effective:</dt>
              <dd className="font-medium text-ink">{policy.effective}</dd>
            </div>
            <div className="flex gap-1">
              <dt>Status:</dt>
              <dd className="font-medium text-ink">{policy.status}</dd>
            </div>
          </dl>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-line bg-panel px-3.5 py-2 text-[13px] font-medium text-ink hover:border-gold print:hidden"
        >
          Print / save as PDF
        </button>
      </header>

      <div className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Contents" className="print:hidden lg:sticky lg:top-24 lg:self-start">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-500">Contents</p>
          <ol className="mt-3 space-y-1 border-l border-line">
            {sections.map((s, n) => (
              <li key={s.heading}>
                <a
                  href={`#${anchor(n)}`}
                  className="-ml-px block border-l-2 border-transparent py-1 pl-3 text-[13px] text-stone-600 hover:border-gold hover:text-ink"
                >
                  <span className="tabular mr-1.5 text-stone-400">{n + 1}.</span>
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-[75ch] space-y-9">
          {sections.map((s, n) => (
            <section key={s.heading} id={anchor(n)} aria-labelledby={`${anchor(n)}-h`} className="scroll-mt-28">
              <h3 id={`${anchor(n)}-h`} className="flex items-baseline gap-2.5 text-[19px] font-semibold text-ink">
                <span className="tabular text-[15px] font-bold" style={{ color: policy.accent }}>
                  {n + 1}.
                </span>
                {s.heading}
              </h3>
              {s.paras?.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-relaxed text-stone-700">
                  {p}
                </p>
              ))}
              {s.clauses && (
                <ol className="mt-3 space-y-2.5">
                  {s.clauses.map((c, k) => (
                    <li key={c} className="flex gap-3 text-[15px] leading-relaxed text-stone-700">
                      <span className="tabular w-9 shrink-0 pt-px text-[13px] font-semibold text-stone-400">
                        {n + 1}.{k + 1}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ol>
              )}
              {s.table && (
                <div className="scroll-thin mt-4 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[520px] text-left text-[14px]">
                    <thead className="bg-parchment text-[12.5px] uppercase tracking-wide text-stone-600">
                      <tr>
                        {s.table.head.map((h) => (
                          <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {s.table.rows.map((r) => (
                        <tr key={r.join("|")}>
                          {r.map((c, k) =>
                            k === 0 ? (
                              <th key={k} scope="row" className="px-4 py-3 align-top font-semibold text-ink">
                                {c}
                              </th>
                            ) : (
                              <td key={k} className="px-4 py-3 align-top text-stone-700">
                                {c}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          <p className="rounded-xl bg-gold-tint px-4 py-3 text-[13px] leading-relaxed text-gold-ink">
            This policy is a <strong>{policy.status.toLowerCase()}</strong> prepared for DEJOIY India Pvt. Ltd. and is pending review by HR and legal
            counsel. Statutory references reflect Indian law as of October 2026; company-specific numbers are proposals until the policy is published.
          </p>
        </div>
      </div>
    </section>
  );
}
