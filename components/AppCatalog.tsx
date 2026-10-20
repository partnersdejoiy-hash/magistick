"use client";

import { useMemo, useState } from "react";
import { AppGlyph, useApps, usePins } from "./AppLauncher";
import { IconExternal, IconPin, IconSearch } from "./icons";

/** Searchable, categorized app list with pin-to-top. */
export default function AppCatalog({ initialQuery = "" }: { initialQuery?: string }) {
  const { apps, error } = useApps();
  const { pins, toggle } = usePins();
  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set((apps ?? []).map((a) => a.category)))], [apps]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (apps ?? [])
      .filter(
        (a) =>
          (category === "All" || a.category === category) &&
          (!needle || a.name.toLowerCase().includes(needle) || a.blurb.toLowerCase().includes(needle)),
      )
      .sort((a, b) => Number(pins.includes(b.id)) - Number(pins.includes(a.id)) || a.name.localeCompare(b.name));
  }, [apps, pins, q, category]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps"
            aria-label="Search apps"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-[14px] text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none"
          />
        </div>
        <div role="tablist" aria-label="App categories" className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={`h-8 rounded-md px-3 text-[13px] font-medium transition-colors ${
                category === c ? "bg-nil text-white" : "border border-line bg-panel text-stone-600 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {apps === null ? (
        <div className="mt-6 space-y-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : error ? (
        <p className="mt-6 rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>
      ) : list.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line bg-panel px-6 py-10 text-center">
          <p className="text-[15px] font-semibold text-ink">{apps.length ? "No apps match" : "No apps yet"}</p>
          <p className="mt-1 text-[13.5px] text-stone-500">
            {apps.length ? "Try another search or category." : "Nothing is open to your level and department yet."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
          {list.map((app) => {
            const pinned = pins.includes(app.id);
            return (
              <li key={app.id} className="flex items-center gap-3 pr-3">
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5 hover:bg-ground/70"
                >
                  <AppGlyph app={app} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-ink">{app.name}</span>
                    <span className="block truncate text-[13px] text-stone-600">{app.blurb}</span>
                  </span>
                  <span className="hidden rounded-md bg-parchment px-2 py-0.5 text-[12px] text-stone-700 sm:inline">{app.category}</span>
                  <IconExternal size={15} className="shrink-0 text-stone-400" />
                </a>
                <button
                  type="button"
                  onClick={() => toggle(app.id)}
                  aria-pressed={pinned}
                  aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name} to the top`}
                  className={`rounded-md p-2 ${pinned ? "text-gold-deep" : "text-stone-300 hover:bg-ground hover:text-stone-600"}`}
                >
                  <IconPin size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
