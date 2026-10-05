"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className="hidden md:block"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/apps?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search apps, articles, help…"
        aria-label="Search magistick"
        className="w-64 rounded-full border border-line bg-panel px-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      />
    </form>
  );
}
