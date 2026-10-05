"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconSearch } from "./icons";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className="relative hidden md:block"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/apps?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <IconSearch
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search apps…"
        aria-label="Search apps"
        className="w-56 rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-[13px] text-paper placeholder:text-stone-500 transition-all duration-300 focus:w-64 focus:border-ember/60 focus:bg-white/[0.07] focus:outline-none"
      />
    </form>
  );
}
