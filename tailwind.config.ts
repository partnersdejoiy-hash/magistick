import type { Config } from "tailwindcss";

/**
 * magistick — block-print world (Jaipur / Bagru hand-block textiles).
 * Indigo shell, indigo-tinted ground, white work panels. Department dyes
 * live in lib/rbac.ts and mean that department everywhere, nothing else.
 *
 * Legacy token names (paper, ember, gold, magenta, stone…) are remapped onto
 * this palette so every surface speaks the same world.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nil: { DEFAULT: "#1B2250", 2: "#252E66", 3: "#323C7A", 4: "#4A5494" }, // indigo shell
        ground: "#F1F2F7", // indigo-tinted page ground
        panel: "#FFFFFF",
        paper: "#F1F2F7",
        parchment: "#E7E9F2", // wells, table heads
        ink: "#161A33",
        inksoft: "#252E66",
        line: "#DDE0EB",
        ember: { DEFAULT: "#2B3A8C", deep: "#1B2250", tint: "#E6E8F5", ink: "#1F2A6B" }, // primary action = indigo
        gold: { DEFAULT: "#E0A526", deep: "#B7791F", tint: "#FBF0D6", ink: "#6B4A0C" }, // haldi
        magenta: { DEFAULT: "#B3261E", deep: "#8C1D17", tint: "#F8E3E1" }, // madder
        ok: { DEFAULT: "#2F6B3B", tint: "#E3F0E5" }, // dhaavda green
        warn: { DEFAULT: "#8A5A12", tint: "#FBF0D6" },
        bad: { DEFAULT: "#B3261E", tint: "#F8E3E1" },
        brandblue: "#2B3A8C",
        // Cool, indigo-leaning greys (replaces warm stone everywhere).
        stone: {
          50: "#F6F7FA",
          100: "#EEF0F5",
          200: "#DDE0EB",
          300: "#C3C7D8",
          400: "#6F7494",
          500: "#575C7C",
          600: "#454A69",
          700: "#363A56",
          800: "#252940",
          900: "#161A33",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(22, 26, 51, 0.06), 0 2px 8px -2px rgba(22, 26, 51, 0.06)",
        lift: "0 12px 32px -12px rgba(22, 26, 51, 0.28)",
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
