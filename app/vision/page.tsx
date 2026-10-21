import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight } from "@/components/icons";
import DejoiyLetters from "@/components/vision/DejoiyLetters";
import FounderHero from "@/components/vision/FounderHero";
import { FOUNDER, MISSION, NAME_MEANING, PROMISES, SPEECH, VISION } from "@/lib/vision";

export const metadata: Metadata = { title: "Founder's Vision — magistick" };

function Sparkle({ className = "", color = "#FFC400" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`absolute ${className}`}>
      <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill={color} />
    </svg>
  );
}

const PART_COLORS = ["#E91E63", "#FFC400", "#14B8A6"];

/** Founder's Vision: founder hero, what DEJOIY means, the six letter-values, vision & mission, her address, and promises. */
export default function VisionPage() {
  const salutation = SPEECH[0];
  const closing = SPEECH[SPEECH.length - 1];
  const body = SPEECH.slice(1, -1);

  return (
    <div className="space-y-16">
      <FounderHero />

      {/* What the name means */}
      <section aria-labelledby="meaning-h" className="text-center">
        <p className="text-[12px] font-bold uppercase tracking-wider text-ember">Our name</p>
        <h2 id="meaning-h" className="mx-auto mt-2 max-w-3xl text-[32px] font-semibold leading-tight text-ink sm:text-[44px]">
          {NAME_MEANING.headline}
        </h2>
        <ol className="mt-10 grid gap-4 text-left md:grid-cols-3">
          {NAME_MEANING.parts.map((p, n) => (
            <li key={p.part} className="glow-card relative overflow-hidden rounded-3xl border border-line bg-panel p-6">
              <span aria-hidden className="absolute -right-2 -top-6 font-display text-[120px] font-semibold leading-none opacity-15" style={{ color: PART_COLORS[n] }}>
                {p.script}
              </span>
              <p className="relative flex items-baseline gap-3">
                <span className="font-display text-[44px] font-semibold leading-none" style={{ color: PART_COLORS[n] }}>
                  {p.part}
                </span>
                <span className="text-[20px] text-stone-400">{p.script}</span>
                {n < 2 && (
                  <span aria-hidden className="ml-auto text-[28px] font-light text-stone-300">
                    +
                  </span>
                )}
              </p>
              <p className="relative mt-3 text-[15px] leading-relaxed text-stone-700">{p.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-display text-[20px] text-stone-600">
          दे + Joy + You = <span className="font-semibold text-ink">DEJOIY</span>
        </p>
      </section>

      {/* Six letters, six values */}
      <section id="dejoiy" aria-labelledby="values-h" className="scroll-mt-24">
        <div className="mb-8 max-w-2xl">
          <p className="text-[12px] font-bold uppercase tracking-wider text-ember">Our core values</p>
          <h2 id="values-h" className="mt-2 text-[32px] font-semibold leading-tight text-ink sm:text-[40px]">
            Six letters. <span className="bg-[linear-gradient(transparent_62%,rgba(255,196,0,0.6)_62%)]">Six values.</span>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">Tap a letter to see what it stands for, and what it looks like on the floor.</p>
        </div>
        <DejoiyLetters />
      </section>

      {/* Vision & mission */}
      <section aria-label="Vision and mission" className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-gold p-7 text-nil sm:p-9">
          <Sparkle className="right-6 top-6 h-8 w-8" color="#262626" />
          <p className="text-[12px] font-bold uppercase tracking-wider">Our vision</p>
          <p className="mt-3 font-display text-[24px] font-semibold leading-snug sm:text-[28px]">{VISION}</p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-panel p-7 ring-1 ring-line sm:p-9">
          <span aria-hidden className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-magenta/10" />
          <p className="text-[12px] font-bold uppercase tracking-wider text-magenta">Our mission</p>
          <p className="relative mt-3 font-display text-[22px] font-semibold leading-snug text-ink sm:text-[24px]">{MISSION}</p>
        </div>
      </section>

      {/* Founder's address */}
      <section id="address" aria-labelledby="address-h" className="grid scroll-mt-24 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="rounded-3xl bg-panel p-7 ring-1 ring-line sm:p-12">
          <p className="text-[12px] font-bold uppercase tracking-wider text-ember">The founder&apos;s address</p>
          <h2 id="address-h" className="mt-2 text-[30px] font-semibold leading-tight text-ink sm:text-[38px]">
            Why I built DEJOIY
          </h2>
          <div className="mt-7 max-w-[68ch] space-y-5 text-[16.5px] leading-[1.75] text-stone-700">
            <p className="font-display text-[20px] font-semibold text-ink">{salutation}</p>
            {body.map((p, n) => (
              <p
                key={p}
                className={
                  n === 0
                    ? "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-[64px] first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-ember"
                    : undefined
                }
              >
                {p}
              </p>
            ))}
            <p className="font-display text-[20px] font-semibold text-ink">{closing}</p>
          </div>
          <div className="mt-10 flex items-center gap-4 border-t border-line pt-6">
            <span className="h-16 w-16 overflow-hidden rounded-full bg-nil ring-2 ring-gold shadow-[0_0_20px_rgba(255,196,0,0.35)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- local portrait */}
              <img src={FOUNDER.photo} alt="" className="h-full w-full object-cover object-top" />
            </span>
            <div>
              <p className="font-display text-[24px] font-semibold italic text-ink">{FOUNDER.name}</p>
              <p className="text-[13px] text-stone-500">
                {FOUNDER.title}, {FOUNDER.org}
              </p>
            </div>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="stars relative isolate overflow-hidden rounded-3xl bg-nil pt-8">
            <span aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/30 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element -- local portrait */}
            <img src={FOUNDER.photo} alt={`${FOUNDER.name}, ${FOUNDER.title}`} loading="lazy" className="mx-auto h-[300px] w-auto object-contain" />
          </div>
          <blockquote className="relative rounded-3xl bg-gold p-6 text-nil">
            <span aria-hidden className="absolute -top-3 left-5 font-display text-[64px] leading-none">“</span>
            <p className="relative mt-3 font-display text-[19px] font-semibold leading-snug">{FOUNDER.quote}</p>
            <footer className="mt-3 text-[12.5px] font-medium">— {FOUNDER.name}</footer>
          </blockquote>
        </aside>
      </section>

      {/* Promises */}
      <section aria-labelledby="promise-h" className="stars relative isolate overflow-hidden rounded-3xl bg-nil p-7 text-white sm:p-12">
        <span aria-hidden className="animate-drift-b absolute -bottom-32 -right-20 -z-10 h-80 w-80 rounded-full bg-magenta/25 blur-3xl" />
        <h2 id="promise-h" className="text-[28px] font-semibold leading-tight sm:text-[34px]">
          My promises <span className="text-gold">to you</span>
        </h2>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.label} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
              <dt className="sr-only">{p.label}</dt>
              <dd className="font-display text-[28px] font-semibold leading-none text-gold">{p.value}</dd>
              <dd className="mt-2 text-[14px] leading-snug text-white/80">{p.label}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/policies" className="btn-magic inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[14px] font-bold text-nil hover:bg-[#FFD86B]">
            See how it works in our policies <IconArrowRight size={16} />
          </Link>
          <Link href="/help" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white ring-1 ring-white/30 hover:ring-gold">
            Share an idea with us
          </Link>
        </div>
      </section>
    </div>
  );
}
