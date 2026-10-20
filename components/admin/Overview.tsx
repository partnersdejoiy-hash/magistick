"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, rankOf } from "@/lib/rbac";
import { Stamp } from "../Stamp";
import type { AdminUser } from "./People";
import { api, Notice, SectionHead } from "./ui";

const BANDS = [
  { id: "lead", label: "Leadership", test: (r: number) => r >= 70 },
  { id: "mgr", label: "Managers & TLs", test: (r: number) => r >= 40 && r < 70 },
  { id: "spec", label: "Specialists", test: (r: number) => r === 35 },
  { id: "floor", label: "Associates", test: (r: number) => r >= 10 && r < 35 },
  { id: "trainee", label: "Trainees", test: (r: number) => r < 10 },
];

/** Headcount by department and hierarchy band, from the live people table. */
export default function Overview({ onOpen }: { onOpen: (tab: string) => void }) {
  const [people, setPeople] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ users: AdminUser[] }>("/api/admin/users")
      .then((d) => setPeople(d.users))
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load people."));
  }, []);

  const active = (people ?? []).filter((p) => p.status === "active");
  const suspended = (people ?? []).length - active.length;
  const noManager = active.filter((p) => !p.manager_id && rankOf(p.level) < 80).length;
  const max = Math.max(1, ...DEPARTMENTS.map((d) => active.filter((p) => p.department === d.id).length));

  return (
    <section>
      <SectionHead title="Organisation">
        Headcount by department and level band. {people && `${active.length} active`}
        {suspended > 0 && `, ${suspended} suspended`}.
      </SectionHead>
      {error && <Notice kind="error">{error}</Notice>}
      {people && noManager > 0 && (
        <button
          type="button"
          onClick={() => onOpen("people")}
          className="mb-4 flex w-full items-center justify-between rounded-lg border border-warn/30 bg-warn-tint px-4 py-2.5 text-left text-[13.5px] text-warn"
        >
          <span>
            {noManager} {noManager === 1 ? "person has" : "people have"} no manager set, so their reporting line is broken in the directory.
          </span>
          <span className="font-semibold">Fix in People</span>
        </button>
      )}
      <div className="overflow-x-auto rounded-xl border border-line bg-panel scroll-thin">
        <table className="w-full min-w-[720px] text-[13.5px]">
          <thead className="bg-parchment text-[12.5px] text-stone-700">
            <tr>
              <th scope="col" className="px-4 py-2.5 text-left font-medium">Department</th>
              <th scope="col" className="w-48 px-3 py-2.5 text-left font-medium">Headcount</th>
              {BANDS.map((b) => (
                <th key={b.id} scope="col" className="px-3 py-2.5 text-right font-medium">
                  {b.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {DEPARTMENTS.map((d) => {
              const inDept = active.filter((p) => p.department === d.id);
              return (
                <tr key={d.id} className="hover:bg-ground/60">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                    <span className="flex items-center gap-2">
                      <Stamp dept={d.id} size={14} /> {d.label}
                    </span>
                  </th>
                  <td className="px-3 py-2.5">
                    {people === null ? (
                      <span className="skeleton block h-4 w-24" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="tabular w-7 text-right font-semibold text-ink">{inDept.length}</span>
                        <span className="h-2 flex-1 rounded-sm bg-ground">
                          <span
                            className="block h-2 rounded-sm"
                            style={{ width: `${(inDept.length / max) * 100}%`, backgroundColor: d.dye }}
                          />
                        </span>
                      </span>
                    )}
                  </td>
                  {BANDS.map((b) => {
                    const n = inDept.filter((p) => b.test(rankOf(p.level))).length;
                    return (
                      <td key={b.id} className={`tabular px-3 py-2.5 text-right ${n ? "text-ink" : "text-stone-300"}`}>
                        {people === null ? "" : n}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
