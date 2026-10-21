"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { useSession } from "@/lib/roles";
import GeoToggle, { matchesGeo, type GeoView } from "./GeoToggle";
import { themeFor } from "./HeroArt";
import type { Post } from "./UpdatesFeed";

const SLIDES = 5;
const EVERY_MS = 7000;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Photo-banner hero: the latest updates for the chosen geography rotate, with dots, pause and hover-pause. */
export default function FeaturedCarousel({ view, onView }: { view: GeoView; onView: (v: GeoView) => void }) {
  const [all, setAll] = useState<Post[] | null>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setAll(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => setAll([]));
    // Respect reduced motion: no auto-advance.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  const { user } = useSession();
  const place = user?.location;
  const posts = useMemo(() => (all ? all.filter((p) => matchesGeo(view, p.region, place)).slice(0, SLIDES) : null), [all, view, place]);
  useEffect(() => setI(0), [view]);

  const n = posts?.length ?? 0;
  useEffect(() => {
    if (paused || hover || n < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), EVERY_MS);
    return () => clearTimeout(t);
  }, [i, paused, hover, n]);

  if (all !== null && all.length === 0) return null;
  const p = posts?.[i];
  const theme = themeFor(p?.category ?? "");

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured updates"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="stars relative isolate overflow-hidden rounded-3xl bg-nil text-white shadow-lift"
    >
      {/* Category colour washes in from the left behind the text. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={theme.bg}
          aria-hidden
          className={`absolute inset-y-0 left-0 -z-20 w-2/3 opacity-60 ${theme.bg} [mask-image:linear-gradient(90deg,#000_30%,transparent)]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 sm:px-8">
        <p className="text-[12px] font-bold uppercase tracking-wider text-gold">Latest from DEJOIY</p>
        <GeoToggle value={view} onChange={onView} dark />
      </div>

      {posts && n === 0 ? (
        <div className="px-6 py-14 text-center sm:px-8">
          <p className="font-display text-[24px] font-semibold">Nothing for this view yet</p>
          <p className="mt-2 text-[14px] text-white/70">There are no updates here right now. See everything instead.</p>
          <button type="button" onClick={() => onView("all")} className="mt-5 rounded-full bg-gold px-5 py-2.5 text-[13.5px] font-bold text-nil">
            Show everywhere
          </button>
        </div>
      ) : (
        <div className="grid items-center gap-6 px-6 pb-4 pt-5 sm:px-8 md:grid-cols-[1fr_1.15fr]" data-noreveal>
          <div aria-live={paused ? "polite" : "off"} className="order-2 md:order-1">
            {p ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-semibold">
                    <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">{p.category}</span>
                    <time dateTime={p.date} className="tabular text-white/75">
                      {formatDate(p.date)}
                    </time>
                  </p>
                  <h2 className="mt-3 text-[28px] font-semibold leading-[1.1] drop-shadow-sm sm:text-[36px]">{p.title}</h2>
                  <p className="mt-3 line-clamp-3 max-w-[56ch] text-[15px] leading-relaxed text-white/85">{p.excerpt}</p>
                  <Link
                    href={`/updates/${p.slug}`}
                    className="btn-magic mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[14px] font-bold text-nil shadow-lg hover:bg-[#FFD86B]"
                  >
                    Learn more <span aria-hidden>→</span>
                  </Link>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="space-y-3" aria-busy>
                <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
            )}
          </div>

          {/* The photo, framed by an offset gold block. */}
          <div className="relative order-1 md:order-2">
            <span aria-hidden className="absolute -bottom-3 -right-3 left-6 top-6 rounded-[28px] bg-gold" />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-nil-2 ring-1 ring-white/10">
              <AnimatePresence initial={false}>
                {p && (
                  <motion.img
                    key={p.id}
                    src={p.imageUrl}
                    alt=""
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </AnimatePresence>
              {p && (
                <span className="absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[12px] font-semibold backdrop-blur-sm">
                  {(p.region ?? "global") === "global" ? "🌐 Global" : `📍 ${p.region}`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {n > 1 && (
        <div className="flex items-center justify-center gap-3 pb-5 pt-2">
          <button
            type="button"
            onClick={() => setPaused((x) => !x)}
            aria-label={paused ? "Play slides" : "Pause slides"}
            className="on-nil flex h-7 w-7 items-center justify-center rounded-md text-white/70 ring-1 ring-white/20 hover:text-white"
          >
            {paused ? (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
                <path d="M0 0l10 6-10 6z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden>
                <path d="M0 0h3v12H0zM7 0h3v12H7z" fill="currentColor" />
              </svg>
            )}
          </button>
          {posts!.map((q, k) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show update ${k + 1} of ${n}`}
              aria-current={k === i}
              className={`on-nil h-2.5 rounded-full transition-all duration-300 ${k === i ? "w-7 bg-gold shadow-[0_0_10px_rgba(255,196,0,0.8)]" : "w-2.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
