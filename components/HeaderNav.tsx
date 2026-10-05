"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/updates", label: "Updates" },
  { href: "/help", label: "Get Help" },
  { href: "/directory", label: "Directory" },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="flex items-center gap-1" aria-label="Primary">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "text-white shadow-[inset_0_-2px_0_0_#f43f5e]"
              : "text-slate-400 hover:text-slate-100"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
