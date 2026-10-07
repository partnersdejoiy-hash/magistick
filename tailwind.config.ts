import type { Config } from "tailwindcss";

/**
 * Glowstick-inspired palette, refined (2026-10-07):
 * - paper: light cool gray page background
 * - ink: near-black charcoal for header/footer/dark surfaces
 * - ember: refined brass/amber — the primary warm accent (buttons, hovers,
 *   focus rings, badges). Deep enough to stay classy on light gray.
 * - gold: Glowstick's signature yellow, used SPARINGLY — logo mark, tiny
 *   dots, hairline accents only. Never large surfaces.
 * - magenta: active-nav pink/red accent
 * - brandblue: link/article-title blue
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F6F7", // light gray — page background
        parchment: "#EBECED", // deeper gray surface for wells
        ink: "#262626", // near-black charcoal — chrome + text
        inksoft: "#333333", // softer ink surfaces
        line: "#E1E2E4", // cool hairline borders
        ember: {
          DEFAULT: "#B45309", // refined brass — primary warm accent
          deep: "#92400E",
          tint: "#FAF0DC",
          ink: "#7C4A03",
        },
        gold: {
          DEFAULT: "#FFC400", // Glowstick signature yellow — tiny accents only
          deep: "#EAB308",
          tint: "#FFF4CC",
          ink: "#6B4E00",
        },
        magenta: {
          DEFAULT: "#E91E63", // active-nav pink/red
          deep: "#C2185B",
          tint: "#FCE3EE",
        },
        brandblue: "#1A73E8", // link / article-title blue
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 40px -18px rgba(38, 38, 38, 0.28)",
        card: "0 1px 2px rgba(38, 38, 38, 0.05), 0 8px 24px -12px rgba(38, 38, 38, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
