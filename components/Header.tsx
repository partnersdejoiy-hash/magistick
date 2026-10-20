"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/roles";
import { DEPT_BY_ID, LEVEL_BY_ID } from "@/lib/rbac";
import { Avatar, Stamp, stampBandStyle } from "./Stamp";
import { IconChevronDown, IconExternal, IconSearch } from "./icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/apps", label: "Apps" },
  { href: "/updates", label: "Updates" },
  { href: "/directory", label: "Directory" },
  { href: "/help", label: "Get Help" },
  { href: "/new-hire", label: "New Hire" },
];

const ADMIN_PERMS = [
  "manage_users_team",
  "manage_users_dept",
  "manage_users_all",
  "manage_roles",
  "manage_apps",
  "manage_app_access",
  "view_audit",
  "publish_posts_dept",
  "publish_posts_all",
] as const;

type QuickApp = { id: string; name: string; href: string; category: string };

/** Close a popover on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function QuickLinks() {
  const [open, setOpen] = useState(false);
  const [apps, setApps] = useState<QuickApp[] | null>(null);
  const ref = useDismiss(open, () => setOpen(false));

  useEffect(() => {
    if (!open || apps) return;
    fetch("/api/apps", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { apps: [] }))
      .then((d) => setApps(Array.isArray(d.apps) ? d.apps : []))
      .catch(() => setApps([]));
  }, [open, apps]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="on-nil flex h-9 items-center gap-1 rounded-md px-2.5 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        Quick links <IconChevronDown size={14} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border border-line bg-panel py-1.5 shadow-lift">
          {apps === null ? (
            <div className="space-y-2 p-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ) : apps.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-stone-500">No apps are open to your level yet.</p>
          ) : (
            apps.map((a) => (
              <a
                key={a.id}
                role="menuitem"
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 px-4 py-2 text-[13.5px] text-ink hover:bg-ground"
              >
                <span className="truncate">{a.name}</span>
                <span className="flex items-center gap-2 text-[12px] text-stone-500">
                  {a.category}
                  <IconExternal size={13} />
                </span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${user.name}, account menu`}
        className="on-nil flex items-center rounded-full p-0.5 transition-shadow hover:shadow-[0_0_0_2px_rgba(255,255,255,0.25)]"
      >
        <Avatar name={user.name} dept={user.department} size={32} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-xl border border-line bg-panel shadow-lift">
          <div className="border-b border-line px-4 py-3.5">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="mt-0.5 truncate text-[12.5px] text-stone-500">{user.email}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-stone-600">
              <Stamp dept={user.department} size={12} />
              {LEVEL_BY_ID[user.level].label.split(" (")[0]} · {DEPT_BY_ID[user.department].label}
            </p>
          </div>
          <Link role="menuitem" href="/directory" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13.5px] text-ink hover:bg-ground">
            My place in the org
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="block w-full px-4 py-2.5 text-left text-[13.5px] text-ink hover:bg-ground"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className="relative hidden md:block"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search apps, people, updates"
        aria-label="Search apps, people and updates"
        className="on-nil h-9 w-64 rounded-md border border-white/10 bg-nil-2 pl-9 pr-3 text-[13px] text-white placeholder:text-white/55 focus:border-gold/70 focus:outline-none lg:w-72"
      />
    </form>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { user, loading } = useSession();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [pathname]);

  const signedIn = !loading && !!user;
  const isAdmin = !!user && ADMIN_PERMS.some((p) => user.perms.includes(p));
  const items = isAdmin ? [...NAV, { href: "/admin", label: "Admin" }] : NAV;
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-nil text-white">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="on-nil flex shrink-0 items-center gap-2 rounded-md" aria-label="magistick home">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill="#1B2250" />
              </svg>
            </span>
            <span className="text-[17px] font-semibold tracking-tight">magistick</span>
          </Link>

          {signedIn && (
            <nav className="hidden h-14 items-stretch lg:flex" aria-label="Primary">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active(it.href) ? "page" : undefined}
                  className={`on-nil relative flex items-center px-3 text-[13.5px] font-medium transition-colors ${
                    active(it.href) ? "text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {it.label}
                  {active(it.href) && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-gold" />}
                </Link>
              ))}
            </nav>
          )}

          {signedIn && (
            <div className="ml-auto flex items-center gap-2">
              <Search />
              <div className="hidden sm:block">
                <QuickLinks />
              </div>
              <UserMenu />
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-controls="mobile-nav"
                className="on-nil flex h-9 items-center rounded-md px-2.5 text-[13px] font-medium text-white/85 hover:bg-white/10 lg:hidden"
              >
                Menu
              </button>
            </div>
          )}
        </div>
        {signedIn && menu && (
          <nav id="mobile-nav" aria-label="Primary" className="border-t border-white/10 px-4 pb-3 pt-2 lg:hidden">
            <form
              role="search"
              action="/search"
              className="mb-2 md:hidden"
            >
              <input
                name="q"
                placeholder="Search apps, people, updates"
                aria-label="Search"
                className="on-nil h-10 w-full rounded-md border border-white/10 bg-nil-2 px-3 text-[14px] text-white placeholder:text-white/55 focus:outline-none"
              />
            </form>
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active(it.href) ? "page" : undefined}
                className={`on-nil block rounded-md px-3 py-2.5 text-[15px] ${active(it.href) ? "bg-white/10 text-white" : "text-white/80"}`}
              >
                {it.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
      {signedIn && <div className="h-2.5" style={stampBandStyle(user!.department)} aria-hidden />}
    </header>
  );
}
