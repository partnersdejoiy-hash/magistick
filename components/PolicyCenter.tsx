"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PHOTOS, photoUrl, type PhotoKey } from "@/lib/photos";
import { POLICIES, type Policy } from "@/lib/policies";
import { IconArrowRight, IconSearch } from "./icons";

const GROUPS = ["All", "People", "Workplace", "Security"] as const;

function PolicyCard({ p }: { p: Policy }) {
  return (
    <Link href={`/policies/${p.slug}`} className="glow-card group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-panel">
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
        <img
          src={photoUrl(p.photo, 800)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 35%, ${p.accent}E6)` }} />
        <span className="absolute left-3 top-3 rounded-md bg-gold px-2 py-0.5 text-[11.5px] font-bold text-nil">{p.status}</span>
        <span className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-[11.5px] font-medium text-white backdrop-blur-sm">
          {p.slides.length} slides
        </span>
        <p className="absolute bottom-3 left-4 right-4 text-[12.5px] font-semibold text-white/90">{p.kicker}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: p.accent }}>
          {p.group}
        </p>
        <h2 className="mt-1 text-[19px] font-semibold leading-snug text-ink">{p.title}</h2>
        <p className="mt-2 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-stone-600">{p.summary}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ember">
          Open deck <IconArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

/** The Policy Center: a photo hero, search + group filter, and a card per policy deck. */
export default function PolicyCenter() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return POLICIES.filter(
      (p) =>
        (group === "All" || p.group === group) &&
        (!needle || `${p.title} ${p.kicker} ${p.summary}`.toLowerCase().includes(needle)),
    );
  }, [q, group]);

  const credits = Array.from(new Map(Object.values(PHOTOS).filter((x) => x.by).map((x) => [x.by, x.page])).entries());

  return (
    <div className="space-y-8">
      <section aria-labelledby="pc-title" className="relative isolate overflow-hidden rounded-3xl text-white shadow-lift">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
        <img src={photoUrl("hero" as PhotoKey, 1800)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-nil via-nil/85 to-nil/20" />
        <div className="stars absolute inset-0 -z-10" />
        <div className="max-w-2xl px-7 py-12 sm:px-12 sm:py-16">
          <p className="w-fit rounded-full bg-gold px-3 py-1 text-[12.5px] font-bold text-nil">DEJOIY Policy Center</p>
          <h1 id="pc-title" className="mt-4 text-[34px] font-semibold leading-[1.05] sm:text-[48px]">
            How we work, <span className="text-gold">in plain words</span>
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-white/85">
            Every DEJOIY policy as a short, visual deck. Read it in two minutes, present it in a huddle, and know exactly where to go when you need help.
          </p>
        </div>
      </section>

      <p role="note" className="rounded-2xl border border-gold/60 bg-gold-tint px-4 py-3 text-[13.5px] text-gold-ink">
        <strong className="font-semibold">Drafts:</strong> these policies are awaiting HR and legal review. Leave days, limits and timelines are proposals until
        each one is marked Published.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Policy groups" className="inline-flex rounded-xl border border-line bg-panel p-1">
          {GROUPS.map((g) => (
            <button
              key={g}
              role="tab"
              aria-selected={group === g}
              onClick={() => setGroup(g)}
              className={`rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-colors ${group === g ? "bg-nil text-white" : "text-stone-600 hover:text-ink"}`}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">Search policies</span>
          <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search policies"
            className="h-10 w-64 rounded-xl border border-line bg-panel pl-9 pr-3 text-[13.5px] text-ink placeholder:text-stone-400 focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-panel px-6 py-10 text-center text-[14px] text-stone-500">
          No policy matches “{q}”. Try another word, or ask HR through Get Help.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <PolicyCard p={p} />
            </li>
          ))}
        </ul>
      )}

      {credits.length > 0 && (
        <p className="text-[12px] text-stone-500">
          Photos from Unsplash by{" "}
          {credits.map(([by, page], n) => (
            <span key={by}>
              <a href={page} target="_blank" rel="noopener noreferrer" className="underline decoration-line hover:text-ember">
                {by}
              </a>
              {n < credits.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
