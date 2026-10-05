"use client";

import { useMemo, useState } from "react";
import { PEOPLE } from "@/lib/data";

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
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Directory</h1>
      <p className="mt-1 text-sm text-slate-600">Find teammates across the BPO.</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, team, or role…"
        aria-label="Search directory"
        className="mt-6 w-full max-w-md rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none"
      />
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {people.map((p) => (
          <li key={p.name} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-sm font-bold text-white shadow-sm">
              {p.name.split(" ").map((w) => w[0]).join("")}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{p.name}</p>
              <p className="text-xs text-slate-600">{p.role} · {p.team}</p>
              <p className="text-xs text-slate-500">{p.site}</p>
            </div>
          </li>
        ))}
        {people.length === 0 && (
          <li className="text-sm text-slate-500">No one matches “{q}”.</li>
        )}
      </ul>
    </div>
  );
}
