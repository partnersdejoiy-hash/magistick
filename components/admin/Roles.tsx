"use client";

import { Fragment, useEffect, useState } from "react";
import { useSession } from "@/lib/roles";
import { LEVELS, PERMISSIONS, type LevelId, type Matrix, type PermId } from "@/lib/rbac";
import { IconCheck } from "../icons";
import { api, btn, Notice, SectionHead } from "./ui";

const GROUPS = Array.from(new Set(PERMISSIONS.map((p) => p.group)));

/**
 * Level × permission matrix. Columns run from the top of the hierarchy down.
 * A dot marks a cell that differs from the default, so changes stay visible.
 */
export default function Roles() {
  const { can, refresh } = useSession();
  const editable = can("manage_roles");
  const [m, setM] = useState<{ matrix: Matrix; defaults: Matrix } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api<{ matrix: Matrix; defaults: Matrix }>("/api/admin/roles")
      .then(setM)
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load permissions."));
  }, []);

  const toggle = async (level: LevelId, perm: PermId, allowed: boolean) => {
    if (!m) return;
    setError("");
    setBusy(`${level}:${perm}`);
    try {
      const r = await api<{ matrix: Matrix }>("/api/admin/roles", {
        method: "PUT",
        body: JSON.stringify({ level, permission: perm, allowed }),
      });
      setM({ ...m, matrix: r.matrix });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setBusy("");
    }
  };

  const reset = async () => {
    if (!m || !window.confirm("Reset every level to the default permissions? Your custom changes will be lost.")) return;
    try {
      const r = await api<{ matrix: Matrix }>("/api/admin/roles", { method: "DELETE" });
      setM({ ...m, matrix: r.matrix });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't reset.");
    }
  };

  const changed = m ? LEVELS.reduce((n, l) => n + PERMISSIONS.filter((p) => m.matrix[l.id].includes(p.id) !== m.defaults[l.id].includes(p.id)).length, 0) : 0;

  return (
    <section>
      <SectionHead
        title="Roles & permissions"
        actions={
          editable && changed > 0 ? (
            <button type="button" onClick={reset} className={btn.quiet}>
              Reset {changed} change{changed === 1 ? "" : "s"} to defaults
            </button>
          ) : undefined
        }
      >
        What each level of the hierarchy can do. Changes apply to everyone at that level the moment you click.
        {editable ? " Super Admin always keeps every permission." : " Only the Super Admin can change this."}
      </SectionHead>

      {error && (
        <div className="mb-3">
          <Notice kind="error">{error}</Notice>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-panel scroll-thin">
        <table className="w-full min-w-[980px] border-collapse text-[13px]">
          <caption className="sr-only">Permission matrix: rows are permissions, columns are levels</caption>
          <thead>
            <tr className="bg-nil text-white">
              <th scope="col" className="sticky left-0 z-10 w-64 bg-nil px-4 py-3 text-left font-medium">
                Permission
              </th>
              {LEVELS.map((l) => (
                <th key={l.id} scope="col" className="px-1.5 py-3 text-center align-bottom font-medium" title={l.blurb}>
                  <span className="block text-[11.5px] leading-tight">{l.label.split(" (")[0].replace(" / ", "/")}</span>
                  <span className="tabular mt-0.5 block text-[10.5px] text-white/60">L{l.rank}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <Fragment key={g}>
                <tr className="bg-parchment">
                  <th colSpan={LEVELS.length + 1} scope="colgroup" className="sticky left-0 px-4 py-1.5 text-left text-[12px] font-semibold text-stone-700">
                    {g}
                  </th>
                </tr>
                {PERMISSIONS.filter((p) => p.group === g).map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-ground/60">
                    <th scope="row" className="sticky left-0 z-10 bg-panel px-4 py-2 text-left font-normal text-ink">
                      {p.label}
                    </th>
                    {LEVELS.map((l) => {
                      const on = !!m?.matrix[l.id].includes(p.id);
                      const differs = !!m && on !== m.defaults[l.id].includes(p.id);
                      const locked = !editable || l.id === "super_admin";
                      return (
                        <td key={l.id} className="px-1.5 py-1.5 text-center">
                          {m === null ? (
                            <span className="skeleton mx-auto block h-6 w-6" />
                          ) : (
                            <button
                              type="button"
                              disabled={locked || busy === `${l.id}:${p.id}`}
                              onClick={() => toggle(l.id, p.id, !on)}
                              aria-pressed={on}
                              aria-label={`${l.label}: ${p.label}`}
                              className={`relative mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                                on ? "border-ember bg-ember text-white" : "border-line bg-panel text-transparent"
                              } ${locked ? "cursor-default opacity-70" : on ? "hover:bg-nil" : "hover:border-ember/50"}`}
                            >
                              <IconCheck size={14} />
                              {differs && (
                                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gold ring-2 ring-panel" title="Changed from default" />
                              )}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-2 text-[12.5px] text-stone-600">
        <span className="h-2 w-2 rounded-full bg-gold" aria-hidden /> Changed from the default for that level.
        People with &ldquo;manage users&rdquo; can only edit people strictly below their own level.
      </p>
    </section>
  );
}
