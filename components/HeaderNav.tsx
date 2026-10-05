"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "@/lib/roles";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/updates", label: "Updates" },
  { href: "/help", label: "Get Help" },
  { href: "/directory", label: "Directory" },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const { can } = useSession();
  const items = can("manage_roles")
    ? [...NAV, { href: "/admin", label: "Admin" }]
    : NAV;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative rounded-md px-3.5 py-2 text-[13.5px] font-medium tracking-wide transition-colors duration-200 ${
              active ? "text-paper" : "text-stone-400 hover:text-paper"
            }`}
          >
            {item.label}
            {active && (
              <motion.span
                layoutId="nav-ember-underline"
                className="absolute inset-x-3 -bottom-[13px] h-[2.5px] rounded-full bg-ember"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
