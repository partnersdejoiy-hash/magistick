"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { photoUrl, type PhotoKey } from "@/lib/photos";
import type { Policy, Slide } from "@/lib/policies";
import { APP_ICONS, IconArrowRight, IconCheck } from "./icons";

/**
 * A policy as a slide deck: arrows, keyboard (←/→/Home/End), swipe, fullscreen,
 * a glowing progress bar, and a "Read as page" mode that lays every slide out
 * vertically for reading, searching and printing.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

function Photo({ k, className = "", w = 1600 }: { k: PhotoKey; className?: string; w?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL
  return <img src={photoUrl(k, w)} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover ${className}`} />;
}

function Sparkle({ className = "", color = "#EC407A" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`absolute ${className}`}>
      <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill={color} />
    </svg>
  );
}

function SlideTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-display text-[26px] font-semibold leading-tight text-ink sm:text-[34px]">{children}</h3>;
}

/* ---------------- slide layouts ---------------- */

function Cover({ p }: { p: Policy }) {
  return (
    <div className="relative h-full min-h-[460px] overflow-hidden text-white">
      <Photo k={p.photo} className="absolute inset-0" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(100deg, ${p.accent}F2 0%, ${p.accent}B3 38%, rgba(20,20,20,0.15) 75%)` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <Sparkle className="right-[8%] top-[10%] h-10 w-10 drop-shadow-[0_0_14px_rgba(236,64,122,0.9)]" />
      <Sparkle className="right-[16%] top-[26%] h-5 w-5" color="#fff" />
      <div className="relative flex h-full min-h-[460px] max-w-2xl flex-col justify-end p-7 sm:p-12">
        <span className="w-fit rounded-full bg-white/20 px-3.5 py-1 text-[12.5px] font-semibold backdrop-blur-sm">{p.kicker}</span>
        <h2 className="mt-4 font-display text-[36px] font-semibold leading-[1.05] drop-shadow-md sm:text-[54px]">{p.title}</h2>
        <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-white/90 sm:text-[17px]">{p.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[12.5px] font-medium">
          <span className="rounded-md bg-gold px-2 py-0.5 font-bold text-nil">{p.status}</span>
          <span className="rounded-md bg-black/30 px-2 py-0.5">Owner: {p.owner}</span>
          <span className="rounded-md bg-black/30 px-2 py-0.5">v{p.version}</span>
          <span className="rounded-md bg-black/30 px-2 py-0.5">Effective: {p.effective}</span>
        </div>
      </div>
    </div>
  );
}

function Statement({ p, s }: { p: Policy; s: Extract<Slide, { kind: "statement" }> }) {
  return (
    <div className="grid h-full min-h-[460px] md:grid-cols-[1.25fr_1fr]">
      <div className="relative flex flex-col justify-center overflow-hidden p-7 text-white sm:p-12" style={{ backgroundColor: p.accent }}>
        <span aria-hidden className="absolute -left-2 -top-10 font-display text-[200px] leading-none text-white/15">“</span>
        <span aria-hidden className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-white/10" />
        <p className="relative font-display text-[24px] font-semibold leading-snug sm:text-[32px]">{s.text}</p>
        {s.note && <p className="relative mt-5 max-w-lg text-[14.5px] leading-relaxed text-white/85">{s.note}</p>}
      </div>
      {s.photo && (
        <div className="relative hidden overflow-hidden md:block">
          <Photo k={s.photo} w={1000} />
          <div className="absolute inset-y-0 left-0 w-16" style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
          <Sparkle className="bottom-[12%] right-[10%] h-9 w-9 drop-shadow-[0_0_10px_rgba(236,64,122,0.9)]" />
        </div>
      )}
    </div>
  );
}

function Grid({ p, s }: { p: Policy; s: Extract<Slide, { kind: "grid" }> }) {
  const cols = s.items.length === 4 ? "sm:grid-cols-2" : s.items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className="relative h-full min-h-[460px] overflow-hidden bg-panel p-7 sm:p-12">
      <span aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-15" style={{ backgroundColor: p.accent }} />
      <SlideTitle>{s.title}</SlideTitle>
      <ul className={`relative mt-7 grid gap-4 ${cols}`}>
        {s.items.map((it, n) => {
          const Icon = APP_ICONS[it.icon];
          return (
            <li key={it.title} className="rounded-2xl border border-line bg-ground/60 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: p.accent }}>
                  <Icon size={22} />
                </span>
                <span className="tabular text-[12px] font-bold text-stone-400">{String(n + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-3 text-[16px] font-semibold text-ink">{it.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-stone-600">{it.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DoDont({ s }: { s: Extract<Slide, { kind: "dodont" }> }) {
  return (
    <div className="h-full min-h-[460px] bg-panel p-7 sm:p-12">
      <SlideTitle>{s.title}</SlideTitle>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-ok-tint p-5 sm:p-6">
          <p className="flex items-center gap-2 text-[15px] font-bold text-ok">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ok text-white">
              <IconCheck size={16} />
            </span>
            Do
          </p>
          <ul className="mt-4 space-y-3">
            {s.dos.map((d) => (
              <li key={d} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-bad-tint p-5 sm:p-6">
          <p className="flex items-center gap-2 text-[15px] font-bold text-bad">
            <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-bad text-[15px] text-white">✕</span>
            Don&apos;t
          </p>
          <ul className="mt-4 space-y-3">
            {s.donts.map((d) => (
              <li key={d} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-bad" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Numbers({ p, s }: { p: Policy; s: Extract<Slide, { kind: "numbers" }> }) {
  return (
    <div className="grid h-full min-h-[460px] md:grid-cols-[1.3fr_1fr]">
      <div className="bg-panel p-7 sm:p-12">
        <SlideTitle>{s.title}</SlideTitle>
        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-7">
          {s.items.map((it) => (
            <div key={it.label}>
              <dt className="sr-only">{it.label}</dt>
              <dd className="font-display text-[38px] font-semibold leading-none sm:text-[48px]" style={{ color: p.accent }}>
                {it.value}
              </dd>
              <dd className="mt-2 text-[13.5px] leading-snug text-stone-600">{it.label}</dd>
            </div>
          ))}
        </dl>
      </div>
      {s.photo && (
        <div className="relative hidden overflow-hidden md:block">
          <Photo k={s.photo} w={1000} />
          <div className="absolute inset-0" style={{ background: `linear-gradient(200deg, transparent 40%, ${p.accent}CC)` }} />
          <Sparkle className="left-[10%] top-[12%] h-8 w-8 drop-shadow-[0_0_10px_rgba(236,64,122,0.9)]" />
        </div>
      )}
    </div>
  );
}

function Steps({ p, s }: { p: Policy; s: Extract<Slide, { kind: "steps" }> }) {
  return (
    <div className="relative h-full min-h-[460px] overflow-hidden bg-panel p-7 sm:p-12">
      <span aria-hidden className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-10" style={{ backgroundColor: p.accent }} />
      <SlideTitle>{s.title}</SlideTitle>
      <ol className={`relative mt-9 grid gap-6 ${s.steps.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {s.steps.map((st, n) => (
          <li key={st.title} className="relative">
            {n < s.steps.length - 1 && (
              <span aria-hidden className="absolute left-12 right-0 top-6 hidden h-0.5 md:block" style={{ background: `linear-gradient(90deg, ${p.accent}, ${p.accent}22)` }} />
            )}
            <span
              className="relative flex h-12 w-12 items-center justify-center rounded-full text-[18px] font-bold text-white shadow-lg"
              style={{ backgroundColor: p.accent, boxShadow: `0 8px 20px -6px ${p.accent}` }}
            >
              {n + 1}
            </span>
            <p className="mt-4 text-[16px] font-semibold text-ink">{st.title}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-stone-600">{st.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Contact({ p, s }: { p: Policy; s: Extract<Slide, { kind: "contact" }> }) {
  return (
    <div className="stars relative isolate h-full min-h-[460px] overflow-hidden bg-nil p-7 text-white sm:p-12">
      <span aria-hidden className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full blur-3xl" style={{ backgroundColor: `${p.accent}66` }} />
      <span aria-hidden className="absolute -bottom-32 left-10 -z-10 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <h3 className="font-display text-[28px] font-semibold leading-tight sm:text-[36px]">{s.title}</h3>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/80">{s.text}</p>
      <ul className="mt-7 grid gap-3 sm:grid-cols-2">
        {s.lines.map((l) => (
          <li key={l.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-gold">{l.label}</p>
            <p className="mt-1 text-[15px] font-medium">{l.value}</p>
          </li>
        ))}
      </ul>
      <Link
        href="/help"
        className="btn-magic mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-[14px] font-bold text-nil hover:bg-[#F48FB1]"
      >
        Go to Get Help <IconArrowRight size={16} />
      </Link>
    </div>
  );
}

function SlideView({ p, s }: { p: Policy; s: Slide }) {
  switch (s.kind) {
    case "cover":
      return <Cover p={p} />;
    case "statement":
      return <Statement p={p} s={s} />;
    case "grid":
      return <Grid p={p} s={s} />;
    case "dodont":
      return <DoDont s={s} />;
    case "numbers":
      return <Numbers p={p} s={s} />;
    case "steps":
      return <Steps p={p} s={s} />;
    case "contact":
      return <Contact p={p} s={s} />;
  }
}

/* ---------------- the deck ---------------- */

export default function PolicyDeck({ policy, prev, next, children }: { policy: Policy; prev?: Policy; next?: Policy; children?: ReactNode }) {
  const total = policy.slides.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [asPage, setAsPage] = useState(false);
  const frame = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (to: number) => {
      const n = Math.max(0, Math.min(total - 1, to));
      setDir(n >= i ? 1 : -1);
      setI(n);
    },
    [i, total],
  );

  useEffect(() => {
    if (asPage) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(i + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(i - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i, total, asPage]);

  const fullscreen = () => {
    const el = frame.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full bg-panel text-ink shadow-card ring-1 ring-line transition hover:ring-gold disabled:opacity-40 disabled:hover:ring-line";
  const progress: CSSProperties = { width: `${((i + 1) / total) * 100}%`, backgroundColor: policy.accent };

  return (
    <article aria-labelledby="policy-title" className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
        <Link href="/policies" className="font-medium text-ember hover:underline">
          ← Policy Center
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAsPage((x) => !x)}
            aria-pressed={asPage}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 font-medium text-ink hover:border-gold"
          >
            {asPage ? "View as slides" : "Read as page"}
          </button>
          {!asPage && (
            <button type="button" onClick={fullscreen} className="rounded-lg border border-line bg-panel px-3 py-1.5 font-medium text-ink hover:border-gold">
              Present
            </button>
          )}
        </div>
      </nav>
      <h1 id="policy-title" className="sr-only">
        {policy.title}
      </h1>

      {asPage ? (
        <div className="space-y-6" data-noreveal>
          {policy.slides.map((s, n) => (
            <section key={n} aria-label={`Part ${n + 1} of ${total}`} className="overflow-hidden rounded-3xl shadow-lift ring-1 ring-line">
              <SlideView p={policy} s={s} />
            </section>
          ))}
        </div>
      ) : (
        <div
          ref={frame}
          aria-roledescription="slide deck"
          className="relative flex flex-col overflow-hidden rounded-3xl bg-panel shadow-lift ring-1 ring-line [&:fullscreen]:rounded-none [&:fullscreen]:bg-nil"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
        >
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-black/5">
            <div className="h-full transition-[width] duration-500" style={{ ...progress, boxShadow: `0 0 12px ${policy.accent}` }} />
          </div>
          <div className="relative flex-1 overflow-hidden" data-noreveal aria-live="polite">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.section
                key={i}
                custom={dir}
                aria-label={`Slide ${i + 1} of ${total}`}
                variants={{
                  enter: (d: number) => ({ x: d * 60, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -60, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
                className="h-full"
              >
                <SlideView p={policy} s={policy.slides[i]} />
              </motion.section>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line bg-panel px-4 py-3">
            <button type="button" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous slide" className={btn}>
              <IconArrowRight size={18} className="rotate-180" />
            </button>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Slides">
              {policy.slides.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  role="tab"
                  aria-selected={n === i}
                  aria-label={`Go to slide ${n + 1}`}
                  onClick={() => go(n)}
                  className="h-2.5 rounded-full transition-all duration-300"
                  style={{ width: n === i ? 28 : 10, backgroundColor: n === i ? policy.accent : "#D4D4D8" }}
                />
              ))}
              <span className="tabular ml-2 text-[12.5px] text-stone-500">
                {i + 1} / {total}
              </span>
            </div>
            <button type="button" onClick={() => go(i + 1)} disabled={i === total - 1} aria-label="Next slide" className={btn}>
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      <p className="text-[12.5px] text-stone-500">
        Tip: use ← → keys or swipe. This policy is a <strong className="font-semibold text-stone-700">{policy.status.toLowerCase()}</strong> pending
        HR and legal review; company-specific numbers may change before it is published.
      </p>

      {children}

      {(prev || next) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/policies/${prev.slug}`} className="glow-card rounded-2xl border border-line bg-panel p-4">
              <span className="text-[12px] text-stone-500">← Previous policy</span>
              <span className="mt-1 block font-semibold text-ink">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/policies/${next.slug}`} className="glow-card rounded-2xl border border-line bg-panel p-4 text-right">
              <span className="text-[12px] text-stone-500">Next policy →</span>
              <span className="mt-1 block font-semibold text-ink">{next.title}</span>
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
