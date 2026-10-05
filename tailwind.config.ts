import type { Config } from "tailwindcss";

/**
 * Glowstick-matched palette (sampled from glowstick.taskus.com, 2026-10-05):
 * - paper: light cool gray page background
 * - ink: near-black charcoal for header/footer/dark surfaces
 * - ember: repurposed as Glowstick's signature golden yellow (CTAs, highlights)
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
          DEFAULT: "#FFC400", // Glowstick golden yellow — the signature accent
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
