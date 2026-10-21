"use client";

import { useMemo, useRef } from "react";
import { AppGlyph, useApps, usePins } from "./AppLauncher";
import { IconChevronDown } from "./icons";

/** One-row strip of every app this person can open, pinned first. Arrows scroll a page at a time. */
export default function AppRail() {
  const { apps, error } = useApps();
  const { pins } = usePins();
  const ref = useRef<HTMLUListElement>(null);
  const sorted = useMemo(
    () => (apps ? [...apps].sort((a, b) => Number(pins.includes(b.id)) - Number(pins.includes(a.id))) : null),
    [apps, pins],
  );
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  if (error) return <p className="rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>;
  if (sorted && sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-panel px-4 py-5 text-[13.5px] text-stone-500">
        No apps are open to your level and department yet. Your admin adds them under Admin → App access.
      </p>
    );
  }

  const arrow = "absolute top-1/2 z-[1] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-panel text-ink shadow-lift ring-1 ring-line transition hover:ring-gold sm:flex";
  return (
    <div className="relative">
      <button type="button" onClick={() => scroll(-1)} aria-label="Scroll apps left" className={`${arrow} -left-3`}>
        <IconChevronDown size={16} className="rotate-90" />
      </button>
      <ul ref={ref} className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-1 py-2" aria-busy={!sorted}>
        {sorted === null
          ? Array.from({ length: 8 }).map((_, i) => <li key={i} className="skeleton h-[96px] w-[92px] shrink-0" />)
          : sorted.map((app) => (
              <li key={app.id} className="snap-start">
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={app.blurb || app.name}
                  className="glow-card group flex h-[96px] w-[92px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-panel px-2 text-center"
                >
                  <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <AppGlyph app={app} size={44} />
                  </span>
                  <span className="line-clamp-2 text-[11.5px] font-medium leading-tight text-ink">{app.name}</span>
                </a>
              </li>
            ))}
      </ul>
      <button type="button" onClick={() => scroll(1)} aria-label="Scroll apps right" className={`${arrow} -right-3`}>
        <IconChevronDown size={16} className="-rotate-90" />
      </button>
    </div>
  );
}
