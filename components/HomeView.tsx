"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/roles";
import type { DeptId, LevelId } from "@/lib/rbac";
import AppLauncher from "./AppLauncher";
import UpdatesFeed from "./UpdatesFeed";
import { Avatar, DeptTag, LevelTag } from "./Stamp";
import { IconArrowRight, IconExternal, IconTicket, IconPeople, IconBook } from "./icons";
import { IT_HELPDESK_URL } from "@/lib/data";

type Card = { id: string; name: string; title: string; level: LevelId; department: DeptId; reports: number };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function HomeView() {
  const { user, can } = useSession();
  const [manager, setManager] = useState<Card | null>(null);
  const [reports, setReports] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/directory", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setManager(d.chain?.length ? d.chain[d.chain.length - 1] : null);
        setReports(d.person?.reports ?? 0);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-10">
      <section
        aria-labelledby="hello"
        className="stars relative isolate overflow-hidden rounded-3xl bg-nil px-5 py-8 text-white shadow-lift sm:px-8 sm:py-10"
      >
        {/* Aurora: two slow-drifting glows behind the greeting. */}
        <span aria-hidden className="animate-drift-a absolute -left-24 -top-32 -z-10 h-80 w-80 rounded-full bg-gold/30 blur-3xl" />
        <span aria-hidden className="animate-drift-b absolute -bottom-40 right-0 -z-10 h-96 w-96 rounded-full bg-nil-4/70 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user ? (
              <span className="rounded-full p-1 shadow-[0_0_24px_2px_rgba(255,196,0,0.35)] ring-1 ring-gold/50">
                <Avatar name={user.name} dept={user.department} size={56} />
              </span>
            ) : (
              <span className="h-[64px] w-[64px] animate-pulse rounded-full bg-white/10" />
            )}
            <div>
              <h1 id="hello" className="text-[28px] font-semibold leading-tight sm:text-[34px]">
                {greeting()}
                {user ? (
                  <>
                    , <span className="bg-gradient-to-r from-gold via-[#FFD86B] to-[#FFF1C2] bg-clip-text text-transparent">{user.name.split(" ")[0]}</span>
                  </>
                ) : (
                  ""
                )}
              </h1>
              {user && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[13px] text-white/75">
                  <LevelTag level={user.level} />
                  <span className="rounded-md bg-white">
                    <DeptTag dept={user.department} />
                  </span>
                  {user.title && <span>{user.title}</span>}
                  {manager && (
                    <Link href={`/directory?id=${manager.id}`} className="text-white/75 underline decoration-white/30 hover:text-gold">
                      Reports to {manager.name}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
          <Link
            href="/help"
            className="btn-magic inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-3 text-[14px] font-semibold text-nil hover:bg-[#FFD86B]"
          >
            <IconTicket size={16} /> Raise a ticket
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section aria-labelledby="apps-h" className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="apps-h" className="text-[17px] font-semibold text-ink">Your apps</h2>
            <Link href="/apps" className="flex items-center gap-1 text-[13px] font-medium text-ember hover:underline">
              All apps <IconArrowRight size={14} />
            </Link>
          </div>
          <AppLauncher limit={8} />
        </section>

        <aside aria-label="Shortcuts" className="space-y-3">
          <h2 className="text-[17px] font-semibold text-ink">Need something?</h2>
          <ul className="glow-card glow-flat divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel text-[13.5px]">
            <li>
              <Link href="/help" className="flex items-center gap-3 px-4 py-3 hover:bg-ground">
                <IconTicket size={17} className="text-stone-500" />
                <span className="flex-1">
                  <span className="block font-medium text-ink">General ticket</span>
                  <span className="text-[12.5px] text-stone-500">HR, payroll, WFM, facilities, this portal</span>
                </span>
              </Link>
            </li>
            <li>
              <a href={IT_HELPDESK_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-ground">
                <IconExternal size={17} className="text-stone-500" />
                <span className="flex-1">
                  <span className="block font-medium text-ink">IT ticket</span>
                  <span className="text-[12.5px] text-stone-500">Laptop, network, access, passwords</span>
                </span>
              </a>
            </li>
            <li>
              <Link href="/directory" className="flex items-center gap-3 px-4 py-3 hover:bg-ground">
                <IconPeople size={17} className="text-stone-500" />
                <span className="flex-1">
                  <span className="block font-medium text-ink">{can("view_team") ? "My team" : "My reporting line"}</span>
                  <span className="text-[12.5px] text-stone-500">
                    {reports ? `${reports} direct report${reports === 1 ? "" : "s"}` : "Your manager and their chain"}
                  </span>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/new-hire" className="flex items-center gap-3 px-4 py-3 hover:bg-ground">
                <IconBook size={17} className="text-stone-500" />
                <span className="flex-1">
                  <span className="block font-medium text-ink">New hire guide</span>
                  <span className="text-[12.5px] text-stone-500">Every tool explained, first-week checklist</span>
                </span>
              </Link>
            </li>
          </ul>
        </aside>
      </div>

      <section aria-labelledby="upd-h">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="upd-h" className="text-[17px] font-semibold text-ink">Latest updates</h2>
          <Link href="/updates" className="flex items-center gap-1 text-[13px] font-medium text-ember hover:underline">
            All updates <IconArrowRight size={14} />
          </Link>
        </div>
        <UpdatesFeed limit={5} />
      </section>
    </div>
  );
}
