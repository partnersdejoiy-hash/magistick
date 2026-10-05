"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeaderNav from "./HeaderNav";
import SearchBox from "./SearchBox";
import { IconBell } from "./icons";
import { ROLES, useSession } from "@/lib/roles";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserMenu() {
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name} — account menu`}
        title={user.name}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-sans text-xs font-bold text-paper transition-transform duration-300 hover:scale-105"
      >
        {initials(user.name)}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-2xl border border-line bg-paper shadow-lift"
        >
          <div className="border-b border-line px-5 py-4">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-stone-500">{user.email}</p>
            <p className="mt-2 inline-block rounded-full bg-ember-tint px-2.5 py-0.5 text-[11px] font-semibold text-ember-ink">
              {ROLES[user.role].label}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="block w-full px-5 py-3 text-left text-sm font-medium text-stone-600 transition-colors hover:bg-parchment hover:text-ink"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { user, loading } = useSession();
  const signedIn = !loading && !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-paper backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-5 px-5 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="magistick home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember font-display text-xl font-bold italic text-paper shadow-[0_4px_14px_-4px_rgba(217,72,15,0.7)] transition-transform duration-300 group-hover:-rotate-6">
            m
          </span>
          <span className="font-display text-[19px] font-semibold tracking-tight">
            magi<span className="text-ember">stick</span>
          </span>
        </Link>

        {signedIn && <HeaderNav />}

        {signedIn && (
          <div className="ml-auto flex items-center gap-2.5">
            <SearchBox />
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-colors hover:border-white/20 hover:text-paper"
              aria-label="Notifications"
              title="Notifications (coming soon)"
            >
              <IconBell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ember" aria-hidden />
            </button>
            <UserMenu />
          </div>
        )}
      </div>
    </header>
  );
}
