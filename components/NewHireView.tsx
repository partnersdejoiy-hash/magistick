"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/roles";
import { DEPT_BY_ID, LEVEL_BY_ID } from "@/lib/rbac";
import { AppGlyph, useApps } from "./AppLauncher";
import { Avatar, stampBandStyle } from "./Stamp";
import { IconCheck } from "./icons";

const STEPS = [
  { id: "profile", label: "Check your name, title and department on your directory card", href: "/directory" },
  { id: "manager", label: "Find your team leader and say hello", href: "/directory" },
  { id: "pin", label: "Pin the apps you'll use every shift", href: "/apps" },
  { id: "updates", label: "Read the latest updates for your department", href: "/updates" },
  { id: "help", label: "Learn who handles what under Get Help", href: "/help" },
];

type Manager = { id: string; name: string; title: string; department: keyof typeof DEPT_BY_ID };

/** Glowstick's New Hire page, made personal: your checklist, your tools, your people. */
export default function NewHireView() {
  const { user } = useSession();
  const { apps } = useApps();
  const [done, setDone] = useState<string[]>([]);
  const [chain, setChain] = useState<Manager[]>([]);
  const key = user ? `magistick:onboarding:${user.id}` : "";

  useEffect(() => {
    if (!key) return;
    try {
      const v: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
      setDone(Array.isArray(v) ? v : []);
    } catch {
      setDone([]);
    }
    fetch("/api/directory", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setChain([...(d.chain ?? [])].reverse()))
      .catch(() => {});
  }, [key]);

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* private mode: progress just won't persist */
    }
  };

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl bg-nil text-white">
        {user && <div className="h-2.5" style={stampBandStyle(user.department)} aria-hidden />}
        <div className="px-6 py-8 sm:px-10">
          <h1 className="text-[26px] font-semibold tracking-tight">Welcome to DEJOIY{user ? `, ${user.name.split(" ")[0]}` : ""}</h1>
          <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-white/80">
            {user
              ? `You've joined ${DEPT_BY_ID[user.department].label} as ${LEVEL_BY_ID[user.level].label.split(" (")[0]}. `
              : ""}
            This page walks you through your first week: the tools you have, the people to ask, and where help lives.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section aria-labelledby="week-h" className="lg:col-span-2">
          <h2 id="week-h" className="text-[17px] font-semibold text-ink">
            Your first week{" "}
            <span className="tabular text-[13px] font-normal text-stone-500">
              {done.length}/{STEPS.length} done
            </span>
          </h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
            {STEPS.map((s) => {
              const on = done.includes(s.id);
              return (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={s.label}
                    onClick={() => toggle(s.id)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      on ? "border-ok bg-ok text-white" : "border-stone-300 bg-panel"
                    }`}
                  >
                    {on && <IconCheck size={13} />}
                  </button>
                  <span className={`flex-1 text-[14px] ${on ? "text-stone-500 line-through" : "text-ink"}`}>{s.label}</span>
                  <Link href={s.href} className="text-[13px] font-medium text-ember hover:underline">
                    Open
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="ask-h">
          <h2 id="ask-h" className="text-[17px] font-semibold text-ink">Who to ask</h2>
          {chain.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-line bg-panel px-4 py-5 text-[13.5px] text-stone-600">
              Your reporting line isn&rsquo;t set yet. HR or your admin will add your manager in Admin → People.
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {chain.slice(0, 3).map((m, i) => (
                <li key={m.id}>
                  <Link href={`/directory?id=${m.id}`} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-3 py-2.5 hover:border-ember/40">
                    <Avatar id={m.id} name={m.name} dept={m.department} size={34} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{m.name}</span>
                      <span className="block truncate text-[12.5px] text-stone-600">
                        {i === 0 ? "Your manager" : i === 1 ? "Their manager" : "Next up"} · {m.title || "—"}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <section aria-labelledby="tools-h">
        <h2 id="tools-h" className="text-[17px] font-semibold text-ink">Your tools</h2>
        <p className="mt-1 text-[13.5px] text-stone-600">Everything your level and department can open, and what each one is for.</p>
        {apps === null ? (
          <div className="mt-3 skeleton h-24" />
        ) : apps.length === 0 ? (
          <p className="mt-3 text-[13.5px] text-stone-500">No apps are open to you yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {apps.map((a) => (
              <li key={a.id} className="flex gap-3 rounded-xl border border-line bg-panel p-4">
                <AppGlyph app={a} size={38} />
                <div className="min-w-0">
                  <a href={a.href} target="_blank" rel="noopener noreferrer" className="text-[14.5px] font-semibold text-ink hover:text-ember">
                    {a.name}
                  </a>
                  <p className="text-[13px] leading-snug text-stone-600">{a.blurb || a.category}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
