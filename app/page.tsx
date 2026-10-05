import Link from "next/link";
import AppRail from "@/components/AppRail";
import UpdatesIndex from "@/components/UpdatesIndex";
import Hero from "@/components/Hero";
import { Reveal } from "@/components/motion";
import { IconArrowRight, IconTicket } from "@/components/icons";
import { ARTICLES } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <Hero />

      {/* ---- app rail ---- */}
      <section>
        <Reveal>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Launcher</p>
              <h2 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">Your apps</h2>
            </div>
            <Link href="/apps" className="group flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-ember">
              View all
              <IconArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <AppRail />
      </section>

      {/* ---- ticket strip ---- */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-ink px-7 py-8 text-paper sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #D9480F, transparent)" }}
          />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember text-paper">
                <IconTicket size={20} />
              </span>
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-tight">Something not working?</h2>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-stone-400">
                  Raise a ticket and follow the whole thread right here — no tab-hopping, no black hole.
                </p>
              </div>
            </div>
            <Link
              href="/help"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:bg-ember hover:text-paper active:scale-95"
            >
              Open Get Help
              <IconArrowRight size={15} />
            </Link>
          </div>
        </section>
      </Reveal>

      {/* ---- updates index ---- */}
      <section>
        <Reveal>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Bulletin</p>
              <h2 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">Latest updates</h2>
            </div>
            <Link href="/updates" className="group flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-ember">
              All updates
              <IconArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <UpdatesIndex articles={ARTICLES} initialVisible={4} step={3} />
      </section>
    </div>
  );
}
