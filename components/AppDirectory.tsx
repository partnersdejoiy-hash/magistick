"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { APPS, APP_CATEGORIES, tintFor, type AppEntry } from "@/lib/data";
import { APP_ICONS, IconArrowRight, IconPin, IconSearch } from "./icons";
import { EASE } from "./motion";
import { loadPins, savePins } from "./pins";

function DirectoryRow({
  app,
  pinned,
  onTogglePin,
}: {
  app: AppEntry;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  const Icon = APP_ICONS[app.icon];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="group relative"
    >
      <a
        href={app.href}
        className="flex items-center gap-4 border-b border-line px-2 py-4 transition-colors duration-200 hover:bg-parchment/60 sm:px-4"
        aria-label={`${app.name} — ${app.blurb}`}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tintFor(app.category)} transition-transform duration-300 group-hover:scale-105`}>
          <Icon size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold tracking-tight text-ink">{app.name}</span>
            {pinned && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember" aria-label="Pinned" />}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-stone-500">{app.blurb}</span>
        </span>
        <span className="hidden shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] font-medium text-stone-500 sm:block">
          {app.category}
        </span>
        <span
          role="button"
          tabIndex={0}
          aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name}`}
          aria-pressed={pinned}
          title={pinned ? "Unpin" : "Pin to top"}
          onClick={(e) => {
            e.preventDefault();
            onTogglePin();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onTogglePin();
            }
          }}
          className={`shrink-0 rounded-lg p-2 transition-colors ${
            pinned ? "text-ember" : "text-stone-300 hover:bg-parchment hover:text-ember"
          }`}
        >
          <IconPin size={16} />
        </span>
        <IconArrowRight
          size={16}
          className="shrink-0 text-stone-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ember"
        />
      </a>
    </motion.li>
  );
}

/**
 * App directory — editorial index rows instead of a card grid:
 * hairline dividers, refined search, category pills, pin-to-top.
 */
export default function AppDirectory({ initialQuery = "" }: { initialQuery?: string }) {
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
    <section aria-label="App directory">
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <IconSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            aria-label="Search apps"
            className="w-full rounded-2xl border border-line bg-white py-3 pl-11 pr-4 text-[14px] text-ink shadow-card placeholder:text-stone-400 focus:border-ember/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="App categories">
          {APP_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c)}
                className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
                  active ? "text-paper" : "border border-line bg-white text-stone-500 hover:border-stone-300 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="app-cat-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 p-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">No apps match “{query}”</p>
          <p className="mt-1 text-sm text-stone-500">Try a different search, or browse a category above.</p>
        </div>
      ) : (
        <motion.ul layout className="mt-6 border-t border-line">
          {apps.map((app) => (
            <DirectoryRow key={app.id} app={app} pinned={pins.includes(app.id)} onTogglePin={() => togglePin(app.id)} />
          ))}
        </motion.ul>
      )}

      {pins.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-500">
          <IconPin size={12} className="text-ember" />
          {pins.length} pinned — pinned apps always appear first.
        </p>
      )}
    </section>
  );
}
