"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DeptId, LevelId } from "@/lib/rbac";
import { AppGlyph, useApps } from "./AppLauncher";
import { Avatar } from "./Stamp";
import type { Post } from "./UpdatesFeed";
import { formatDate } from "@/lib/format";

type Person = { id: string; name: string; title: string; level: LevelId; department: DeptId };

/** One search across apps, people and updates, each limited to what the reader may see. */
export default function SearchView() {
  const q = (useSearchParams().get("q") ?? "").trim();
  const needle = q.toLowerCase();
  const { apps } = useApps();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (!q) return;
    setPeople(null);
    fetch(`/api/directory?q=${encodeURIComponent(q)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((d) => setPeople(d.results ?? []))
      .catch(() => setPeople([]));
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]));
  }, [q]);

  const appHits = (apps ?? []).filter((a) => `${a.name} ${a.blurb} ${a.category}`.toLowerCase().includes(needle));
  const postHits = (posts ?? []).filter((p) => `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(needle));

  const block = (title: string, loading: boolean, count: number, body: React.ReactNode) => (
    <section className="mt-8">
      <h2 className="mb-3 text-[15px] font-semibold text-ink">
        {title} <span className="tabular font-normal text-stone-500">{loading ? "" : `(${count})`}</span>
      </h2>
      {loading ? <div className="skeleton h-16" /> : count === 0 ? <p className="text-[13.5px] text-stone-500">No matches.</p> : body}
    </section>
  );

  const box = (
    <form role="search" action="/search" className="mb-6">
      <input
        key={q}
        name="q"
        defaultValue={q}
        autoFocus={!q}
        placeholder="Search apps, people, updates"
        aria-label="Search apps, people and updates"
        className="h-11 w-full rounded-xl border border-line bg-panel px-4 text-[14px] text-ink placeholder:text-stone-400 focus:border-gold focus:outline-none"
      />
    </form>
  );

  if (!q) return <div className="mx-auto max-w-4xl">{box}</div>;

  return (
    <div className="mx-auto max-w-4xl">
      {box}
      <h1 className="text-[22px] font-semibold tracking-tight text-ink">Results for “{q}”</h1>
      {block(
        "Apps",
        apps === null,
        appHits.length,
        <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
          {appHits.map((a) => (
            <li key={a.id}>
              <a href={a.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-ground">
                <AppGlyph app={a} size={34} />
                <span className="text-[14px] font-medium text-ink">{a.name}</span>
                <span className="truncate text-[13px] text-stone-500">{a.blurb}</span>
              </a>
            </li>
          ))}
        </ul>,
      )}
      {block(
        "People",
        people === null,
        people?.length ?? 0,
        <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
          {people?.map((p) => (
            <li key={p.id}>
              <Link href={`/directory?id=${p.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-ground">
                <Avatar id={p.id} name={p.name} dept={p.department} size={34} />
                <span className="text-[14px] font-medium text-ink">{p.name}</span>
                <span className="truncate text-[13px] text-stone-500">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>,
      )}
      {block(
        "Updates",
        posts === null,
        postHits.length,
        <ul className="divide-y divide-line rounded-xl border border-line bg-panel">
          {postHits.map((p) => (
            <li key={p.id}>
              <Link href={`/updates/${p.slug}`} className="block px-4 py-3 hover:bg-ground">
                <span className="block text-[14px] font-medium text-ink">{p.title}</span>
                <span className="text-[12.5px] text-stone-500">
                  {p.category} · {formatDate(p.date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>,
      )}
    </div>
  );
}
