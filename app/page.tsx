import Link from "next/link";
import AppRail from "@/components/AppRail";
import UpdatesIndex from "@/components/UpdatesIndex";
import Hero from "@/components/Hero";
import StoryJourney from "@/components/StoryJourney";
import { Magnetic, Parallax, Reveal } from "@/components/motion";
import { IconArrowRight, IconTicket } from "@/components/icons";

/**
 * Homepage order — apps first, Glowstick-style. The launcher rail sits
 * immediately under the header; immersive moments follow, never bury.
 */
export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* ---- 1 · apps first ---- */}
      <section aria-label="Your apps">
        <Reveal>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Launcher</p>
              <h2 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">Your apps</h2>
            </div>
            <Link href="/apps" className="group flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-magenta">
              View all
              <IconArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <AppRail />
      </section>

      {/* ---- 2 · immersive hero with 3D dust ---- */}
      <Hero />

      {/* ---- 3 · featured stories: pinned horizontal journey ---- */}
      <StoryJourney />

      {/* ---- 4 · ticket strip ---- */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl bg-ink px-7 py-8 text-paper sm:px-10">
          <Parallax amount={60} className="pointer-events-none absolute inset-0">
            <div
              aria-hidden
              className="absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
              style={{ background: "radial-gradient(closest-side, #D9480F, transparent)" }}
            />
            <div
              aria-hidden
              className="absolute -left-16 -bottom-28 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(closest-side, #D6A43C, transparent)" }}
            />
          </Parallax>
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember text-ink">
                <IconTicket size={20} />
              </span>
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-tight">Something not working?</h2>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-stone-400">
                  Raise a ticket and follow the whole thread right here — no tab-hopping, no black hole.
                </p>
              </div>
            </div>
            <Magnetic>
              <Link
                href="/help"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:bg-ember hover:text-ink active:scale-95"
              >
                Open Get Help
                <IconArrowRight size={15} />
              </Link>
            </Magnetic>
          </div>
        </section>
      </Reveal>

      {/* ---- 5 · updates index ---- */}
      <section>
        <Reveal>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Bulletin</p>
              <h2 className="mt-1 font-display text-[28px] font-semibold tracking-tight text-ink">Latest updates</h2>
            </div>
            <Link href="/updates" className="group flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-magenta">
              All updates
              <IconArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
        <UpdatesIndex initialVisible={4} step={3} />
      </section>
    </div>
  );
}
