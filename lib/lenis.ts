import type Lenis from "lenis";

/** Shared Lenis instance — SmoothScroll owns it, anyone may scroll through it. */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function scrollToY(y: number, immediate = false) {
  if (lenis) {
    lenis.scrollTo(y, { duration: immediate ? 0 : 1.4 });
  } else if (typeof window !== "undefined") {
    window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  }
}
