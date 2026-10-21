"use client";

import { motion } from "framer-motion";
import { APP_ICONS } from "./icons";

/**
 * Canva-style slide art for the featured carousel: each category gets its own
 * gradient and accent, and a layered composition (tilted cards, sticker, dots,
 * squiggle, sparkles) that gently floats. Pure CSS/SVG, no image assets.
 */

type Theme = { bg: string; a: string; b: string; icon: keyof typeof APP_ICONS };

const THEMES: Record<string, Theme> = {
  Announcements: { bg: "bg-gradient-to-br from-[#2A0F4C] via-[#5B1A7A] to-[#E91E63]", a: "#FFC400", b: "#FF7AB6", icon: "chat" },
  Support: { bg: "bg-gradient-to-br from-[#062A3A] via-[#0B5563] to-[#14B8A6]", a: "#FFC400", b: "#5EEAD4", icon: "ticket" },
  Workforce: { bg: "bg-gradient-to-br from-[#2B1400] via-[#9A3412] to-[#F59E0B]", a: "#FFF1C2", b: "#FDBA74", icon: "clock" },
  IT: { bg: "bg-gradient-to-br from-[#0B1E4A] via-[#1D4ED8] to-[#38BDF8]", a: "#FFC400", b: "#93C5FD", icon: "wrench" },
  Culture: { bg: "bg-gradient-to-br from-[#3A0A1E] via-[#BE123C] to-[#FB7185]", a: "#FFC400", b: "#FDA4AF", icon: "award" },
};
const FALLBACK: Theme = { bg: "bg-gradient-to-br from-[#1A1A1A] via-[#333333] to-[#6B5300]", a: "#FFC400", b: "#FFD86B", icon: "globe" };

export function themeFor(category: string): Theme {
  const c = category.toLowerCase();
  const key = Object.keys(THEMES).find((k) => c.includes(k.toLowerCase()));
  if (key) return THEMES[key];
  if (/kudos|shine|award|culture|celebrat/.test(c)) return THEMES.Culture;
  if (/it|tech|system/.test(c)) return THEMES.IT;
  return FALLBACK;
}

const float = (delay: number, dy = 8) => ({
  animate: { y: [0, -dy, 0] },
  transition: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" as const },
});

function Sparkle({ x, y, s, color, delay }: { x: string; y: string; s: number; color: string; delay: number }) {
  return (
    <motion.svg
      viewBox="0 0 16 16"
      width={s}
      height={s}
      className="absolute"
      style={{ left: x, top: y }}
      animate={{ scale: [1, 1.35, 1], rotate: [0, 45, 0], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M8 0l1.9 6.1L16 8l-6.1 1.9L8 16l-1.9-6.1L0 8l6.1-1.9z" fill={color} />
    </motion.svg>
  );
}

export default function HeroArt({ category, date }: { category: string; date: string }) {
  const t = themeFor(category);
  const Icon = APP_ICONS[t.icon];
  return (
    <motion.div
      aria-hidden
      className="relative h-[270px] w-full"
      initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Decor: big disc, dashed ring, dot grid, squiggle. */}
      <svg viewBox="0 0 400 270" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="hero-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="#fff" fillOpacity="0.35" />
          </pattern>
        </defs>
        <circle cx="250" cy="138" r="118" fill={t.b} fillOpacity="0.28" />
        <circle cx="250" cy="138" r="134" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 10" />
        <rect x="18" y="16" width="98" height="70" fill="url(#hero-dots)" />
        <path d="M300 236 q16 -22 32 0 t32 0 t32 0" fill="none" stroke={t.a} strokeWidth="6" strokeLinecap="round" />
        <circle cx="78" cy="214" r="16" fill={t.a} />
      </svg>

      {/* Back card in the accent colour. */}
      <motion.div {...float(0.6, 6)} className="absolute right-[12%] top-[14%]">
        <div className="h-44 w-40 rotate-[9deg] rounded-[28px] shadow-2xl" style={{ backgroundColor: t.a }} />
      </motion.div>

      {/* Front card: a little "post" with icon, lines and faces. */}
      <motion.div {...float(0)} className="absolute right-[24%] top-[6%]">
        <div className="w-48 -rotate-6 rounded-[28px] bg-white p-4 text-nil shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${t.b}, #262626)` }}>
            <Icon size={28} />
          </div>
          <div className="mt-4 h-2.5 w-32 rounded-full bg-nil/80" />
          <div className="mt-2 h-2 w-36 rounded-full bg-stone-200" />
          <div className="mt-1.5 h-2 w-24 rounded-full bg-stone-200" />
          <div className="mt-4 flex items-center">
            {["#E91E63", "#14B8A6", "#FFC400"].map((c, i) => (
              <span key={c} className="-ml-1.5 h-6 w-6 rounded-full ring-2 ring-white first:ml-0" style={{ backgroundColor: c, zIndex: 3 - i }} />
            ))}
            <span className="ml-2 text-[11px] font-semibold text-stone-500">+ team</span>
          </div>
        </div>
      </motion.div>

      {/* Stickers. */}
      <motion.div {...float(1.2, 10)} className="absolute bottom-[12%] left-[10%]">
        <span className="inline-flex -rotate-[8deg] items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-nil shadow-xl">
          <span style={{ color: t.b === "#FFD86B" ? "#B45309" : "#E91E63" }}>✦</span> {category}
        </span>
      </motion.div>
      <motion.div {...float(2, 7)} className="absolute bottom-[6%] right-[6%]">
        <span className="inline-block rotate-6 rounded-2xl bg-nil px-3.5 py-2 text-[12px] font-bold text-gold shadow-xl ring-2 ring-white/70">{date}</span>
      </motion.div>

      <Sparkle x="8%" y="44%" s={22} color="#fff" delay={0} />
      <Sparkle x="86%" y="8%" s={26} color={t.a} delay={0.8} />
      <Sparkle x="60%" y="80%" s={16} color="#fff" delay={1.6} />
    </motion.div>
  );
}
