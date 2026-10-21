"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import HeroArt, { themeFor } from "./HeroArt";
import type { Post } from "./UpdatesFeed";

const SLIDES = 5;
const EVERY_MS = 7000;

/** The night-sky hero: the latest few updates rotate through, with dots and a pause control. */
export default function FeaturedCarousel() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(Array.isArray(d.posts) ? d.posts.slice(0, SLIDES) : []))
      .catch(() => setPosts([]));
    // Respect reduced motion: no auto-advance.
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  const n = posts?.length ?? 0;
  useEffect(() => {
    if (paused || hover || n < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), EVERY_MS);
    return () => clearTimeout(t);
  }, [i, paused, hover, n]);

  if (posts !== null && n === 0) return null;
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
      {/* Each slide brings its own Canva-style gradient; they cross-fade. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={theme.bg}
          aria-hidden
          className={`absolute inset-0 -z-20 ${theme.bg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      <span aria-hidden className="animate-drift-a absolute -left-24 -top-32 -z-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <span aria-hidden className="animate-drift-b absolute -bottom-40 right-10 -z-10 h-96 w-96 rounded-full bg-black/20 blur-3xl" />

      <div className="grid min-h-[300px] items-center gap-6 px-6 py-8 sm:px-10 md:grid-cols-[1.2fr_1fr]">
        <div aria-live={paused ? "polite" : "off"} data-noreveal>
          {p ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="flex items-center gap-2 text-[12.5px] font-semibold">
                  <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">{p.category}</span>
                  <time dateTime={p.date} className="tabular text-white/75">{formatDate(p.date)}</time>
                </p>
                <h2 className="mt-3 text-[28px] font-semibold leading-[1.1] drop-shadow-sm sm:text-[36px]">{p.title}</h2>
                <p className="mt-3 line-clamp-3 max-w-[56ch] text-[15px] leading-relaxed text-white/85">{p.excerpt}</p>
                <Link
                  href={`/updates/${p.slug}`}
                  className="btn-magic mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-nil shadow-lg hover:bg-gold"
                >
                  Read more <span aria-hidden>→</span>
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

        <div className="hidden md:block" data-noreveal>
          <AnimatePresence mode="wait">{p && <HeroArt key={p.id} category={p.category} date={formatDate(p.date)} />}</AnimatePresence>
        </div>
      </div>

      {n > 1 && (
        <div className="flex items-center justify-center gap-3 pb-5">
          <button
            type="button"
            onClick={() => setPaused((x) => !x)}
            aria-label={paused ? "Play slides" : "Pause slides"}
            className="on-nil flex h-7 w-7 items-center justify-center rounded-md text-white/70 ring-1 ring-white/20 hover:text-white"
          >
            {paused ? (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
            ) : (
              <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden><path d="M0 0h3v12H0zM7 0h3v12H7z" fill="currentColor" /></svg>
            )}
          </button>
          {posts!.map((q, k) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show update ${k + 1} of ${n}`}
              aria-current={k === i}
              className={`on-nil h-2.5 rounded-full transition-all duration-300 ${
                k === i ? "w-7 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
