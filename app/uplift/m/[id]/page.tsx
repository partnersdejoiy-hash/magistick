import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/uplift/ActionForm";
import { Field, Panel, PersonCell, StatusChip, TypeTag, area, btn, day, input } from "@/components/uplift/ui";
import { code, loadScope, meetingRows, statusOf, todayIST, TYPE_BY_ID, canSeeMeeting } from "@/lib/uplift";

export const metadata = { title: "Meeting" };

export default async function Meeting({ params }: { params: { id: string } }) {
  const s = (await loadScope())!;
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const rows = await meetingRows(`m.id = $1`, [id]);
  if (!rows.length) notFound();
  const m = rows[0];
  const pids = rows.map((r) => r.user_id);
  if (!canSeeMeeting(s, m.coach_id, pids)) notFound();

  const today = todayIST();
  const isCoach = m.coach_id === s.me.id;
  const mine = rows.find((r) => r.user_id === s.me.id);
  const myStatus = mine ? statusOf(mine, today) : null;
  const anyAck = rows.some((r) => r.ack_at);
  // Private notes stay with the coach and the coach's own managers.
  const canReadNotes = m.visible || isCoach || s.teamIds.has(m.coach_id) || s.isAdmin;
  const coach = s.byId.get(m.coach_id);
  const behalf = m.on_behalf_of ? s.byId.get(m.on_behalf_of) : undefined;
  const agenda = m.agenda.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <div className="space-y-5">
      <Link href="/uplift" className="inline-flex items-center gap-1 text-[13px] text-stone-600 hover:text-ember">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M15 5 8 12l7 7" />
        </svg>
        Meetings
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="tabular text-[13px] font-medium text-stone-500">
            {code(m.id)} · {day(m.held_on)} · {m.format === "one" ? "1:1" : `Team meeting · ${rows.length} people`}
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight text-ink">{m.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <TypeTag type={m.type} />
            {!TYPE_BY_ID[m.type].counts && <span className="text-[12.5px] text-stone-500">Doesn&rsquo;t count towards compliance</span>}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel px-4 py-3 shadow-card">
          <p className="mb-1.5 text-[12px] font-medium text-stone-500">{behalf ? `Coach, covering for ${behalf.name}` : "Coach"}</p>
          <PersonCell p={coach} href={`/uplift/people/${m.coach_id}`} />
        </div>
      </div>

      {mine && myStatus === "for_ack" && (
        <Panel className="border-warn/30 bg-warn-tint/40">
          <ActionForm action="meeting.ack" className="flex flex-wrap items-end gap-3 p-5">
            <input type="hidden" name="id" value={m.id} />
            <Field label="Acknowledge this log" hint="Your note goes back to your coach. Disagree with something? Say it here." className="min-w-[16rem] flex-1">
              <input name="note" maxLength={2000} placeholder="Optional note" className={input} />
            </Field>
            <button className={btn.primary}>Acknowledge</button>
          </ActionForm>
        </Panel>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <Panel title="Agenda">
            {agenda.length ? (
              <ol className="list-decimal space-y-1.5 py-4 pl-10 pr-5 text-[14px] leading-relaxed text-ink marker:text-stone-400">
                {agenda.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ol>
            ) : (
              <p className="px-5 py-4 text-[13.5px] text-stone-600">No agenda was set.</p>
            )}
          </Panel>
          <Panel title="Notes" aside={!m.visible && <span className="text-[12px] text-stone-500">Private to the coach and their managers</span>}>
            {canReadNotes ? (
              m.notes ? (
                <div className="max-w-[72ch] whitespace-pre-wrap px-5 py-4 text-[14px] leading-relaxed text-ink">{m.notes}</div>
              ) : (
                <p className="px-5 py-4 text-[13.5px] text-stone-600">
                  {statusOf(m, today) === "pending" ? "Notes come after the meeting." : "No notes were written."}
                </p>
              )
            ) : (
              <p className="px-5 py-4 text-[13.5px] text-stone-600">Your coach kept these notes private.</p>
            )}
          </Panel>

          {isCoach && !anyAck && (
            <Panel>
              <details>
                <summary className="cursor-pointer px-5 py-3.5 text-[14px] font-semibold text-ink">Edit this log</summary>
                <ActionForm action="meeting.update" className="space-y-4 border-t border-line p-5">
                  <input type="hidden" name="id" value={m.id} />
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <Field label="Meeting title">
                      <input name="title" required defaultValue={m.title} className={input} />
                    </Field>
                    <Field label="When">
                      <input type="date" name="held_on" required defaultValue={m.held_on} className={input} />
                    </Field>
                  </div>
                  <Field label="Agenda topics" hint="One per line.">
                    <textarea name="agenda" rows={3} defaultValue={m.agenda} className={area} />
                  </Field>
                  <Field label="Notes">
                    <textarea name="notes" rows={8} defaultValue={m.notes} className={area} />
                  </Field>
                  <label className="flex items-center gap-2 text-[13.5px]">
                    <input type="checkbox" name="visible" defaultChecked={m.visible} className="accent-[#C2185B]" />
                    Team member can read the notes
                  </label>
                  <button className={btn.primary}>Save changes</button>
                </ActionForm>
              </details>
            </Panel>
          )}
        </div>

        <aside className="space-y-5">
          <Panel title={m.format === "one" ? "Team member" : "Who was there"}>
            <ul className="divide-y divide-line">
              {rows.map((r) => (
                <li key={r.user_id} className="space-y-2 px-5 py-3">
                  <PersonCell p={s.byId.get(r.user_id)} href={`/uplift/people/${r.user_id}`} />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip status={statusOf(r, today)} />
                    {r.ack_at && <span className="tabular text-[12px] text-stone-500">{day(r.ack_at)}</span>}
                  </div>
                  {r.ack_note && <p className="rounded-lg bg-ground px-3 py-2 text-[13px] leading-snug text-stone-700">&ldquo;{r.ack_note}&rdquo;</p>}
                </li>
              ))}
            </ul>
          </Panel>
          {isCoach && !anyAck && (
            <ActionForm action="meeting.delete" confirm="Delete this meeting log? This can't be undone.">
              <input type="hidden" name="id" value={m.id} />
              <button className="text-[13px] text-stone-500 hover:text-bad">Delete this log</button>
            </ActionForm>
          )}
          {anyAck && isCoach && <p className="text-[12.5px] leading-relaxed text-stone-500">Acknowledged logs are locked so both sides keep the same record.</p>}
        </aside>
      </div>
    </div>
  );
}
