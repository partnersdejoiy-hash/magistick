"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured updates"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="stars relative isolate overflow-hidden rounded-3xl bg-nil text-white shadow-lift"
    >
      <span aria-hidden className="animate-drift-a absolute -left-24 -top-32 -z-10 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
      <span aria-hidden className="animate-drift-b absolute -bottom-40 right-10 -z-10 h-96 w-96 rounded-full bg-magenta/20 blur-3xl" />

      <div className="grid min-h-[260px] items-center gap-6 px-6 py-8 sm:px-10 md:grid-cols-[1.4fr_1fr]">
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
                <p className="flex items-center gap-2 text-[12.5px] font-medium text-gold">
                  <span>{p.category}</span>
                  <span aria-hidden className="text-white/40">·</span>
                  <time dateTime={p.date} className="tabular text-white/60">{formatDate(p.date)}</time>
                </p>
                <h2 className="mt-2 text-[26px] font-semibold leading-tight sm:text-[32px]">{p.title}</h2>
                <p className="mt-3 line-clamp-3 max-w-[60ch] text-[14.5px] leading-relaxed text-white/75">{p.excerpt}</p>
                <Link
                  href={`/updates/${p.slug}`}
                  className="btn-magic mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[13.5px] font-semibold text-nil hover:bg-[#FFD86B]"
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

        {/* The wand's star, glowing on the right. */}
        <div aria-hidden className="relative hidden h-full min-h-[200px] items-center justify-center md:flex">
          <span className="absolute h-44 w-44 rounded-full bg-gold/30 blur-3xl" />
          <svg viewBox="0 0 16 16" className="relative h-32 w-32 animate-[twinkle_4s_ease-in-out_infinite] text-gold drop-shadow-[0_0_24px_rgba(255,196,0,0.7)] motion-reduce:animate-none">
            <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill="currentColor" />
          </svg>
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
                k === i ? "w-7 bg-gold shadow-[0_0_10px_rgba(255,196,0,0.8)]" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
