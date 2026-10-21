"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/roles";
import { DEPARTMENTS, DEPT_BY_ID, LEVELS, LEVEL_BY_ID, rankOf, type DeptId, type LevelId } from "@/lib/rbac";
import { Avatar, DeptTag, LevelTag } from "../Stamp";
import { IconPlus, IconSearch } from "../icons";
import { api, btn, Field, inputCls, Notice, SectionHead } from "./ui";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  level: LevelId;
  department: DeptId;
  title: string;
  manager_id: string | null;
  location: string;
  status: "active" | "suspended";
  manageable: boolean;
};

type Draft = {
  name: string;
  email: string;
  password: string;
  level: LevelId;
  department: DeptId;
  title: string;
  manager_id: string;
  location: string;
  status: "active" | "suspended";
};

function PersonForm({
  initial,
  creating,
  people,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: Draft;
  creating: boolean;
  people: AdminUser[];
  onSave: (d: Draft) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const { user } = useSession();
  const [d, setD] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  if (!user) return null;
  const superAdmin = user.level === "super_admin";
  const levels = LEVELS.filter((l) => l.id !== "super_admin" && (superAdmin || l.rank < rankOf(user.level)));
  const deptLocked = !superAdmin && !user.perms.includes("manage_users_all");
  const managers = people.filter((p) => p.status === "active");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSave(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-ember/30 bg-panel p-5 shadow-card">
      {error && <Notice kind="error">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Full name">
          <input className={inputCls} required value={d.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Work email">
          <input className={inputCls} type="email" required disabled={!creating} value={d.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label={creating ? "Temporary password" : "Reset password"} hint={creating ? "At least 8 characters. Share it privately." : "Leave blank to keep the current one."}>
          <input
            className={inputCls}
            type="password"
            autoComplete="new-password"
            required={creating}
            minLength={creating ? 8 : undefined}
            value={d.password}
            onChange={(e) => set("password", e.target.value)}
          />
        </Field>
        <Field label="Level">
          <select className={inputCls} value={d.level} onChange={(e) => set("level", e.target.value as LevelId)}>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Department" hint={deptLocked ? "You can only manage your own department." : undefined}>
          <select className={inputCls} value={d.department} disabled={deptLocked} onChange={(e) => set("department", e.target.value as DeptId)}>
            {DEPARTMENTS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Job title">
          <input className={inputCls} placeholder="e.g. Customer Support Associate" value={d.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Reports to">
          <select className={inputCls} value={d.manager_id} onChange={(e) => set("manager_id", e.target.value)}>
            <option value="">No manager</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {LEVEL_BY_ID[m.level].label.split(" (")[0]} · {DEPT_BY_ID[m.department].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Site / location">
          <input className={inputCls} placeholder="e.g. Gurugram" value={d.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        {!creating && (
          <Field label="Status" hint="Suspended people can't sign in and are hidden from the directory.">
            <select className={inputCls} value={d.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </Field>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className={btn.primary}>
          {busy ? "Saving…" : creating ? "Add person" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className={btn.quiet}>
          Cancel
        </button>
        {onDelete && (
          <button
            type="button"
            className={`${btn.danger} ml-auto`}
            onClick={async () => {
              if (!window.confirm(`Delete ${initial.name} permanently? Their direct reports move up to their manager. Suspending is reversible; deleting is not.`)) return;
              setBusy(true);
              try {
                await onDelete();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Couldn't delete.");
                setBusy(false);
              }
            }}
          >
            Delete permanently
          </button>
        )}
      </div>
    </form>
  );
}

export default function People() {
  const { user } = useSession();
  const [people, setPeople] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<"all" | DeptId>("all");
  const [level, setLevel] = useState<"all" | LevelId>("all");

  const load = useCallback(async () => {
    try {
      setPeople((await api<{ users: AdminUser[] }>("/api/admin/users")).users);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load people.");
      setPeople([]);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (people ?? [])
      .filter(
        (p) =>
          (dept === "all" || p.department === dept) &&
          (level === "all" || p.level === level) &&
          (!n || `${p.name} ${p.email} ${p.title} ${p.location}`.toLowerCase().includes(n)),
      )
      .sort((a, b) => rankOf(b.level) - rankOf(a.level) || a.name.localeCompare(b.name));
  }, [people, q, dept, level]);

  if (!user) return null;
  const byId = new Map((people ?? []).map((p) => [p.id, p]));
  const blank: Draft = {
    name: "",
    email: "",
    password: "",
    level: "associate",
    department: user.perms.includes("manage_users_all") || user.level === "super_admin" ? "operations" : user.department,
    title: "",
    manager_id: user.perms.includes("manage_users_all") ? "" : user.id,
    location: user.location,
    status: "active",
  };
  const toDraft = (p: AdminUser): Draft => ({ ...p, password: "", manager_id: p.manager_id ?? "" });

  const save = async (id: string | "new", d: Draft) => {
    const body = { ...d, manager_id: d.manager_id || null, password: d.password || undefined };
    if (id === "new") await api("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
    else await api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    setOk(id === "new" ? `${d.name} added.` : `${d.name} updated.`);
    setEditing(null);
    load();
  };

  return (
    <section>
      <SectionHead
        title="People"
        actions={
          <button type="button" className={btn.primary} onClick={() => setEditing("new")} disabled={editing === "new"}>
            <IconPlus size={15} /> Add person
          </button>
        }
      >
        Everyone at DEJOIY, highest level first. You can edit people below your level
        {user.level === "super_admin"
          ? "; as Super Admin you can edit everyone."
          : user.perms.includes("manage_users_all")
            ? " in every department."
            : user.perms.includes("manage_users_dept")
              ? ` in ${DEPT_BY_ID[user.department].label}.`
              : " in your own reporting line."}
      </SectionHead>

      <div className="space-y-3">
        {error && <Notice kind="error">{error}</Notice>}
        {ok && <Notice kind="ok">{ok}</Notice>}
        {editing === "new" && (
          <PersonForm initial={blank} creating people={people ?? []} onSave={(d) => save("new", d)} onCancel={() => setEditing(null)} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className={`${inputCls} pl-8`} placeholder="Search people" aria-label="Search people" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className={`${inputCls} w-auto`} aria-label="Filter by department" value={dept} onChange={(e) => setDept(e.target.value as typeof dept)}>
          <option value="all">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <select className={`${inputCls} w-auto`} aria-label="Filter by level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
          <option value="all">All levels</option>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label.split(" (")[0]}
            </option>
          ))}
        </select>
        <span className="tabular ml-auto text-[13px] text-stone-500">
          {people ? `${list.length} of ${people.length}` : ""}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-panel scroll-thin">
        <table className="w-full min-w-[760px] text-left text-[13.5px]">
          <thead className="bg-parchment text-[12.5px] text-stone-700">
            <tr>
              <th scope="col" className="px-4 py-2.5 font-medium">Person</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Level</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Department</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Reports to</th>
              <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
              <th scope="col" className="px-4 py-2.5 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {people === null
              ? [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="skeleton h-6" />
                    </td>
                  </tr>
                ))
              : list.length === 0
                ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                      {people.length ? "No one matches these filters." : "No people yet. Add the first one above."}
                    </td>
                  </tr>
                )
                : list.map((p) => (
                  <PersonRow
                    key={p.id}
                    p={p}
                    me={p.id === user.id}
                    manager={p.manager_id ? byId.get(p.manager_id)?.name ?? "—" : "—"}
                    open={editing === p.id}
                    onEdit={() => setEditing(editing === p.id ? null : p.id)}
                    form={
                      <PersonForm
                        initial={toDraft(p)}
                        creating={false}
                        people={(people ?? []).filter((x) => x.id !== p.id)}
                        onSave={(d) => save(p.id, d)}
                        onCancel={() => setEditing(null)}
                        onDelete={async () => {
                          await api(`/api/admin/users/${p.id}`, { method: "DELETE" });
                          setOk(`${p.name} deleted.`);
                          setEditing(null);
                          load();
                        }}
                      />
                    }
                  />
                ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PersonRow({
  p,
  me,
  manager,
  open,
  onEdit,
  form,
}: {
  p: AdminUser;
  me: boolean;
  manager: string;
  open: boolean;
  onEdit: () => void;
  form: React.ReactNode;
}) {
  return (
    <>
      <tr className={open ? "bg-ember-tint/40" : "hover:bg-ground/60"}>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Avatar id={p.id} name={p.name} dept={p.department} size={32} />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">
                {p.name} {me && <span className="text-[12px] font-normal text-stone-500">(you)</span>}
              </p>
              <p className="truncate text-[12.5px] text-stone-500">{p.title || p.email}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-2.5">
          <LevelTag level={p.level} />
        </td>
        <td className="px-3 py-2.5">
          <DeptTag dept={p.department} />
        </td>
        <td className="px-3 py-2.5 text-stone-700">{manager}</td>
        <td className="px-3 py-2.5">
          <span
            className={`inline-flex items-center gap-1.5 text-[12.5px] ${p.status === "active" ? "text-ok" : "text-bad"}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${p.status === "active" ? "bg-ok" : "bg-bad"}`} aria-hidden />
            {p.status === "active" ? "Active" : "Suspended"}
          </span>
        </td>
        <td className="px-4 py-2.5 text-right">
          {p.manageable ? (
            <button type="button" onClick={onEdit} aria-expanded={open} className="text-[13px] font-medium text-ember hover:underline">
              {open ? "Close" : "Edit"}
            </button>
          ) : (
            <span className="text-[12px] text-stone-400" title="Outside your scope">View only</span>
          )}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="bg-ground/60 px-4 py-4">
            {form}
          </td>
        </tr>
      )}
    </>
  );
}
