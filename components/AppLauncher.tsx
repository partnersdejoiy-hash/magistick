"use client";

import { useEffect, useMemo, useState } from "react";
import { IconPin } from "./icons";
import { loadPins, savePins } from "./pins";

export type LauncherApp = {
  id: string;
  name: string;
  blurb: string;
  category: string;
  href: string;
  icon: string;
  logo?: string;
  color: string;
};


/** Fetches the apps this person's level + department may open. */
export function useApps() {
  const [apps, setApps] = useState<LauncherApp[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/apps", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Couldn't load apps.");
        setApps(Array.isArray(d.apps) ? d.apps : []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Couldn't load apps.");
        setApps([]);
      });
  }, []);
  return { apps, error };
}

export function usePins() {
  const [pins, setPins] = useState<string[]>([]);
  useEffect(() => setPins(loadPins()), []);
  const toggle = (id: string) =>
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      savePins(next);
      return next;
    });
  return { pins, toggle };
}

/** The app's own logo; if it has none (or it fails to load), its initial on the app colour. */
export function AppGlyph({ app, size = 44 }: { app: LauncherApp; size?: number }) {
  const [broken, setBroken] = useState(false);
  const box = { width: size, height: size };
  if (app.logo && !broken) {
    return (
      <span className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white" style={box} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- external app logos, any host */}
        <img
          src={app.logo}
          alt=""
          className="h-full w-full object-contain p-[12%]"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      </span>
    );
  }
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl font-display font-semibold text-white"
      style={{ ...box, backgroundColor: app.color, fontSize: Math.round(size * 0.46) }}
      aria-hidden
    >
      {app.name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** Launcher grid: pinned first, then catalog order. One move to open any app. */
export default function AppLauncher({ limit }: { limit?: number }) {
  const { apps, error } = useApps();
  const { pins, toggle } = usePins();
  const sorted = useMemo(
    () =>
      apps
        ? [...apps].sort((a, b) => Number(pins.includes(b.id)) - Number(pins.includes(a.id)))
        : null,
    [apps, pins],
  );

  if (sorted === null) {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" aria-busy>
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="skeleton h-[76px]" />
        ))}
      </ul>
    );
  }
  if (error) return <p className="rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>;
  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-panel px-4 py-6 text-[13.5px] text-stone-500">
        No apps are open to your level and department yet. Your admin adds them under Admin → App access.
      </p>
    );
  }
  const shown = limit ? sorted.slice(0, limit) : sorted;
  return (
    <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
      {shown.map((app) => {
        const pinned = pins.includes(app.id);
        return (
          <li key={app.id} className="group relative">
            <a
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-card flex h-full items-center gap-3 rounded-xl border border-line bg-panel p-3.5 pr-10"
            >
              <span className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <AppGlyph app={app} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-ink">{app.name}</span>
                <span className="block truncate text-[12.5px] text-stone-500">{app.blurb || app.category}</span>
              </span>
            </a>
            <button
              type="button"
              onClick={() => toggle(app.id)}
              aria-pressed={pinned}
              aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name} to the top`}
              className={`absolute right-2 top-2 rounded-md p-1.5 transition-colors ${
                pinned ? "text-gold-deep" : "text-stone-300 hover:bg-ground hover:text-stone-600"
              }`}
            >
              <IconPin size={15} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
