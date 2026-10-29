"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const I = ({ d }: { d: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const ITEMS = [
  { href: "/uplift", label: "Meetings", d: "M4 6.5h16M4 6.5v12a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-12M8 3.5v4M16 3.5v4M8 12h3M8 16h6" },
  { href: "/uplift/agenda", label: "Agenda builder", d: "M9 6h11M9 12h11M9 18h11M4.5 6l.8.8L6.8 5M4.5 12l.8.8 1.5-1.8M4.5 18l.8.8 1.5-1.8" },
  { href: "/uplift/summary", label: "Summary", d: "M4 20V10M10 20V4M16 20v-7M21 20H3" },
  { href: "/uplift/wellness", label: "Wellness", d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" },
  { href: "/uplift/volunteer", label: "Volunteer", d: "M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6 7s-5.5-2.5-6.5-5L3 12a1.5 1.5 0 0 1 2.6-1.4L7 12.5" },
  { href: "/uplift/deactivation", label: "Interim deactivation", d: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM6 6l12 12" },
  { href: "/uplift/assessments", label: "Competency", d: "M12 3.5 14.6 9l6 .6-4.5 4 1.3 5.9L12 16.6 6.6 19.5l1.3-5.9-4.5-4 6-.6Z" },
  { href: "/uplift/me", label: "Away & delegations", d: "M12 8v4l2.5 2.5M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z" },
];

export default function Rail() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/uplift" ? path === "/uplift" || path.startsWith("/uplift/m/") || path === "/uplift/new" : path.startsWith(href);
  return (
    <nav aria-label="Uplift" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {ITEMS.map((it) => {
          const on = active(it.href);
          return (
            <li key={it.href} className="shrink-0">
              <Link
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors ${
                  on ? "bg-panel font-semibold text-ink shadow-card ring-1 ring-line" : "text-stone-600 hover:bg-panel/70 hover:text-ink"
                }`}
              >
                <span className={on ? "text-ember" : "text-stone-400"}>
                  <I d={it.d} />
                </span>
                <span className="whitespace-nowrap">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
