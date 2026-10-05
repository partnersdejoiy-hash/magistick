import Link from "next/link";
import HeaderNav from "./HeaderNav";
import SearchBox from "./SearchBox";
import { IconBell } from "./icons";

export default function Header() {
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

        <HeaderNav />

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
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ember font-sans text-xs font-bold text-paper transition-transform duration-300 hover:scale-105"
            aria-label="Your profile"
            title="Deepak Sharma — profile (coming soon)"
          >
            DS
          </button>
        </div>
      </div>
    </header>
  );
}
