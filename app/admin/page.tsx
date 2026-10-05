"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CAPABILITY_LABELS,
  ROLES,
  ROLE_IDS,
  useSession,
  type Capability,
  type RoleId,
} from "@/lib/roles";
import type { AppMatrix } from "@/app/api/admin/permissions/route";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import NotAllowed from "@/components/NotAllowed";
import { APP_ICONS, IconArrowRight, IconCheck, IconPlus } from "@/components/icons";

type User = { id: string; email: string; name: string; role: RoleId; created_at: string };
type App = {
  id: string;
  name: string;
  blurb: string;
  category: string;
  href: string;
  icon: string;
  color: string;
};

const inputCls =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none";

function iconFor(key: string) {
  return (APP_ICONS as Record<string, (p: { size?: number }) => JSX.Element>)[key] ?? APP_ICONS.globe;
}

/* ---------------- Team (users) ---------------- */

function TeamSection({ me }: { me: { id: string } | null }) {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ email: "", name: "", role: "employee" as RoleId, password: "" });
  const [error, setError] = useState("");
  const [resetFor, setResetFor] = useState<User | null>(null);
  const [newPw, setNewPw] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (res.ok) setUsers(((await res.json()).users ?? []) as User[]);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Couldn't create the user.");
      return;
    }
    setForm({ email: "", name: "", role: "employee", password: "" });
    load();
  };

  const setRole = async (u: User, role: RoleId) => {
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || "Couldn't change the role.");
    load();
  };

  const resetPassword = async () => {
    if (!resetFor || newPw.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    const res = await fetch(`/api/admin/users/${resetFor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPw }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Couldn't reset the password.");
      return;
    }
    setResetFor(null);
    setNewPw("");
  };

  const remove = async (u: User) => {
    if (!window.confirm(`Remove ${u.name} (${u.email})? They'll lose access immediately.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || "Couldn't remove the user.");
    load();
  };

  return (
    <section>
      <Reveal>
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Team</h2>
        <p className="mt-1 max-w-xl text-[13.5px] text-stone-500">
          Who can sign in, and as what. New members get their password from you directly.
        </p>
      </Reveal>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white/70">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Member</th>
              <th className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Role</th>
              <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3">
                  <p className="text-sm font-semibold text-ink">{u.name}</p>
                  <p className="text-xs text-stone-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={me?.id === u.id}
                    onChange={(e) => setRole(u, e.target.value as RoleId)}
                    aria-label={`Role for ${u.name}`}
                    className="rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[13px] font-medium text-ink focus:border-ember focus:outline-none disabled:opacity-60"
                  >
                    {ROLE_IDS.map((r) => (
                      <option key={r} value={r}>{ROLES[r].label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setResetFor(u); setNewPw(""); setError(""); }}
                      className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:border-magenta/50 hover:text-magenta"
                    >
                      Reset password
                    </button>
                    {me?.id !== u.id && (
                      <button
                        type="button"
                        onClick={() => remove(u)}
                        className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:border-red-300 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resetFor && (
        <div className="mt-4 rounded-2xl border border-magenta/40 bg-white/80 p-5">
          <p className="text-sm font-semibold text-ink">Reset password for {resetFor.name}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              type="text"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password (min 8 characters)"
              className={`${inputCls} max-w-xs`}
            />
            <button
              type="button"
              onClick={resetPassword}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ember hover:text-ink"
            >
              Set password
            </button>
            <button
              type="button"
              onClick={() => setResetFor(null)}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-stone-500 hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={create} className="mt-5 rounded-2xl border border-line bg-white/70 p-5">
        <p className="text-sm font-semibold text-ink">Add a member</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input className={inputCls} required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={`${inputCls} sm:col-span-2`} required type="email" placeholder="work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select
            className={inputCls}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as RoleId })}
            aria-label="Role"
          >
            {ROLE_IDS.map((r) => (
              <option key={r} value={r}>{ROLES[r].label}</option>
            ))}
          </select>
          <input className={inputCls} required type="text" placeholder="Temp password (min 8)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-all duration-200 hover:bg-ember hover:text-ink active:scale-95"
        >
          <IconPlus size={15} /> Add member
        </button>
      </form>
    </section>
  );
}

/* ---------------- App access matrix ---------------- */

function MatrixSection() {
  const [apps, setApps] = useState<App[]>([]);
  const [matrix, setMatrix] = useState<AppMatrix>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/permissions", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setApps(d.apps as App[]);
          setMatrix(d.matrix as AppMatrix);
        }
      })
      .catch(() => {});
  }, []);

  const toggle = async (appId: string, r: RoleId) => {
    const current = matrix[appId] ?? { admin: true, collaborator: true, employee: true };
    const next = { ...current, [r]: !current[r] };
    if (Object.values(next).every((v) => !v)) return; // keep usable by someone
    const m = { ...matrix, [appId]: next };
    setMatrix(m);
    setSaving(true);
    try {
      await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matrix: { [appId]: next } }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <Reveal>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">App access matrix</h2>
          {saving && <p className="text-xs text-stone-400">Saving…</p>}
        </div>
        <p className="mt-1 max-w-xl text-[13.5px] text-stone-500">
          Toggle which roles can open each app. Enforced server-side from the login session.
        </p>
      </Reveal>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white/70">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">App</th>
              {ROLE_IDS.map((r) => (
                <th key={r} className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  {ROLES[r].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => {
              const Icon = iconFor(app.icon);
              const allowed = matrix[app.id] ?? { admin: true, collaborator: true, employee: true };
              return (
                <tr key={app.id} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl"
                        style={{ backgroundColor: app.color }}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white" style={{ color: app.color }}>
                          <Icon size={13} />
                        </span>
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink">{app.name}</span>
                        <span className="block text-xs text-stone-400">{app.category}</span>
                      </span>
                    </span>
                  </td>
                  {ROLE_IDS.map((r) => {
                    const on = allowed[r];
                    return (
                      <td key={r} className="px-4 py-3 text-center">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-label={`${ROLES[r].label} can use ${app.name}`}
                          onClick={() => toggle(app.id, r)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${
                            on
                              ? "border-ember bg-ember text-ink"
                              : "border-line bg-paper text-transparent hover:border-stone-300"
                          }`}
                        >
                          <IconCheck size={14} />
                        </button>
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

/* ---------------- Apps manager ---------------- */

const ICON_CHOICES = ["clock", "ticket", "globe", "people", "wallet", "book", "wrench", "chat", "video", "award", "bulb", "plane", "userplus", "gauge"];
const COLOR_CHOICES = ["#2563EB", "#00ACC1", "#FFC400", "#E91E63", "#7C3AED", "#059669", "#EA580C", "#DC2626"];

function AppsSection({ onChanged }: { onChanged: () => void }) {
  const [apps, setApps] = useState<App[]>([]);
  const [form, setForm] = useState({ name: "", href: "", blurb: "", category: "Tools", icon: "globe", color: COLOR_CHOICES[0] });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/apps", { cache: "no-store" });
    if (res.ok) setApps(((await res.json()).apps ?? []) as App[]);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Couldn't add the app.");
      return;
    }
    setForm({ name: "", href: "", blurb: "", category: "Tools", icon: "globe", color: COLOR_CHOICES[0] });
    load();
    onChanged();
  };

  const remove = async (a: App) => {
    if (!window.confirm(`Remove "${a.name}" from the launcher?`)) return;
    await fetch(`/api/admin/apps/${a.id}`, { method: "DELETE" });
    load();
    onChanged();
  };

  return (
    <section>
      <Reveal>
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Apps</h2>
        <p className="mt-1 max-w-xl text-[13.5px] text-stone-500">
          The launcher catalog. Tiles open in a new tab; access per role is set in the matrix above.
        </p>
      </Reveal>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          {error}
        </p>
      )}
      <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/70">
        {apps.map((a) => {
          const Icon = iconFor(a.icon);
          return (
            <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: a.color }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white" style={{ color: a.color }}>
                  <Icon size={15} />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">{a.name}</span>
                <span className="block truncate text-xs text-stone-400">{a.href}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(a)}
                className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:border-red-300 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={create} className="mt-5 rounded-2xl border border-line bg-white/70 p-5">
        <p className="text-sm font-semibold text-ink">Add an app</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input className={inputCls} required placeholder="App name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputCls} required placeholder="https://…" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
          <input className={inputCls} placeholder="One-line description" value={form.blurb} onChange={(e) => setForm({ ...form, blurb: e.target.value })} />
          <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Icon</span>
            <div className="flex flex-wrap gap-1.5">
              {ICON_CHOICES.map((k) => {
                const I = iconFor(k);
                const active = form.icon === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, icon: k })}
                    aria-pressed={active}
                    aria-label={`Icon ${k}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                      active ? "border-ember bg-ember-tint text-ember-ink" : "border-line text-stone-400 hover:text-ink"
                    }`}
                  >
                    <I size={17} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Color</span>
            <div className="flex flex-wrap gap-1.5">
              {COLOR_CHOICES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  aria-pressed={form.color === c}
                  aria-label={`Color ${c}`}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-lg transition-transform ${
                    form.color === c ? "scale-110 ring-2 ring-ink ring-offset-2" : "hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-all duration-200 hover:bg-ember hover:text-ink active:scale-95"
        >
          <IconPlus size={15} /> Add app
        </button>
      </form>
    </section>
  );
}

/* ---------------- Page ---------------- */

export default function AdminPage() {
  const { user, loading, can } = useSession();
  const [matrixKey, setMatrixKey] = useState(0);

  if (loading) return null;
  if (!can("manage_roles")) return <NotAllowed what="Roles & access" />;

  return (
    <div className="space-y-12">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Admin</p>
        <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">
          Roles &amp; access
        </h1>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-stone-600">
          Decide who the portal is for: who can sign in, what each role can do,
          and which apps each role can open. Changes apply to everyone, instantly.
        </p>
      </Reveal>

      <section>
        <Reveal>
          <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">Roles</h2>
        </Reveal>
        <Stagger className="mt-5 grid gap-4 sm:grid-cols-3" gap={0.08}>
          {(Object.keys(ROLES) as RoleId[]).map((r) => (
            <StaggerItem key={r}>
              <div className="h-full rounded-2xl border border-line bg-white/70 p-5">
                <p className="font-display text-lg font-semibold text-ink">{ROLES[r].label}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{ROLES[r].blurb}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ROLES[r].capabilities.length === 0 ? (
                    <span className="rounded-full bg-parchment px-2.5 py-1 text-[11px] font-medium text-stone-500">
                      No admin capabilities
                    </span>
                  ) : (
                    ROLES[r].capabilities.map((c: Capability) => (
                      <span key={c} className="rounded-full bg-ember-tint px-2.5 py-1 text-[11px] font-semibold text-ember-ink">
                        {CAPABILITY_LABELS[c]}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <TeamSection me={user ? { id: user.id } : null} />

      <div key={matrixKey}>
        <MatrixSection />
      </div>

      <AppsSection onChanged={() => setMatrixKey((k) => k + 1)} />

      <Reveal>
        <Link
          href="/admin/posts"
          className="group flex items-center justify-between rounded-2xl border border-line bg-white/70 px-6 py-5 transition-all duration-300 hover:border-magenta/50 hover:shadow-lift"
        >
          <span>
            <span className="block font-display text-lg font-semibold text-ink">Manage posts</span>
            <span className="mt-0.5 block text-[13px] text-stone-500">
              Create, edit and publish bulletin updates — collaborator capability.
            </span>
          </span>
          <IconArrowRight size={18} className="text-stone-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-magenta" />
        </Link>
      </Reveal>
    </div>
  );
}
