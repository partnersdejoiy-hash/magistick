"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { APP_ICONS } from "./icons";
import { IconPin } from "./icons";
import { EASE, Tilt } from "./motion";
import { loadPins, savePins } from "./pins";

export type RailApp = {
  id: string;
  name: string;
  blurb: string;
  category: string;
  href: string;
  icon: string;
  color: string;
};

function iconFor(key: string) {
  return (APP_ICONS as Record<string, (p: { size?: number }) => JSX.Element>)[key] ?? APP_ICONS.globe;
}

function RailTile({
  app,
  pinned,
  onTogglePin,
}: {
  app: RailApp;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  const Icon = iconFor(app.icon);
  return (
    <Tilt className="h-full w-full" max={8}>
      <div className="group relative h-full rounded-2xl border border-line bg-white/80 p-4 shadow-card backdrop-blur transition-shadow duration-300 hover:shadow-lift">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onTogglePin();
          }}
          aria-label={pinned ? `Unpin ${app.name}` : `Pin ${app.name}`}
          aria-pressed={pinned}
          title={pinned ? "Unpin" : "Pin to top"}
          className={`absolute right-2.5 top-2.5 rounded-md p-1.5 transition-all duration-200 ${
            pinned
              ? "text-magenta opacity-100"
              : "text-stone-300 opacity-0 hover:text-magenta focus-visible:opacity-100 group-hover:opacity-100"
          }`}
        >
          <IconPin size={14} />
        </button>
        <a
          href={app.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          aria-label={`${app.name} — ${app.blurb}`}
        >
          {/* Glowstick-style tile: solid color square, white medallion, line icon in tile color */}
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3"
            style={{ backgroundColor: app.color }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ color: app.color }}>
              <Icon size={20} />
            </span>
          </span>
          <span className="mt-3 flex items-center gap-1.5">
            <span className="truncate text-[13px] font-bold tracking-tight text-ink">
              {app.name}
            </span>
            {pinned && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-magenta" aria-hidden />}
          </span>
          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-stone-500">
            {app.blurb}
          </span>
        </a>
      </div>
    </Tilt>
  );
}

/**
 * The app rail — Glowstick's launcher pattern, rebuilt with physics:
 * role-filtered from the server, 3D tilt + cursor highlight on tiles,
 * staggered entrance, smooth arrows.
 */
export default function AppRail() {
  const [pins, setPins] = useState<string[]>([]);
  const [apps, setApps] = useState<RailApp[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPins(loadPins());
    fetch("/api/apps", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { apps: [] }))
      .then((d) => setApps(Array.isArray(d.apps) ? d.apps : []))
      .catch(() => setApps([]));
  }, []);

  const togglePin = (id: string) => {
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      savePins(next);
      return next;
    });
  };

  const ordered = useMemo(
    () =>
      [...apps].sort((a, b) => {
        const pa = pins.includes(a.id) ? 0 : 1;
        const pb = pins.includes(b.id) ? 0 : 1;
        return pa - pb || a.name.localeCompare(b.name);
      }),
    [apps, pins],
  );

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  // Directional arrow visibility: only show an arrow when there is actually
  // more content in that direction. Prevents arrows overlapping edge cards.
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ordered.length]);

  const Arrow = ({
    dir,
    label,
    visible,
  }: {
    dir: 1 | -1;
    label: string;
    visible: boolean;
  }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={() => scroll(dir)}
      aria-label={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.85 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-paper/95 text-ink shadow-card backdrop-blur transition-colors hover:border-ember/40 hover:text-magenta md:flex"
      style={{
        ...(dir === 1 ? { right: 6 } : { left: 6 }),
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {dir === 1 ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
      </svg>
    </motion.button>
  );

  return (
    // md:px-12 reserves gutters so the floating arrows never overlap edge cards
    <div className="relative px-1 md:px-12">
      <motion.div
        ref={trackRef}
        className="no-scrollbar flex snap-x gap-3.5 overflow-x-auto px-1 py-2"
        aria-label="App launcher"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {ordered.map((app) => (
          <motion.div
            key={app.id}
            className="w-40 shrink-0 snap-start"
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
            }}
          >
            <RailTile app={app} pinned={pins.includes(app.id)} onTogglePin={() => togglePin(app.id)} />
          </motion.div>
        ))}
      </motion.div>
      <Arrow dir={-1} label="Scroll apps left" visible={canLeft} />
      <Arrow dir={1} label="Scroll apps right" visible={canRight} />
    </div>
  );
}
