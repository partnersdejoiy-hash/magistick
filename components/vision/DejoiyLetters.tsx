"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { photoUrl } from "@/lib/photos";
import { LETTERS } from "@/lib/vision";
import { APP_ICONS } from "../icons";

const EVERY_MS = 5000;

/**
 * D-E-J-O-I-Y as six big letter tabs; each opens its core value with a photo.
 * Cycles on its own until someone interacts (or hovers), never under reduced motion.
 */
export default function DejoiyLetters() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (reduce || touched || hover) return;
    const t = setTimeout(() => setI((x) => (x + 1) % LETTERS.length), EVERY_MS);
    return () => clearTimeout(t);
  }, [i, reduce, touched, hover]);

  const pick = (n: number, focus = false) => {
    setTouched(true);
    setI(n);
    if (focus) tabs.current[n]?.focus();
  };

  const v = LETTERS[i];
  const Icon = APP_ICONS[v.icon];

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} data-noreveal>
      <div
        role="tablist"
        aria-label="DEJOIY core values"
        className="grid grid-cols-6 gap-2 sm:gap-4"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") pick((i + 1) % LETTERS.length, true);
          else if (e.key === "ArrowLeft") pick((i - 1 + LETTERS.length) % LETTERS.length, true);
          else if (e.key === "Home") pick(0, true);
          else if (e.key === "End") pick(LETTERS.length - 1, true);
          else return;
          e.preventDefault();
        }}
      >
        {LETTERS.map((l, n) => {
          const on = n === i;
          return (
            <button
              key={l.letter}
              ref={(el) => {
                tabs.current[n] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${l.letter}`}
              aria-selected={on}
              aria-controls="dejoiy-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => pick(n)}
              className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl bg-panel ring-1 ring-line transition-shadow hover:ring-gold sm:rounded-3xl"
            >
              {on && (
                <motion.span
                  layoutId="letter-bg"
                  className="absolute inset-0"
                  style={{ backgroundColor: l.color, boxShadow: `0 16px 40px -12px ${l.color}` }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span
                className={`relative font-display text-[34px] font-semibold leading-none transition-transform duration-300 group-hover:scale-110 sm:text-[72px] ${on ? "text-white" : "text-ink"}`}
              >
                {l.letter}
              </span>
              <span className={`relative mt-1 hidden text-[12px] font-semibold sm:block ${on ? "text-white/90" : "text-stone-500"}`}>{l.title}</span>
              {on && !touched && !reduce && !hover && (
                <motion.span
                  key={`bar-${i}`}
                  aria-hidden
                  className="absolute bottom-0 left-0 h-1 bg-white/70"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: EVERY_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div id="dejoiy-panel" role="tabpanel" aria-labelledby={`tab-${v.letter}`} className="mt-5">
        <AnimatePresence mode="wait">
          <motion.article
            key={v.letter}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid overflow-hidden rounded-3xl bg-panel ring-1 ring-line md:grid-cols-[1fr_1.15fr]"
          >
            <div className="relative min-h-[240px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
              <img src={photoUrl(v.photo, 900)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${v.color}E6 0%, ${v.color}66 45%, transparent 80%)` }} />
              <span aria-hidden className="absolute -left-3 -top-10 font-display text-[220px] font-semibold leading-none text-white/25">
                {v.letter}
              </span>
              <span className="absolute bottom-5 left-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-nil shadow-lg">
                <Icon size={24} />
              </span>
            </div>
            <div className="p-6 sm:p-9">
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: v.color }}>
                {v.letter} is for
              </p>
              <h3 className="mt-1 font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">{v.title}</h3>
              <p className="text-[14px] italic text-stone-500">{v.hindi}</p>
              <p className="mt-4 text-[16px] leading-relaxed text-ink">{v.meaning}</p>
              <p className="mt-5 text-[11.5px] font-bold uppercase tracking-wider text-stone-500">On the floor, this looks like</p>
              <ul className="mt-2 space-y-2">
                {v.looksLike.map((l) => (
                  <li key={l} className="flex items-center gap-2.5 text-[14.5px] text-stone-700">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: v.color }} />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
