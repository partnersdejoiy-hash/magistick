"use client";

import { useState } from "react";
import { MEETING_TYPES, type MeetingType } from "@/lib/upliftCore";
import { Field, area, input } from "./ui";

type P = { id: string; name: string; title: string };

/**
 * The changing half of "Log a meeting": type, format and who's in it.
 * Mentoring can include anyone; every other type is limited to your team.
 */
export default function MeetingFields({
  team,
  everyone,
  delegators,
  defaults,
}: {
  team: P[];
  everyone: P[];
  delegators: P[];
  defaults: { type: MeetingType; with: string; title: string; agenda: string; notes: string; held_on: string };
}) {
  const [type, setType] = useState<MeetingType>(defaults.type);
  const [format, setFormat] = useState<"one" | "team">("one");
  const [filter, setFilter] = useState("");
  const pool = type === "mentor" ? everyone : team;
  const shown = pool.filter((p) => !filter || p.name.toLowerCase().includes(filter.toLowerCase()));
  const types = MEETING_TYPES.filter((t) => t.id !== "delegated" || delegators.length);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="When">
          <input type="date" name="held_on" required defaultValue={defaults.held_on} className={input} />
        </Field>
        <div>
          <span className="mb-1 block text-[12.5px] font-medium text-stone-700">Format</span>
          <div role="radiogroup" aria-label="Format" className="grid h-9 grid-cols-2 rounded-lg border border-line bg-ground p-0.5">
            {(["one", "team"] as const).map((f) => (
              <label
                key={f}
                className={`flex cursor-pointer items-center justify-center rounded-md text-[13px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember ${
                  format === f ? "bg-panel font-semibold text-ink shadow-card" : "text-stone-600"
                }`}
              >
                <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="sr-only" />
                {f === "one" ? "1:1" : "Team meeting"}
              </label>
            ))}
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[12.5px] font-medium text-stone-700">Meeting type</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {types.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer gap-3 rounded-lg border px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember ${
                type === t.id ? "border-ember bg-ember-tint/40" : "border-line hover:border-stone-300"
              }`}
            >
              <input type="radio" name="type" value={t.id} checked={type === t.id} onChange={() => setType(t.id)} className="mt-0.5 accent-[#C2185B]" />
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">{t.label}</span>
                <span className="mt-0.5 block text-[12.5px] leading-snug text-stone-600">{t.blurb}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {type === "delegated" && (
        <Field label="Coaching on behalf of" hint="Only people who handed you their team today are listed.">
          <select name="on_behalf_of" required className={input}>
            {delegators.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {format === "one" ? (
        <Field label="Who are you meeting with?" hint={type === "mentor" ? "Anyone at DEJOIY." : "People in your team."}>
          <select name="participants" required defaultValue={pool.some((p) => p.id === defaults.with) ? defaults.with : ""} className={input}>
            <option value="">Choose a person</option>
            {pool.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.title ? ` · ${p.title}` : ""}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <div>
          <div className="mb-1 flex items-end justify-between gap-3">
            <span className="text-[12.5px] font-medium text-stone-700">Who was there?</span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter names"
              aria-label="Filter names"
              className="h-8 w-40 rounded-md border border-line px-2.5 text-[12.5px] focus:border-ember focus:outline-none"
            />
          </div>
          <div className="scroll-thin max-h-56 overflow-y-auto rounded-lg border border-line">
            {pool.length === 0 && <p className="px-3 py-4 text-[13px] text-stone-600">No one in your team yet.</p>}
            {pool.map((p) => (
              <label key={p.id} className={`flex cursor-pointer items-center gap-2.5 border-b border-line px-3 py-2 last:border-0 hover:bg-ground ${shown.includes(p) ? "" : "hidden"}`}>
                <input type="checkbox" name="participants" value={p.id} defaultChecked={p.id === defaults.with} className="accent-[#C2185B]" />
                <span className="text-[13.5px] text-ink">{p.name}</span>
                <span className="truncate text-[12px] text-stone-500">{p.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Field label="Meeting title">
        <input name="title" required maxLength={200} defaultValue={defaults.title} placeholder="Weekly 1:1 — AHT and QA scores" className={input} />
      </Field>
      <Field label="Agenda topics" hint="One per line.">
        <textarea name="agenda" rows={3} defaultValue={defaults.agenda} className={area} placeholder={"Last week's QA audit\nSchedule for the festive peak"} />
      </Field>
      <Field label="Notes" hint="What you discussed, what was agreed, who does what by when.">
        <textarea name="notes" rows={7} defaultValue={defaults.notes} className={area} />
      </Field>
    </>
  );
}
