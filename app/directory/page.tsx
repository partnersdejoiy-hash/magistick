"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PEOPLE } from "@/lib/data";
import { EASE, Reveal } from "@/components/motion";
import { IconSearch } from "@/components/icons";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const people = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return PEOPLE.filter(
      (p) =>
        !needle ||
        p.name.toLowerCase().includes(needle) ||
        p.team.toLowerCase().includes(needle) ||
        p.role.toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <div>
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">People</p>
        <h1 className="mt-1 font-display text-[34px] font-semibold tracking-tight text-ink">Directory</h1>
        <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-stone-600">
          Find teammates across the BPO — who does what, and where they sit.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="relative mt-8 max-w-md">
          <IconSearch size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, team, or role…"
            aria-label="Search directory"
            className="w-full rounded-2xl border border-line bg-white py-3 pl-11 pr-4 text-[14px] text-ink shadow-card placeholder:text-stone-400 focus:border-ember/50 focus:outline-none"
          />
        </div>
      </Reveal>

      {people.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white/60 p-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">No one matches “{q}”</p>
          <p className="mt-1 text-sm text-stone-500">Check the spelling, or try a team name.</p>
        </div>
      ) : (
        <motion.ul layout className="mt-6 border-t border-line">
          {people.map((p, i) => (
            <motion.li
              key={p.name}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04, ease: EASE }}
              className="flex items-center gap-4 border-b border-line px-2 py-4 transition-colors hover:bg-parchment/50 sm:px-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember-tint font-display text-[13px] font-semibold text-ember-ink">
                {p.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold tracking-tight text-ink">{p.name}</span>
                <span className="mt-0.5 block truncate text-[13px] text-stone-500">
                  {p.role} · {p.team}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-line px-3 py-1 text-[11px] font-medium text-stone-500">
                {p.site}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
