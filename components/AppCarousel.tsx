"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { APPS, type AppEntry } from "@/lib/data";

const PIN_KEY = "magistick:pinned-apps";

export function loadPins(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PIN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function savePins(pins: string[]) {
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(pins));
  } catch {
    /* private mode */
  }
}

function CarouselTile({
  app,
  pinned,
  onTogglePin,
}: {
  app: AppEntry;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  return (
    <div className="group relative w-36 shrink-0 snap-start rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={onTogglePin}
        aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name}`}
        title={pinned ? "Unpin" : "Pin to top"}
        className={`absolute right-2 top-2 rounded p-1 text-base transition-opacity ${
          pinned ? "text-amber-500 opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100"
        } hover:text-amber-500`}
      >
        {pinned ? "★" : "☆"}
      </button>
      <a href={app.href} className="block" title={app.blurb}>
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${app.tile} text-xl font-black text-white shadow-sm`}
        >
          {app.name.charAt(0)}
        </span>
        <p className="mt-3 truncate text-sm font-semibold text-slate-900">{app.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">{app.blurb}</p>
      </a>
    </div>
  );
}

/**
 * Horizontally scrollable app-tile carousel — Glowstick's launcher pattern,
 * with left/right arrows and pin-to-top (pinned apps first).
 */
export default function AppCarousel() {
  const [pins, setPins] = useState<string[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPins(loadPins());
  }, []);

  const togglePin = (id: string) => {
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      savePins(next);
      return next;
    });
  };

  const apps = useMemo(
    () =>
      [...APPS].sort((a, b) => {
        const pa = pins.includes(a.id) ? 0 : 1;
        const pb = pins.includes(b.id) ? 0 : 1;
        return pa - pb || a.name.localeCompare(b.name);
      }),
    [pins],
  );

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth px-1 py-1"
        aria-label="App launcher carousel"
      >
        {apps.map((app) => (
          <CarouselTile
            key={app.id}
            app={app}
            pinned={pins.includes(app.id)}
            onTogglePin={() => togglePin(app.id)}
          />
        ))}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll apps left"
        className="absolute -left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition hover:text-slate-900 md:block"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll apps right"
        className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-md transition hover:text-slate-900 md:block"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
