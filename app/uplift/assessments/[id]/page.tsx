import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/uplift/ActionForm";
import { Field, Panel, PersonCell, btn, day, input } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { COMPETENCIES, RATING, avg, loadScope } from "@/lib/uplift";

export const metadata = { title: "Assessment" };

type A = {
  id: number;
  user_id: string;
  created_by: string;
  scores: Record<string, { rating: number; note: string }>;
  comment: string;
  ack_at: string | null;
  ack_note: string;
  created_on: string;
};

export default async function Assessment({ params }: { params: { id: string } }) {
  const s = (await loadScope())!;
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [a] = (await sql()`
    SELECT id, user_id, created_by, scores, comment, ack_at::text AS ack_at, ack_note,
           to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS created_on
      FROM up_assessments WHERE id = ${id}`) as A[];
  if (!a || !(a.user_id === s.me.id || a.created_by === s.me.id || s.teamIds.has(a.user_id))) notFound();
  const mine = a.user_id === s.me.id;

  return (
    <div className="space-y-5">
      <Link href="/uplift/assessments" className="inline-flex text-[13px] text-stone-600 hover:text-ember">
        Competency assessment
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="tabular text-[13px] text-stone-500">
            {day(a.created_on)} · by {s.byId.get(a.created_by)?.name ?? "—"}
          </p>
          <h1 className="mt-1 text-[28px] font-semibold text-ink">{mine ? "Your assessment" : `${s.byId.get(a.user_id)?.name ?? "Former employee"}`}</h1>
        </div>
        <div className="rounded-xl border border-line bg-panel px-4 py-3 shadow-card">
          <p className="text-[12px] font-medium text-stone-500">Average</p>
          <p className="tabular text-[22px] font-semibold text-ink">
            {avg(a.scores).toFixed(1)}
            <span className="text-[14px] font-normal text-stone-500"> / 5</span>
          </p>
        </div>
      </div>

      {!mine && <PersonCell p={s.byId.get(a.user_id)} href={`/uplift/people/${a.user_id}`} />}

      <Panel>
        <ul className="divide-y divide-line">
          {COMPETENCIES.map((c) => {
            const r = a.scores[c.id];
            return (
              <li key={c.id} className="grid gap-3 px-5 py-4 md:grid-cols-[220px_200px_minmax(0,1fr)] md:items-center">
                <span className="text-[14px] font-semibold text-ink">{c.label}</span>
                <span className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={`h-2 w-6 rounded-full ${n <= (r?.rating ?? 0) ? "bg-ember" : "bg-parchment"}`} />
                    ))}
                  </span>
                  <span className="text-[12.5px] text-stone-700">{r ? `${r.rating} · ${RATING[r.rating]}` : "—"}</span>
                </span>
                <span className="text-[13.5px] leading-relaxed text-stone-700">{r?.note || <span className="text-stone-400">No note</span>}</span>
              </li>
            );
          })}
        </ul>
      </Panel>

      {a.comment && (
        <Panel title="Overall">
          <p className="max-w-[72ch] whitespace-pre-wrap px-5 py-4 text-[14px] leading-relaxed text-ink">{a.comment}</p>
        </Panel>
      )}

      {a.ack_at ? (
        <p className="rounded-xl bg-ok-tint px-5 py-3 text-[13.5px] text-ok">
          Acknowledged on {day(a.ack_at)}
          {a.ack_note && <span className="text-stone-700"> — &ldquo;{a.ack_note}&rdquo;</span>}
        </p>
      ) : mine ? (
        <Panel className="border-warn/30 bg-warn-tint/40">
          <ActionForm action="assess.ack" className="flex flex-wrap items-end gap-3 p-5">
            <input type="hidden" name="id" value={a.id} />
            <Field label="Acknowledge" hint="Acknowledging means you've read it, not that you agree with every line." className="min-w-[16rem] flex-1">
              <input name="note" maxLength={2000} placeholder="Optional note to your manager" className={input} />
            </Field>
            <button className={btn.primary}>Acknowledge</button>
          </ActionForm>
        </Panel>
      ) : (
        <p className="text-[13px] text-stone-600">Waiting for {s.byId.get(a.user_id)?.name ?? "them"} to acknowledge.</p>
      )}
    </div>
  );
}
