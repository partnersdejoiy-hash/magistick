"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Article } from "@/lib/data";
import { IconArrowRight } from "./icons";
import { EASE, Reveal } from "./motion";

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <Reveal>
      <Link href={`/updates/${article.slug}`} className="group block border-y border-ink/80 py-8">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium uppercase tracking-[0.14em]">
          <span className="rounded-full bg-ember-tint px-3 py-1 text-ember-ink">{article.category}</span>
          <span className="text-stone-500">{formatDate(article.date)}</span>
        </div>
        <h3 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-[1.12] tracking-tight text-ink transition-colors duration-300 group-hover:text-brandblue sm:text-4xl">
          {article.title}
        </h3>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">{article.excerpt}</p>
        <p className="mt-4 text-[13px] text-stone-500">
          By <span className="font-medium text-ink">{article.author}</span>
        </p>
      </Link>
    </Reveal>
  );
}

function IndexRow({ article, index }: { article: Article; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 6) * 0.05, ease: EASE }}
    >
      <Link
        href={`/updates/${article.slug}`}
        className="group flex items-baseline gap-4 border-b border-line py-5 transition-colors duration-200 hover:bg-parchment/50 sm:gap-6 sm:px-2"
      >
        <span className="hidden w-24 shrink-0 text-[12px] tabular-nums text-stone-400 sm:block">
          {formatDate(article.date)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-magenta">
            {article.category}
          </span>
          <span className="mt-1 block font-display text-[19px] font-medium leading-snug tracking-tight text-ink">
            {article.title}
          </span>
          <span className="mt-1 block text-[13px] text-stone-500 sm:hidden">{formatDate(article.date)}</span>
        </span>
        <IconArrowRight
          size={18}
          className="shrink-0 self-center text-stone-300 transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-magenta"
        />
      </Link>
    </motion.li>
  );
}

/**
 * Updates as an editorial index — one featured story, then hairline rows.
 * Category filter + View More preserved from the Glowstick pattern.
 * Reads the live post store so collaborator edits appear instantly.
 */
export default function UpdatesIndex({
  initialVisible = 6,
  step = 4,
}: {
  initialVisible?: number;
  step?: number;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setArticles(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => setArticles([]));
  }, []);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles],
  );
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(initialVisible);

  const filtered =
    category === "All" ? articles : articles.filter((a) => a.category === category);
  const [featured, ...rest] = filtered.slice(0, visible);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-6 gap-y-2" role="tablist" aria-label="Filter updates by category">
        {categories.map((c) => {
          const active = category === c;
          const count = c === "All" ? articles.length : articles.filter((a) => a.category === c).length;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setCategory(c);
                setVisible(initialVisible);
              }}
              className={`relative pb-2 text-[13px] font-medium tracking-wide transition-colors ${
                active ? "text-ink" : "text-stone-400 hover:text-ink"
              }`}
            >
              {c === "All" ? "All" : c}
              <span className="ml-1.5 text-[11px] tabular-nums text-stone-400">{count}</span>
              {active && (
                <motion.span
                  layoutId="updates-cat-underline"
                  className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-magenta"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {!featured ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 p-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">Nothing here yet</p>
          <p className="mt-1 text-sm text-stone-500">No updates in this category — check back soon.</p>
        </div>
      ) : (
        <div className="mt-4">
          <FeaturedArticle article={featured} />
          <ul>
            {rest.map((a, i) => (
              <IndexRow key={a.slug} article={a} index={i} />
            ))}
          </ul>
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisible((v) => v + step)}
            className="rounded-full border border-ink/20 px-7 py-2.5 text-[13px] font-semibold text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-paper"
          >
            View more updates
          </button>
        </div>
      )}
    </div>
  );
}
