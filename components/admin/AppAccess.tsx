"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/roles";
import { DEPARTMENTS, LEVELS, type DeptId, type LevelId } from "@/lib/rbac";
import { AppGlyph, type LauncherApp } from "../AppLauncher";
import { Stamp } from "../Stamp";
import { api, Notice, SectionHead } from "./ui";

type Access = { levels: Record<LevelId, boolean>; departments: DeptId[] };

/** Per app: which levels and which departments see it. Empty department list = every department. */
export default function AppAccess() {
  const { can } = useSession();
  const editable = can("manage_app_access");
  const [data, setData] = useState<{ apps: LauncherApp[]; access: Record<string, Access> } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ apps: LauncherApp[]; access: Record<string, Access> }>("/api/admin/permissions")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load app access."));
  }, []);

  const save = async (appId: string, next: Access) => {
    if (!data) return;
    const prev = data.access[appId];
    setData({ ...data, access: { ...data.access, [appId]: next } }); // optimistic
    setError("");
    try {
      await api("/api/admin/permissions", { method: "PUT", body: JSON.stringify({ appId, ...next }) });
    } catch (e) {
      setData((d) => (d ? { ...d, access: { ...d.access, [appId]: prev } } : d));
      setError(e instanceof Error ? e.message : "Couldn't save.");
    }
  };

  return (
    <section>
      <SectionHead title="App access">
        Decide who sees each app in their launcher. An app shows for a person only when both their level and their
        department are allowed.
      </SectionHead>
      {error && (
        <div className="mb-3">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
      {data === null ? (
        <div className="skeleton h-40" />
      ) : data.apps.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-panel px-4 py-8 text-center text-[13.5px] text-stone-500">
          No apps yet. Add one under Apps.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.apps.map((app) => {
            const a = data.access[app.id];
            const allDepts = a.departments.length === 0;
            return (
              <li key={app.id} className="rounded-xl border border-line bg-panel p-4">
                <div className="flex items-center gap-3">
                  <AppGlyph app={app} size={36} />
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-ink">{app.name}</p>
                    <p className="truncate text-[12.5px] text-stone-500">{app.href}</p>
                  </div>
                </div>

                <fieldset className="mt-4" disabled={!editable}>
                  <legend className="mb-2 text-[12.5px] font-medium text-stone-700">Levels</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {LEVELS.map((l) => {
                      const on = a.levels[l.id];
                      return (
                        <button
                          key={l.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => save(app.id, { ...a, levels: { ...a.levels, [l.id]: !on } })}
                          className={`h-8 rounded-md border px-2.5 text-[12.5px] font-medium transition-colors ${
                            on ? "border-ember bg-ember text-white" : "border-line bg-panel text-stone-500 line-through decoration-stone-300"
                          }`}
                        >
                          {l.label.split(" (")[0]}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset className="mt-4" disabled={!editable}>
                  <legend className="mb-2 text-[12.5px] font-medium text-stone-700">
                    Departments {allDepts && <span className="font-normal text-stone-500">· open to every department</span>}
                  </legend>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      aria-pressed={allDepts}
                      onClick={() => save(app.id, { ...a, departments: [] })}
                      className={`h-8 rounded-md border px-2.5 text-[12.5px] font-medium ${
                        allDepts ? "border-nil bg-nil text-white" : "border-line bg-panel text-stone-600"
                      }`}
                    >
                      All
                    </button>
                    {DEPARTMENTS.map((d) => {
                      const on = a.departments.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() =>
                            save(app.id, {
                              ...a,
                              departments: on ? a.departments.filter((x) => x !== d.id) : [...a.departments, d.id],
                            })
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12.5px] font-medium transition-colors"
                          style={
                            on
                              ? { backgroundColor: d.dye, borderColor: d.dye, color: "#fff" }
                              : { borderColor: "#DDE0EB", color: "#454A69", backgroundColor: "#fff" }
                          }
                        >
                          <Stamp dept={d.id} size={11} color={on ? "#fff" : undefined} />
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
