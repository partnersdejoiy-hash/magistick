"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LEVEL_BY_ID, type DeptId, type LevelId } from "@/lib/rbac";
import { Avatar, DeptTag, LevelTag } from "./Stamp";
import { IconSearch } from "./icons";

type Card = {
  id: string;
  name: string;
  email: string;
  title: string;
  level: LevelId;
  department: DeptId;
  location: string;
  reports: number;
};

type View = { person: Card; chain: Card[]; reports: Card[] };

function PersonCard({ p, focus = false }: { p: Card; focus?: boolean }) {
  return (
    <div
      className={`flex h-full flex-col rounded-xl border bg-panel p-4 ${
        focus ? "border-ember shadow-card ring-1 ring-ember/30" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={p.name} dept={p.department} size={focus ? 52 : 40} />
        <div className="min-w-0">
          <p className={`truncate font-semibold text-ink ${focus ? "text-[17px]" : "text-[14.5px]"}`}>{p.name}</p>
          <p className="truncate text-[13px] text-stone-600">{p.title || LEVEL_BY_ID[p.level].label.split(" (")[0]}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <LevelTag level={p.level} />
        <DeptTag dept={p.department} />
      </div>
      <dl className="mt-3 space-y-1 text-[12.5px] text-stone-600">
        {p.location && (
          <div className="flex gap-1.5">
            <dt className="sr-only">Location</dt>
            <dd>{p.location}</dd>
          </div>
        )}
        <div>
          <dt className="sr-only">Email</dt>
          <dd>
            <a href={`mailto:${p.email}`} className="break-all hover:text-ember hover:underline">
              {p.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Direct reports</dt>
          <dd className="tabular">
            {p.reports} direct report{p.reports === 1 ? "" : "s"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Org chart, Glowstick-style: the reporting chain as a breadcrumb above the
 * person, their card, and their direct reports below. Click anyone to walk.
 */
export default function DirectoryView() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");
  const [view, setView] = useState<View | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<Card[] | null>(null);

  useEffect(() => {
    setView(null);
    setError("");
    fetch(`/api/directory${id ? `?id=${encodeURIComponent(id)}` : ""}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Couldn't load the directory.");
        setView(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load the directory."));
  }, [id]);

  useEffect(() => {
    const needle = q.trim();
    if (needle.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/directory?q=${encodeURIComponent(needle)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((d) => setResults(d.results ?? []))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (pid: string) => {
    setQ("");
    router.push(`/directory?id=${pid}`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink">Directory</h1>
          <p className="mt-1 text-[14px] text-stone-600">Find anyone, see who they report to and who reports to them.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, title or site"
            aria-label="Search people"
            className="h-10 w-full rounded-lg border border-line bg-panel pl-9 pr-3 text-[14px] text-ink placeholder:text-stone-400 focus:border-ember focus:outline-none"
          />
          {results && (
            <ul className="absolute left-0 right-0 top-11 z-30 max-h-80 overflow-auto rounded-xl border border-line bg-panel py-1 shadow-lift">
              {results.length === 0 ? (
                <li className="px-4 py-3 text-[13px] text-stone-500">No one matches “{q.trim()}”.</li>
              ) : (
                results.map((p) => (
                  <li key={p.id}>
                    <button type="button" onClick={() => go(p.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-ground">
                      <Avatar name={p.name} dept={p.department} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                        <span className="block truncate text-[12px] text-stone-500">{p.title || LEVEL_BY_ID[p.level].label}</span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      {error ? (
        <p className="mt-8 rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>
      ) : !view ? (
        <div className="mt-8 space-y-4" aria-busy>
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton mx-auto h-40 max-w-sm" />
        </div>
      ) : (
        <div className="mt-8">
          <nav aria-label="Reporting chain" className="overflow-x-auto scroll-thin">
            <ol className="flex min-w-max items-center gap-1 text-[13px]">
              {view.chain.map((c) => (
                <li key={c.id} className="flex items-center gap-1">
                  <Link href={`/directory?id=${c.id}`} className="rounded-md px-2 py-1 text-ember hover:bg-ember-tint">
                    {c.name}
                  </Link>
                  <span className="text-stone-300" aria-hidden>
                    /
                  </span>
                </li>
              ))}
              <li aria-current="page" className="rounded-md bg-nil px-2 py-1 font-medium text-white">
                {view.person.name}
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-6 max-w-sm">
            <PersonCard p={view.person} focus />
          </div>

          <section aria-labelledby="reports-h" className="mt-10">
            <h2 id="reports-h" className="mb-3 text-[15px] font-semibold text-ink">
              Direct reports <span className="tabular font-normal text-stone-500">({view.reports.length})</span>
            </h2>
            {view.reports.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line bg-panel px-4 py-6 text-center text-[13.5px] text-stone-500">
                {view.person.name.split(" ")[0]} has no direct reports.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {view.reports.map((r) => (
                  <li key={r.id}>
                    <button type="button" onClick={() => go(r.id)} className="block h-full w-full text-left transition-transform duration-150 hover:-translate-y-0.5">
                      <PersonCard p={r} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
