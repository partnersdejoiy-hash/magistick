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
      <section aria-labelledby="hello" className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user ? <Avatar name={user.name} dept={user.department} size={52} /> : <span className="skeleton h-[52px] w-[52px] rounded-full" />}
          <div>
            <h1 id="hello" className="text-[24px] font-semibold tracking-tight text-ink">
              {greeting()}
              {user ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            {user && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-stone-600">
                <LevelTag level={user.level} />
                <DeptTag dept={user.department} />
                {user.title && <span>{user.title}</span>}
                {manager && (
                  <Link href={`/directory?id=${manager.id}`} className="text-stone-600 underline decoration-line hover:text-ember">
                    Reports to {manager.name}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-nil"
        >
          <IconTicket size={16} /> Raise a ticket
        </Link>
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
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel text-[13.5px]">
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
