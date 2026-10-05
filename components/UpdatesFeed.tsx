"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Article } from "@/lib/data";

const CATEGORY_GRADIENTS: Record<string, string> = {
  Announcements: "from-violet-500 to-fuchsia-500",
  "IT & Tools": "from-sky-500 to-blue-600",
  Workforce: "from-amber-500 to-orange-500",
};

function gradientFor(category: string) {
  return CATEGORY_GRADIENTS[category] ?? "from-slate-400 to-slate-600";
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/updates/${article.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`flex h-28 items-end bg-gradient-to-br ${gradientFor(article.category)} p-4`}>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-slate-500">{article.date}</p>
        <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-violet-700">{article.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{article.excerpt}</p>
        <p className="mt-3 text-xs text-slate-500">By {article.author}</p>
      </div>
    </Link>
  );
}

/**
 * Updates feed — Glowstick's "Ridiculously Good Updates" pattern:
 * category filter + View-More paging, as light article cards.
 */
export default function UpdatesFeed({
  articles,
  initialVisible = 5,
  step = 5,
}: {
  articles: Article[];
  initialVisible?: number;
  step?: number;
}) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles],
  );
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(initialVisible);

  const filtered =
    category === "All" ? articles : articles.filter((a) => a.category === category);
  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="mb-4">
        <label className="sr-only" htmlFor="update-category">
          Filter updates by category
        </label>
        <select
          id="update-category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setVisible(initialVisible);
          }}
          className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-violet-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </select>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No updates in this category yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + step)}
            className="rounded-xl border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-400 hover:text-violet-700"
          >
            View More Items
          </button>
        </div>
      )}
    </div>
  );
}
