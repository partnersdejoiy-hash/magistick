"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import AmbientField from "./AmbientField";
import { EASE, Magnetic, MaskedWords } from "./motion";
import { IconArrowRight } from "./icons";

/** Three.js dust field — lazy, client-only, skipped under reduced motion. */
const MagicParticles = dynamic(() => import("./MagicParticles"), { ssr: false });

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayLine(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Editorial hero — ambient field, masked word-by-word headline, calm CTAs. */
export default function Hero() {
  return (
    <section className="relative -mx-5 overflow-hidden px-5 pb-14 pt-8 sm:-mx-8 sm:px-8">
      <AmbientField />
      <MagicParticles />
      <div className="relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden />
          DEJOIY BPO · Employee portal
        </motion.p>
        <h1 className="mt-5 max-w-3xl font-display text-[44px] font-semibold leading-[1.04] tracking-tight text-ink sm:text-[64px]">
          <MaskedWords text={`${greeting()}, Deepak.`} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
          className="mt-5 max-w-xl text-[16px] leading-relaxed text-stone-600"
        >
          {todayLine()} — every app, every update, every ticket, in one calm home base.
          Nothing to hunt for, nothing in another tab.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.58, ease: EASE }}
          className="mt-8 flex flex-wrap items-center gap-5"
        >
          <Magnetic>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-ember hover:text-ink"
              >
                Browse your apps
                <IconArrowRight size={15} />
              </Link>
            </motion.div>
          </Magnetic>
          <Link
            href="/help"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink"
          >
            <span className="border-b border-ink/25 pb-0.5 transition-colors group-hover:border-ember group-hover:text-magenta">
              Get help
            </span>
            <IconArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:text-magenta" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
