"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FOUNDER } from "@/lib/vision";
import { IconArrowRight } from "../icons";

/** Types the quote out once; shows it whole under reduced motion. */
function useTyped(text: string, start: boolean, reduce: boolean | null) {
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return setN(text.length);
    if (!start) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(t);
    }, 38);
    return () => clearInterval(t);
  }, [text, start, reduce]);
  return text.slice(0, n);
}

const SPARKS = [
  { x: "6%", y: "18%", s: 22, d: 0 },
  { x: "88%", y: "10%", s: 28, d: 0.6 },
  { x: "92%", y: "62%", s: 16, d: 1.2 },
  { x: "2%", y: "70%", s: 14, d: 1.8 },
];

/** Founder hero: portrait with a rotating gold halo that follows the pointer, and her quote typed out. */
export default function FounderHero() {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotY = useTransform(sx, [-1, 1], [-8, 8]);
  const rotX = useTransform(sy, [-1, 1], [6, -6]);
  const haloX = useTransform(sx, [-1, 1], [-18, 18]);
  const haloY = useTransform(sy, [-1, 1], [-14, 14]);
  const [typing, setTyping] = useState(false);
  const typed = useTyped(`“${FOUNDER.quote}”`, typing, reduce);

  useEffect(() => {
    const t = setTimeout(() => setTyping(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      aria-labelledby="vision-h"
      className="stars relative isolate overflow-hidden rounded-3xl bg-nil text-white shadow-lift"
      onPointerMove={(e) => {
        if (reduce || !box.current) return;
        const r = box.current.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <span aria-hidden className="animate-drift-a absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <span aria-hidden className="animate-drift-b absolute -bottom-40 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-magenta/20 blur-3xl" />

      <div className="grid items-center gap-6 px-7 pt-12 sm:px-12 md:grid-cols-[1.1fr_1fr] md:pb-0 md:pt-0">
        <div className="md:py-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-fit rounded-full bg-gold px-3 py-1 text-[12.5px] font-bold text-nil"
          >
            From our founder
          </motion.p>
          <motion.h1
            id="vision-h"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-[38px] font-semibold leading-[1.05] sm:text-[54px]"
          >
            A BPO people are <span className="text-gold">proud</span> to work at.
          </motion.h1>
          <p className="mt-6 min-h-[3.5em] max-w-xl font-display text-[21px] italic leading-snug text-white/90 sm:text-[24px]">
            <span className="sr-only">“{FOUNDER.quote}”</span>
            <span aria-hidden>
              {typed}
              {!reduce && typed.length < FOUNDER.quote.length + 2 && <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-gold align-middle">&nbsp;</span>}
            </span>
          </p>
          <p className="mt-3 text-[14px] text-white/70">
            <span className="font-semibold text-white">{FOUNDER.name}</span> · {FOUNDER.title}, {FOUNDER.org}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#address" className="btn-magic inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-nil hover:bg-gold">
              Read her address <IconArrowRight size={16} />
            </a>
            <a href="#dejoiy" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white ring-1 ring-white/30 hover:ring-gold">
              What DEJOIY means
            </a>
          </div>
        </div>

        <div ref={box} className="relative mx-auto h-[420px] w-full max-w-[400px] [perspective:1000px] sm:h-[500px]">
          {/* Rotating gold halo, drifting with the pointer. */}
          <div aria-hidden className="absolute left-1/2 top-[44%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 sm:h-[380px] sm:w-[380px]">
            <motion.div style={{ x: haloX, y: haloY }} className="absolute inset-0">
              <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#FFC400,transparent_30%,#E91E63_55%,transparent_75%,#FFC400)] opacity-70 blur-md motion-reduce:animate-none" />
              <div className="absolute inset-3 rounded-full bg-nil" />
              <div className="absolute inset-3 rounded-full bg-gradient-to-b from-gold/25 to-transparent" />
            </motion.div>
          </div>

          {SPARKS.map((s, k) => (
            <motion.svg
              key={s.x}
              aria-hidden
              viewBox="0 0 16 16"
              width={s.s}
              height={s.s}
              className="absolute"
              style={{ left: s.x, top: s.y }}
              animate={reduce ? undefined : { scale: [1, 1.4, 1], rotate: [0, 45, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, delay: s.d, repeat: Infinity, ease: "easeInOut" }}
            >
              <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill={k % 2 === 0 ? "#FFC400" : "#fff"} />
            </motion.svg>
          ))}

          {/* The portrait: transparent PNG, tilts gently in 3D. */}
          <motion.div
            style={{ rotateX: rotX, rotateY: rotY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 bottom-0 flex justify-center [transform-style:preserve-3d]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local transparent portrait */}
            <img
              src={FOUNDER.photo}
              alt={`${FOUNDER.name}, ${FOUNDER.title} of DEJOIY`}
              className="h-[400px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] sm:h-[480px]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute bottom-8 right-0 rounded-2xl bg-white/95 px-4 py-2.5 text-nil shadow-xl sm:-right-4"
          >
            <p className="font-display text-[16px] font-semibold leading-tight">{FOUNDER.name}</p>
            <p className="text-[11.5px] font-medium text-stone-600">{FOUNDER.title}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
