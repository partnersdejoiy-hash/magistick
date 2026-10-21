"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/roles";
import { DEPT_BY_ID, isDept } from "@/lib/rbac";
import { DeptTag } from "./Stamp";
import { formatDate } from "@/lib/format";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  audience: string;
};


type Scope = "all" | "dept" | "company";

/**
 * Updates feed. The server already limits posts to company-wide + the reader's
 * department; the scope tabs let them narrow to either (Glowstick's geo toggle,
 * done for departments).
 */
export default function UpdatesFeed({ limit, showFilters = true }: { limit?: number; showFilters?: boolean }) {
  const { user } = useSession();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [category, setCategory] = useState("All");
  const [visible, setVisible] = useState(limit ?? 8);

  useEffect(() => {
    fetch("/api/posts", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Couldn't load updates.");
        setPosts(Array.isArray(d.posts) ? d.posts : []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Couldn't load updates.");
        setPosts([]);
      });
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set((posts ?? []).map((p) => p.category)))], [posts]);
  const filtered = (posts ?? []).filter(
    (p) =>
      (scope === "all" || (scope === "dept" ? p.audience !== "all" : p.audience === "all")) &&
      (category === "All" || p.category === category),
  );
  const shown = filtered.slice(0, visible);
  const deptLabel = user ? DEPT_BY_ID[user.department].label : "My department";

  return (
    <div>
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Whose updates" className="inline-flex rounded-lg border border-line bg-panel p-0.5">
            {(
              [
                ["all", "For me"],
                ["dept", deptLabel],
                ["company", "Company-wide"],
              ] as [Scope, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={scope === id}
                onClick={() => {
                  setScope(id);
                  setVisible(limit ?? 8);
                }}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  scope === id ? "bg-nil text-white" : "text-stone-600 hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[13px] text-stone-600">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-8 rounded-md border border-line bg-panel px-2 text-[13px] text-ink focus:border-ember focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {posts === null ? (
        <div className="space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-panel px-6 py-10 text-center">
          <p className="text-[15px] font-semibold text-ink">Nothing here yet</p>
          <p className="mt-1 text-[13.5px] text-stone-500">
            {scope === "dept"
              ? `No updates for ${deptLabel} so far. Department heads can post them from Admin → Updates.`
              : "No updates match this filter."}
          </p>
        </div>
      ) : (
        <ul className="glow-card glow-flat divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
          {shown.map((p, i) => (
            <li key={p.id}>
              <Link href={`/updates/${p.slug}`} className="group block px-5 py-4 transition-colors hover:bg-ground/70">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-stone-500">
                  <span className="font-medium text-stone-700">{p.category}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={p.date} className="tabular">{formatDate(p.date)}</time>
                  {isDept(p.audience) && <DeptTag dept={p.audience} className="ml-auto" />}
                </div>
                <p
                  className={`mt-1.5 font-semibold text-ink group-hover:text-ember ${
                    i === 0 && !limit ? "text-[19px] leading-snug" : "text-[15.5px] leading-snug"
                  }`}
                >
                  {p.title}
                </p>
                {(i === 0 || !limit) && (
                  <p className="mt-1 line-clamp-2 max-w-[70ch] text-[13.5px] leading-relaxed text-stone-600">{p.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!limit && posts && visible < filtered.length && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setVisible((v) => v + 8)}
            className="rounded-lg border border-line bg-panel px-4 py-2 text-[13px] font-medium text-ink hover:border-ember/40"
          >
            Show more updates
          </button>
        </div>
      )}
    </div>
  );
}
