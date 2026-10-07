"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin ember scroll-progress cue pinned under the header. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gold"
      style={{ scaleX }}
    />
  );
}
