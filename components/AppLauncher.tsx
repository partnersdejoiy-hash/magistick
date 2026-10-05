"use client";

import { useEffect, useMemo, useState } from "react";
import { APPS, APP_CATEGORIES, type AppEntry } from "@/lib/data";

const PIN_KEY = "magistick:pinned-apps";

function loadPins(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PIN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function AppTile({ app, pinned, onTogglePin }: { app: AppEntry; pinned: boolean; onTogglePin: () => void }) {
  return (
    <div className="group relative rounded-xl border border-line bg-panel p-4 transition-colors hover:border-brand-500/60">
      <button
        onClick={onTogglePin}
        aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name}`}
        title={pinned ? "Unpin" : "Pin to top"}
        className={`absolute right-2 top-2 rounded p-1 text-sm transition-opacity ${
          pinned ? "text-amber-400 opacity-100" : "text-slate-600 opacity-0 group-hover:opacity-100"
        } hover:text-amber-300`}
      >
        {pinned ? "★" : "☆"}
      </button>
      <a href={app.href} className="block" title={app.blurb}>
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${app.tile} text-lg font-black text-white`}>
          {app.name.charAt(0)}
        </span>
        <p className="mt-3 text-sm font-semibold text-slate-100">{app.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{app.blurb}</p>
      </a>
    </div>
  );
}

/**
 * App launcher grid: pinned apps first, category filter, live search.
 * (Glowstick had a flat carousel with no pinning, recents, or search.)
 */
export default function AppLauncher({ initialQuery = "", compact = false }: { initialQuery?: string; compact?: boolean }) {
  const [pins, setPins] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setPins(loadPins());
  }, []);

  const togglePin = (id: string) => {
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      try {
        localStorage.setItem(PIN_KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
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
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            aria-label="Search apps"
            className="w-56 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="App categories">
            {APP_CATEGORIES.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  category === c ? "bg-brand-600 text-white" : "border border-line text-slate-400 hover:text-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {apps.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-slate-500">
          No apps match “{query}”. Try a different search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {apps.map((app) => (
            <AppTile key={app.id} app={app} pinned={pins.includes(app.id)} onTogglePin={() => togglePin(app.id)} />
          ))}
        </div>
      )}
      {!compact && pins.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">★ {pins.length} pinned — pinned apps always appear first.</p>
      )}
    </section>
  );
}
