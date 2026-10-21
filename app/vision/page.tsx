import type { Metadata } from "next";
import Link from "next/link";
import { APP_ICONS, IconArrowRight } from "@/components/icons";
import { photoUrl } from "@/lib/photos";
import { MISSION, PROMISES, SIGNATURE, SPEECH, VALUES, VISION } from "@/lib/vision";

export const metadata: Metadata = { title: "Founders' Vision — magistick" };

function Sparkle({ className = "", color = "#FFC400" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`absolute ${className}`}>
      <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill={color} />
    </svg>
  );
}

/** Founders' Vision: the founders' address, vision and mission, core values and promises to employees. */
export default function VisionPage() {
  const [salutation, ...body] = SPEECH;
  const [closing] = body.splice(body.length - 1, 1);

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section aria-labelledby="vision-h" className="stars relative isolate overflow-hidden rounded-3xl bg-nil text-white shadow-lift">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
        <img src={photoUrl("celebration", 1800)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-nil via-nil/85 to-nil/30" />
        <span aria-hidden className="animate-drift-a absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
        <Sparkle className="right-[10%] top-[14%] h-12 w-12 drop-shadow-[0_0_16px_rgba(255,196,0,0.9)]" />
        <Sparkle className="right-[20%] top-[34%] h-5 w-5" color="#fff" />
        <div className="max-w-3xl px-7 py-14 sm:px-12 sm:py-20">
          <p className="w-fit rounded-full bg-gold px-3 py-1 text-[12.5px] font-bold text-nil">From our founders</p>
          <h1 id="vision-h" className="mt-5 text-[38px] font-semibold leading-[1.05] sm:text-[56px]">
            A BPO people are <span className="text-gold">proud</span> to work at.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/85">
            Why DEJOIY exists, what we believe, and what you can expect from us, in our founders&apos; own words.
          </p>
          <a href="#address" className="btn-magic mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-nil hover:bg-gold">
            Read the founders&apos; address <IconArrowRight size={16} />
          </a>
        </div>
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

      {/* Founders' address */}
      <section id="address" aria-labelledby="address-h" className="scroll-mt-24 grid gap-10 lg:grid-cols-[1fr_320px]">
        <article className="rounded-3xl bg-panel p-7 ring-1 ring-line sm:p-12">
          <p className="text-[12px] font-bold uppercase tracking-wider text-ember">The founders&apos; address</p>
          <h2 id="address-h" className="mt-2 text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">
            Why we built DEJOIY
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
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-nil text-gold shadow-[0_0_20px_rgba(255,196,0,0.35)]">
              <svg viewBox="0 0 16 16" className="h-6 w-6" aria-hidden>
                <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill="currentColor" />
              </svg>
            </span>
            <div>
              <p className="font-display text-[22px] font-semibold italic text-ink">{SIGNATURE.names}</p>
              <p className="text-[13px] text-stone-500">{SIGNATURE.org}</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
            <img src={photoUrl("support", 700)} alt="Two support agents with headsets at work" loading="lazy" className="aspect-[4/5] w-full object-cover" />
          </div>
          <blockquote className="relative rounded-3xl bg-nil p-6 text-white">
            <span aria-hidden className="absolute -top-3 left-5 font-display text-[64px] leading-none text-gold">“</span>
            <p className="relative mt-3 font-display text-[19px] font-semibold leading-snug">A number that is faked is worse than a number that is missed.</p>
            <footer className="mt-3 text-[12.5px] text-white/60">— from the founders&apos; address</footer>
          </blockquote>
        </aside>
      </section>

      {/* Core values */}
      <section aria-labelledby="values-h">
        <div className="max-w-2xl">
          <p className="text-[12px] font-bold uppercase tracking-wider text-ember">What we stand for</p>
          <h2 id="values-h" className="mt-2 text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">
            Our six core values
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">How we decide, how we behave, and what we expect from each other on every shift.</p>
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, n) => {
            const Icon = APP_ICONS[v.icon];
            return (
              <li key={v.title}>
                <article className="glow-card group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-panel">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
                    <img
                      src={photoUrl(v.photo, 800)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nil/85 via-nil/10 to-transparent" />
                    <span className="tabular absolute right-4 top-3 font-display text-[40px] font-semibold text-white/80 drop-shadow">{String(n + 1).padStart(2, "0")}</span>
                    <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-nil">
                        <Icon size={22} />
                      </span>
                      <div>
                        <h3 className="text-[19px] font-semibold leading-tight">{v.title}</h3>
                        <p className="text-[12.5px] italic text-gold">{v.hindi}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[14.5px] leading-relaxed text-ink">{v.meaning}</p>
                    <p className="mt-4 text-[11.5px] font-bold uppercase tracking-wider text-stone-500">On the floor, this looks like</p>
                    <ul className="mt-2 space-y-1.5">
                      {v.looksLike.map((l) => (
                        <li key={l} className="flex gap-2 text-[13.5px] text-stone-600">
                          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Promises */}
      <section aria-labelledby="promise-h" className="stars relative isolate overflow-hidden rounded-3xl bg-nil p-7 text-white sm:p-12">
        <span aria-hidden className="animate-drift-b absolute -bottom-32 -right-20 -z-10 h-80 w-80 rounded-full bg-magenta/25 blur-3xl" />
        <h2 id="promise-h" className="text-[28px] font-semibold leading-tight sm:text-[34px]">
          Our promises <span className="text-gold">to you</span>
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
