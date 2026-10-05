import Link from "next/link";
import HeaderNav from "./HeaderNav";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="magistick home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-lg font-black text-white">
            m
          </span>
          <span className="text-lg font-bold tracking-tight">
            magi<span className="text-brand-400">stick</span>
          </span>
        </Link>

        <HeaderNav />

        <div className="ml-auto flex items-center gap-3">
          <SearchBox />
          <button
            className="relative rounded-full border border-line bg-panel p-2 text-slate-300 hover:text-white"
            aria-label="Notifications"
            title="Notifications (coming soon)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent text-xs font-bold text-white"
            aria-label="Your profile"
            title="Profile (coming soon)"
          >
            DS
          </button>
        </div>
      </div>
    </header>
  );
}
