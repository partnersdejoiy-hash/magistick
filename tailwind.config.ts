import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F3", // warm paper — page background
        parchment: "#F2EEE2", // deeper warm surface for wells
        ink: "#1B1611", // warm near-black — chrome + text
        inksoft: "#2C251C", // softer ink surfaces
        line: "#E6DFCE", // warm hairline borders
        ember: {
          DEFAULT: "#D9480F", // the one signature accent — used sparingly
          deep: "#B2370A",
          tint: "#FBE7D6",
          ink: "#7C2C07",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        lift: "0 18px 40px -18px rgba(27, 22, 17, 0.28)",
        card: "0 1px 2px rgba(27, 22, 17, 0.05), 0 8px 24px -12px rgba(27, 22, 17, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
