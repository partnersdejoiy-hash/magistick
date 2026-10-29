import type { Metadata } from "next";
import Link from "next/link";
import Rail from "@/components/uplift/Rail";
import { UpliftMark, day } from "@/components/uplift/ui";
import { sql } from "@/lib/db";
import { loadScope, notices } from "@/lib/uplift";

export const metadata: Metadata = { title: { default: "Uplift — magistick", template: "%s · Uplift" } };
export const dynamic = "force-dynamic";

export default async function UpliftLayout({ children }: { children: React.ReactNode }) {
  const s = await loadScope().catch(() => null);
  if (!s) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-line bg-panel px-8 py-12 text-center">
        <h1 className="text-[20px] font-semibold text-ink">Uplift couldn&rsquo;t load</h1>
        <p className="mt-2 text-[14px] text-stone-600">Sign in again, or raise it under Get Help if this keeps happening.</p>
      </div>
    );
  }
  const list = await notices(s);
  const ooo = (await sql()`SELECT to_char(to_date, 'YYYY-MM-DD') AS to_date FROM up_ooo
                           WHERE user_id = ${s.me.id} AND to_date >= current_date`) as { to_date: string }[];

  return (
    <div>
      <header className="on-nil relative rounded-2xl bg-nil px-5 py-4 text-white shadow-lift sm:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/uplift" className="flex items-center gap-3 rounded-lg">
            <UpliftMark />
            <span>
              <span className="block font-display text-[24px] font-semibold leading-none tracking-tight">Uplift</span>
              <span className="mt-1 block text-[12.5px] text-white/65">Coaching, check-ins and growth at DEJOIY</span>
            </span>
          </Link>

          <form action="/uplift/people" className="order-last w-full sm:order-none sm:ml-auto sm:w-72" role="search">
            <label className="sr-only" htmlFor="up-q">Search an employee</label>
            <input
              id="up-q"
              name="q"
              placeholder="Search an employee"
              className="h-9 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-[13.5px] text-white placeholder:text-white/55 focus:border-gold focus:bg-white/15 focus:outline-none"
            />
          </form>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {ooo[0] && (
              <Link href="/uplift/me" className="rounded-full bg-gold/20 px-3 py-1 text-[12.5px] font-medium text-white ring-1 ring-gold/40">
                Away till {day(ooo[0].to_date)}
              </Link>
            )}
            <details className="group relative">
              <summary
                className="relative flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-white/85 hover:bg-white/10 [&::-webkit-details-marker]:hidden"
                aria-label={`Notifications${list.length ? ` (${list.length})` : ""}`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
                  <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15ZM10 20.5a2 2 0 0 0 4 0" />
                </svg>
                {list.length > 0 && (
                  <span className="tabular absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-gold px-1 text-center text-[11px] font-bold leading-[18px] text-white">
                    {list.length}
                  </span>
                )}
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-panel text-ink shadow-lift">
                <p className="border-b border-line px-4 py-2.5 text-[13px] font-semibold">Needs you</p>
                {list.length ? (
                  <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                    {list.map((n, i) => (
                      <li key={i}>
                        <Link href={n.href} className="block px-4 py-2.5 text-[13px] leading-snug hover:bg-ground">
                          {n.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-5 text-[13px] text-stone-600">You&rsquo;re all caught up.</p>
                )}
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[212px_minmax(0,1fr)]">
        <Rail />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
