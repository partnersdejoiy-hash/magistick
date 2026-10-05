"use client";

import Link from "next/link";
import { APPS, tintFor } from "@/lib/data";
import {
  CAPABILITY_LABELS,
  ROLES,
  ROLE_IDS,
  useRole,
  type Capability,
  type RoleId,
} from "@/lib/roles";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import NotAllowed from "@/components/NotAllowed";
import { APP_ICONS, IconArrowRight, IconCheck } from "@/components/icons";


function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
        View portal as
      </p>
      <div className="mt-3 inline-flex rounded-full border border-line bg-white/70 p-1">
        {ROLE_IDS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            aria-pressed={role === r}
            className={`rounded-full px-5 py-2 text-[13px] font-semibold transition-all duration-200 ${
              role === r ? "bg-ink text-paper shadow-card" : "text-stone-500 hover:text-ink"
            }`}
          >
            {ROLES[r].label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-400">
        Stubbed preview — real login (phase 2) will set this from your account.
      </p>
    </div>
  );
}

function MatrixTable() {
  const { matrix, setMatrix } = useRole();

  const toggle = (appId: string, r: RoleId) => {
    const current = matrix[appId]; // undefined = all roles
    const all = current ?? [...ROLE_IDS];
    const next = all.includes(r) ? all.filter((x) => x !== r) : [...all, r];
    if (next.length === 0) return; // an app must stay usable by someone
    const m = { ...matrix };
    if (next.length === ROLE_IDS.length) delete m[appId];
    else m[appId] = next;
    setMatrix(m);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white/70">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
              App
            </th>
            {ROLE_IDS.map((r) => (
              <th
                key={r}
                className="px-4 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400"
              >
                {ROLES[r].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {APPS.map((app) => {
            const Icon = APP_ICONS[app.icon];
            const allowed = matrix[app.id] ?? [...ROLE_IDS];
            return (
              <tr key={app.id} className="border-b border-line/60 last:border-0">
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tintFor(app.category)}`}>
                      <Icon size={17} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{app.name}</span>
                      <span className="block text-xs text-stone-400">{app.category}</span>
                    </span>
                  </span>
                </td>
                {ROLE_IDS.map((r) => {
                  const on = allowed.includes(r);
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
                            ? "border-ember bg-ember text-paper"
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
  );
}

export default function AdminPage() {
  const { can } = useRole();
  if (!can("manage_roles")) return <NotAllowed what="Roles & access" />;

  return (
    <div className="space-y-12">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Admin</p>
        <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">
          Roles &amp; access
        </h1>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-stone-600">
          Decide who the portal is for: what each role can do, and which apps
          each role can open. Changes apply instantly on this device.
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
        <div className="mt-6">
          <RoleSwitcher />
        </div>
      </section>

      <section>
        <Reveal>
          <h2 className="font-display text-[22px] font-semibold tracking-tight text-ink">
            App access matrix
          </h2>
          <p className="mt-1 max-w-xl text-[13.5px] text-stone-500">
            Toggle which roles can open each app. Untouched apps stay open to
            everyone. Gating is client-side for now — phase 2 enforces it
            server-side from the real login session.
          </p>
        </Reveal>
        <div className="mt-5">
          <MatrixTable />
        </div>
      </section>

      <Reveal>
        <Link
          href="/admin/posts"
          className="group flex items-center justify-between rounded-2xl border border-line bg-white/70 px-6 py-5 transition-all duration-300 hover:border-ember/50 hover:shadow-lift"
        >
          <span>
            <span className="block font-display text-lg font-semibold text-ink">Manage posts</span>
            <span className="mt-0.5 block text-[13px] text-stone-500">
              Create, edit and publish bulletin updates — collaborator capability.
            </span>
          </span>
          <IconArrowRight size={18} className="text-stone-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ember" />
        </Link>
      </Reveal>
    </div>
  );
}
