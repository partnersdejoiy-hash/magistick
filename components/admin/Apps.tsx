"use client";

import { useCallback, useEffect, useState } from "react";
import { AppGlyph, type LauncherApp } from "../AppLauncher";
import { APP_ICONS, IconPlus } from "../icons";
import { api, btn, Field, inputCls, Notice, SectionHead } from "./ui";

const ICON_CHOICES = Object.keys(APP_ICONS) as (keyof typeof APP_ICONS)[];
// App colours borrow the department dyes so tiles sit inside the same world.
const COLOR_CHOICES = ["#2B3A8C", "#B3261E", "#B7791F", "#2F6B3B", "#1F6F78", "#B0386A", "#C2561A", "#0E7C6B"];

const empty = { name: "", href: "", blurb: "", category: "Tools", icon: "globe", color: COLOR_CHOICES[0] };

/** The launcher catalog: add, edit, remove apps. Who sees each app lives in App access. */
export default function Apps() {
  const [apps, setApps] = useState<LauncherApp[] | null>(null);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setApps((await api<{ apps: LauncherApp[] }>("/api/admin/apps")).apps);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load apps.");
      setApps([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editId) await api(`/api/admin/apps/${editId}`, { method: "PATCH", body: JSON.stringify(form) });
      else await api("/api/admin/apps", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the app.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (a: LauncherApp) => {
    if (!window.confirm(`Remove ${a.name} from everyone's launcher?`)) return;
    try {
      await api(`/api/admin/apps/${a.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove the app.");
    }
  };

  return (
    <section>
      <SectionHead title="Apps">Every tool in the launcher. New apps start open to all levels and departments; narrow them in App access.</SectionHead>
      {error && (
        <div className="mb-3">
          <Notice kind="error">{error}</Notice>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-5">
        <ul className="divide-y divide-line self-start overflow-hidden rounded-xl border border-line bg-panel lg:col-span-3">
          {apps === null ? (
            <li className="p-4">
              <div className="skeleton h-10" />
            </li>
          ) : apps.length === 0 ? (
            <li className="px-4 py-8 text-center text-[13.5px] text-stone-500">No apps yet. Add the first one.</li>
          ) : (
            apps.map((a) => (
              <li key={a.id} className={`flex items-center gap-3 px-4 py-3 ${editId === a.id ? "bg-ember-tint/50" : ""}`}>
                <AppGlyph app={a} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{a.name}</p>
                  <p className="truncate text-[12.5px] text-stone-500">
                    {a.category} · {a.href}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-[13px] font-medium text-ember hover:underline"
                  onClick={() => {
                    setEditId(a.id);
                    setForm({ name: a.name, href: a.href, blurb: a.blurb, category: a.category, icon: a.icon, color: a.color });
                  }}
                >
                  Edit
                </button>
                <button type="button" className="text-[13px] font-medium text-bad hover:underline" onClick={() => remove(a)}>
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>

        <form onSubmit={submit} className="space-y-3 self-start rounded-xl border border-line bg-panel p-4 lg:col-span-2">
          <p className="text-[14.5px] font-semibold text-ink">{editId ? "Edit app" : "Add an app"}</p>
          <Field label="Name">
            <input className={inputCls} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Link">
            <input className={inputCls} required placeholder="https://" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
          </Field>
          <Field label="What it's for">
            <input className={inputCls} placeholder="One line" value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
          </Field>
          <Field label="Category">
            <input className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
          <fieldset>
            <legend className="mb-1 text-[12.5px] font-medium text-stone-700">Icon</legend>
            <div className="flex flex-wrap gap-1.5">
              {ICON_CHOICES.map((k) => {
                const I = APP_ICONS[k];
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={form.icon === k}
                    aria-label={`Icon ${k}`}
                    onClick={() => setForm({ ...form, icon: k })}
                    className={`flex h-8 w-8 items-center justify-center rounded-md border ${
                      form.icon === k ? "border-ember bg-ember-tint text-ember" : "border-line text-stone-500 hover:text-ink"
                    }`}
                  >
                    <I size={16} />
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1 text-[12.5px] font-medium text-stone-700">Colour</legend>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_CHOICES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={form.color === c}
                  aria-label={`Colour ${c}`}
                  onClick={() => setForm({ ...form, color: c })}
                  style={{ backgroundColor: c }}
                  className={`h-7 w-7 rounded-md ${form.color === c ? "ring-2 ring-ink ring-offset-2" : ""}`}
                />
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={busy} className={btn.primary}>
              {editId ? "Save app" : (
                <>
                  <IconPlus size={15} /> Add app
                </>
              )}
            </button>
            {editId && (
              <button type="button" className={btn.quiet} onClick={() => { setEditId(null); setForm(empty); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
