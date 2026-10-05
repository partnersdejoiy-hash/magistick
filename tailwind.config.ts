import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d12", // dark chrome: header + footer only
        panel: "#12151d", // dark chrome surfaces
        line: "#232838", // dark chrome borders
        canvas: "#f4f6fb", // light page background (Glowstick-like body)
        brand: { 50: "#f5f0ff", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed" },
        accent: "#f43f5e",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
