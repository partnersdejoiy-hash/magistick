"use client";

import { useEffect, useMemo, useState } from "react";
import { APPS, APP_CATEGORIES, type AppEntry } from "@/lib/data";
import { loadPins, savePins } from "./AppCarousel";

function AppTile({ app, pinned, onTogglePin }: { app: AppEntry; pinned: boolean; onTogglePin: () => void }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
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
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${app.tile} text-lg font-black text-white shadow-sm`}>
          {app.name.charAt(0)}
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-900">{app.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{app.blurb}</p>
      </a>
    </div>
  );
}

/**
 * App directory grid: pinned apps first, category filter, live search.
 * (Glowstick had a flat carousel with no pinning, recents, or search.)
 */
export default function AppLauncher({ initialQuery = "" }: { initialQuery?: string }) {
  const [pins, setPins] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState(initialQuery);

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

  const apps = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = APPS.filter(
      (a) =>
        (category === "All" || a.category === category) &&
        (!q || a.name.toLowerCase().includes(q) || a.blurb.toLowerCase().includes(q)),
    );
    return [...filtered].sort((a, b) => {
      const pa = pins.includes(a.id) ? 0 : 1;
      const pb = pins.includes(b.id) ? 0 : 1;
      return pa - pb || a.name.localeCompare(b.name);
    });
  }, [pins, category, query]);

  return (
    <section aria-label="App launcher">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps…"
          aria-label="Search apps"
          className="w-56 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="App categories">
          {APP_CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                category === c
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-slate-300 bg-white text-slate-600 hover:text-slate-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {apps.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No apps match “{query}”. Try a different search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {apps.map((app) => (
            <AppTile key={app.id} app={app} pinned={pins.includes(app.id)} onTogglePin={() => togglePin(app.id)} />
          ))}
        </div>
      )}
      {pins.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">★ {pins.length} pinned — pinned apps always appear first.</p>
      )}
    </section>
  );
}
