"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/roles";
import type { DeptId, LevelId } from "@/lib/rbac";
import AppRail from "./AppRail";
import FeaturedCarousel from "./FeaturedCarousel";
import PolicyHighlights from "./PolicyHighlights";
import MoreFromUs from "./MoreFromUs";
import { useGeoView } from "./GeoToggle";
import UpdatesFeed from "./UpdatesFeed";
import { Avatar, DeptTag, LevelTag } from "./Stamp";
import { IconArrowRight, IconTicket } from "./icons";

type Card = { id: string; name: string; title: string; level: LevelId; department: DeptId; reports: number };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function HomeView() {
  const { user } = useSession();
  const [manager, setManager] = useState<Card | null>(null);
  const [geo, setGeo] = useGeoView();

  useEffect(() => {
    if (!user) return;
    fetch("/api/directory", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setManager(d.chain?.length ? d.chain[d.chain.length - 1] : null);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-8">
      <section aria-labelledby="hello" className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {user ? (
            <span className="rounded-full p-1 shadow-[0_0_22px_2px_rgba(255,196,0,0.45)] ring-2 ring-gold">
              <Avatar id={user.id} v={user.photo_at} name={user.name} dept={user.department} size={52} />
            </span>
          ) : (
            <span className="skeleton h-[60px] w-[60px] rounded-full" />
          )}
          <div>
            <h1 id="hello" className="text-[26px] font-semibold leading-tight text-ink sm:text-[30px]">
              {greeting()}
              {user && (
                <>
                  ,{" "}
                  <span className="bg-[linear-gradient(transparent_62%,rgba(255,196,0,0.6)_62%)] px-0.5">{user.name.split(" ")[0]}</span>
                </>
              )}
            </h1>
            {user && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-stone-600">
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
          className="btn-magic inline-flex items-center gap-2 rounded-xl bg-nil px-5 py-3 text-[14px] font-semibold text-white ring-1 ring-gold/60"
        >
          <IconTicket size={16} className="text-gold" /> Raise a ticket
        </Link>
      </section>

      <section aria-labelledby="apps-h">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 id="apps-h" className="text-[17px] font-semibold text-ink">Your apps</h2>
          <Link href="/apps" className="flex items-center gap-1 text-[13px] font-medium text-ember hover:underline">
            All apps <IconArrowRight size={14} />
          </Link>
        </div>
        <AppRail />
      </section>

      <FeaturedCarousel view={geo} onView={setGeo} />

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="upd-h" className="min-w-0">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="upd-h" className="text-[17px] font-semibold text-ink">
              Latest updates
            </h2>
            <Link href="/updates" className="flex items-center gap-1 text-[13px] font-medium text-ember hover:underline">
              All updates <IconArrowRight size={14} />
            </Link>
          </div>
          <UpdatesFeed limit={6} geo={geo} />
        </section>

        <MoreFromUs geo={geo} />
      </div>

      <PolicyHighlights />
    </div>
  );
}
