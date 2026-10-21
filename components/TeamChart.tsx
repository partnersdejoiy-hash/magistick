"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEPARTMENTS, DEPT_BY_ID, LEVEL_BY_ID, type DeptId, type LevelId } from "@/lib/rbac";
import { Avatar } from "./Stamp";
import { IconSearch } from "./icons";

type Person = {
  id: string;
  name: string;
  title: string;
  level: LevelId;
  department: DeptId;
  location: string;
  manager_id: string | null;
  reports: number;
};

const rank = (p: Person) => LEVEL_BY_ID[p.level]?.rank ?? 0;

/**
 * The whole company as an org chart: everyone under their manager, from the
 * top down. Expand/collapse any branch, search to jump to a person (their
 * branch opens), filter by department, and zoom.
 */
export default function TeamChart() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<DeptId | "all">("all");
  const [zoom, setZoom] = useState(1);
  const [found, setFound] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/directory?all=1", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "Couldn't load the team.");
        setPeople(Array.isArray(d.people) ? d.people : []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Couldn't load the team.");
        setPeople([]);
      });
  }, []);

  const { byId, kids, roots } = useMemo(() => {
    const byId = new Map((people ?? []).map((p) => [p.id, p]));
    const kids = new Map<string, Person[]>();
    const roots: Person[] = [];
    for (const p of people ?? []) {
      if (p.manager_id && byId.has(p.manager_id) && p.manager_id !== p.id) {
        kids.set(p.manager_id, [...(kids.get(p.manager_id) ?? []), p]);
      } else roots.push(p);
    }
    const order = (a: Person, b: Person) => rank(b) - rank(a) || a.name.localeCompare(b.name);
    kids.forEach((list) => list.sort(order));
    roots.sort(order);
    return { byId, kids, roots };
  }, [people]);

  // Open everything for a small org; for a big one, just the top two levels.
  useEffect(() => {
    if (!people) return;
    if (people.length <= 60) return setOpen(new Set(Array.from(kids.keys())));
    const start = new Set<string>();
    for (const r of roots) {
      start.add(r.id);
      for (const c of kids.get(r.id) ?? []) start.add(c.id);
    }
    setOpen(start);
  }, [people, roots, kids]);

  const depts = useMemo(() => DEPARTMENTS.filter((d) => (people ?? []).some((p) => p.department === d.id)), [people]);
  const managers = useMemo(() => Array.from(kids.keys()).length, [kids]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const search = (text: string) => {
    const t = text.trim().toLowerCase();
    if (!t || !people) return;
    const hit = people.find((p) => p.name.toLowerCase().includes(t)) ?? people.find((p) => p.title.toLowerCase().includes(t));
    if (!hit) return setFound("none");
    // Open every manager above the match so it is visible.
    setOpen((prev) => {
      const next = new Set(prev);
      const seen = new Set<string>();
      let cur = hit.manager_id;
      while (cur && byId.has(cur) && !seen.has(cur)) {
        seen.add(cur);
        next.add(cur);
        cur = byId.get(cur)!.manager_id;
      }
      return next;
    });
    setFound(hit.id);
    setTimeout(() => document.getElementById(`node-${hit.id}`)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }), 80);
  };

  const renderNode = (p: Person): JSX.Element => {
    const children = kids.get(p.id) ?? [];
    const isOpen = open.has(p.id);
    const d = DEPT_BY_ID[p.department];
    const dim = dept !== "all" && p.department !== dept;
    const hit = found === p.id;
    return (
      <li key={p.id}>
        <div
          id={`node-${p.id}`}
          className={`relative w-[200px] rounded-2xl border bg-panel p-3 text-left shadow-card transition-all duration-300 ${
            hit ? "border-gold shadow-[0_0_0_3px_rgba(255,196,0,0.6),0_12px_30px_-10px_rgba(234,179,8,0.8)]" : "border-line hover:-translate-y-0.5 hover:shadow-lift"
          } ${dim ? "opacity-30" : ""}`}
        >
          <span aria-hidden className="absolute inset-x-3 top-0 h-1 rounded-b-full" style={{ backgroundColor: d.dye }} />
          <Link href={`/directory?id=${p.id}`} className="flex items-center gap-2.5">
            <Avatar id={p.id} name={p.name} dept={p.department} size={42} />
            <span className="min-w-0">
              <span className="line-clamp-2 text-[13.5px] font-semibold leading-tight text-ink">{p.name}</span>
              <span className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-stone-500">{p.title || LEVEL_BY_ID[p.level].label}</span>
            </span>
          </Link>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="truncate rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold" style={{ backgroundColor: `${d.dye}18`, color: d.dye }}>
              {d.label}
            </span>
            {children.length > 0 && (
              <button
                type="button"
                onClick={() => toggle(p.id)}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Hide" : "Show"} ${children.length} people reporting to ${p.name}`}
                className={`flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-bold transition-colors ${
                  isOpen ? "bg-nil text-white" : "bg-gold text-nil hover:bg-[#FFD86B]"
                }`}
              >
                {children.length}
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {children.length > 0 && isOpen && (
          <ul>
            {children.map(renderNode)}
          </ul>
        )}
      </li>
    );
  };

  const btn = "h-9 rounded-lg border border-line bg-panel px-3 text-[13px] font-medium text-ink hover:border-gold";

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-3 gap-3 sm:max-w-xl">
        {[
          [people?.length ?? "–", "People"],
          [managers || "–", "Managers"],
          [depts.length || "–", "Departments"],
        ].map(([v, l]) => (
          <div key={String(l)} className="rounded-2xl bg-panel p-4 ring-1 ring-line">
            <dd className="tabular font-display text-[28px] font-semibold leading-none text-ink">{v}</dd>
            <dt className="mt-1 text-[12.5px] text-stone-500">{l}</dt>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <form
          role="search"
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            search(q);
          }}
        >
          <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setFound(null);
            }}
            placeholder="Find a person, press Enter"
            aria-label="Find a person in the chart"
            className="h-9 w-64 rounded-lg border border-line bg-panel pl-9 pr-3 text-[13px] text-ink placeholder:text-stone-400 focus:border-gold focus:outline-none"
          />
        </form>
        <select
          value={dept}
          onChange={(e) => setDept(e.target.value as DeptId | "all")}
          aria-label="Highlight a department"
          className="h-9 rounded-lg border border-line bg-panel px-2 text-[13px] text-ink focus:border-gold focus:outline-none"
        >
          <option value="all">All departments</option>
          {depts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <button type="button" className={btn} onClick={() => setOpen(new Set(Array.from(kids.keys())))}>
          Expand all
        </button>
        <button type="button" className={btn} onClick={() => setOpen(new Set(roots.map((r) => r.id)))}>
          Collapse
        </button>
        <div className="ml-auto flex items-center gap-1" aria-label="Zoom">
          <button type="button" className={btn} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))} aria-label="Zoom out">
            −
          </button>
          <span className="tabular w-12 text-center text-[12.5px] text-stone-500">{Math.round(zoom * 100)}%</span>
          <button type="button" className={btn} onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))} aria-label="Zoom in">
            +
          </button>
        </div>
      </div>
      {found === "none" && <p className="text-[13px] text-bad">No one matches “{q}”.</p>}

      {error ? (
        <p className="rounded-xl border border-bad/30 bg-bad-tint px-4 py-3 text-[13.5px] text-bad">{error}</p>
      ) : people === null ? (
        <div className="flex flex-col items-center gap-4 py-10" aria-busy>
          <div className="skeleton h-20 w-52" />
          <div className="flex gap-4">
            <div className="skeleton h-20 w-52" />
            <div className="skeleton h-20 w-52" />
          </div>
        </div>
      ) : people.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-panel px-6 py-10 text-center text-[14px] text-stone-500">
          No one is in the directory yet. Admins add people under Admin → People.
        </p>
      ) : (
        <div ref={scroller} className="scroll-thin overflow-auto rounded-3xl bg-[radial-gradient(circle,#D4D4D8_1px,transparent_1px)] [background-size:22px_22px] p-6 ring-1 ring-line" data-noreveal>
          <div className="org-tree w-max min-w-full" style={{ zoom }}>
            <ul>
              {roots.map(renderNode)}
            </ul>
          </div>
        </div>
      )}
      <p className="text-[12.5px] text-stone-500">
        The chart follows each person&apos;s manager in the directory. Wrong manager or title? Ask HR or your admin to update it under Admin → People.
      </p>
    </div>
  );
}
