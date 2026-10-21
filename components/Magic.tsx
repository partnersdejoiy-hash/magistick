"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * The "magic" layer, mounted once in the layout:
 * - a glowstick scroll bar that fills as you scroll,
 * - scroll reveals for page content (no per-page wiring),
 * - a cursor spotlight on .glow-card surfaces,
 * - a faint sparkle trail behind the pointer.
 * Everything is skipped under prefers-reduced-motion.
 */

// What fades up into view on every page.
const REVEAL = "main h1, main h2, main section, main aside, main article, main form, main ul > li, main table";

export default function Magic() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  // Scroll reveals: tag content, show it when it enters the viewport.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -6% 0px" },
    );
    const tag = () =>
      document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
        // data-noreveal: parts that animate themselves (e.g. carousel slides).
        if (el.dataset.reveal || el.closest("[data-noreveal]")) return;
        el.dataset.reveal = "1";
        // Siblings cascade in, capped so long lists don't drag.
        const i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.setProperty("--d", `${Math.min(i, 8) * 55}ms`);
        io.observe(el);
      });
    tag();
    // Lists arrive after their fetch, so keep tagging as the page fills in.
    const mo = new MutationObserver(tag);
    const main = document.getElementById("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // Cursor spotlight + sparkle trail (mouse/trackpad only).
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = 0;
    let lx = 0;
    let ly = 0;
    const onMove = (e: PointerEvent) => {
      const card = e.target instanceof Element ? e.target.closest<HTMLElement>(".glow-card") : null;
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      const now = performance.now();
      if (now - last < 45 || Math.hypot(e.clientX - lx, e.clientY - ly) < 18) return;
      last = now;
      lx = e.clientX;
      ly = e.clientY;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      s.style.setProperty("--s", (0.5 + Math.random() * 0.7).toFixed(2));
      s.style.setProperty("--dx", `${(Math.random() - 0.5) * 24}px`);
      s.addEventListener("animationend", () => s.remove(), { once: true });
      document.body.appendChild(s);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <motion.div
      aria-hidden
      className="glowstick pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{ scaleX }}
    />
  );
}
