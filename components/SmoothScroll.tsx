"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis";

/**
 * Lenis smooth scrolling — the buttery wheel feel.
 * Skipped entirely under prefers-reduced-motion. Single rAF loop,
 * destroyed on unmount. Works with framer-motion's useScroll (native scroll).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ lerp: 0.11, smoothWheel: true });
    setLenis(instance);
    let raf = 0;
    const loop = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}
