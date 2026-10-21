import type { Config } from "tailwindcss";

/**
 * magistick — Glowstick palette with a magic glow.
 * Charcoal shell, light-gray ground, white work panels, Glowstick yellow
 * for glows and small marks, brass for primary actions. Department dyes
 * live in lib/rbac.ts and mean that department everywhere, nothing else.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Glowstick palette: charcoal chrome, light-gray ground, signature yellow glow.
        nil: { DEFAULT: "#262626", 2: "#333333", 3: "#404040", 4: "#525252" }, // charcoal shell
        ground: "#F5F6F7", // light gray page ground
        panel: "#FFFFFF",
        paper: "#F5F6F7",
        parchment: "#EBECED", // wells, table heads
        ink: "#262626",
        inksoft: "#333333",
        line: "#E1E2E4",
        ember: { DEFAULT: "#B45309", deep: "#92400E", tint: "#FAF0DC", ink: "#7C4A03" }, // brass: primary action
        gold: { DEFAULT: "#FFC400", deep: "#EAB308", tint: "#FFF4CC", ink: "#6B4E00" }, // Glowstick yellow: glow + small marks
        magenta: { DEFAULT: "#E91E63", deep: "#C2185B", tint: "#FCE3EE" }, // active nav
        ok: { DEFAULT: "#2F6B3B", tint: "#E3F0E5" },
        warn: { DEFAULT: "#8A5A12", tint: "#FFF4CC" },
        bad: { DEFAULT: "#B3261E", tint: "#F8E3E1" },
        brandblue: "#1A73E8", // links / article titles
        // Neutral greys to match the charcoal shell.
        stone: {
          50: "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#71717A",
          500: "#5C5C66",
          600: "#46464F",
          700: "#36363D",
          800: "#26262B",
          900: "#18181B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(38, 38, 38, 0.06), 0 2px 8px -2px rgba(38, 38, 38, 0.06)",
        lift: "0 12px 32px -12px rgba(38, 38, 38, 0.28)",
      },
      borderRadius: {
        "3xl": "1rem",
        "2xl": "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
