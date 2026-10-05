"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { scrollToY } from "@/lib/lenis";
import { EASE } from "./motion";
import { IconArrowRight } from "./icons";

type Story = {
  kicker: string;
  title: string;
  copy: string;
  cta: { label: string; href: string };
  theme: "ink" | "ember" | "gold";
};

const STORIES: Story[] = [
  {
    kicker: "Featured · Day one",
    title: "Welcome to magistick.",
    copy: "One calm home base for every app, every update, every ticket. Pin your daily drivers, skim the bulletin, and you're set.",
    cta: { label: "Browse your apps", href: "/apps" },
    theme: "ink",
  },
  {
    kicker: "Support",
    title: "Raise a ticket without leaving this tab.",
    copy: "General tickets raise straight into OrbitDesk and the whole thread — statuses, replies, everything — lives right here.",
    cta: { label: "Open Get Help", href: "/help" },
    theme: "ember",
  },
  {
    kicker: "Work",
    title: "Your apps, one calm home.",
    copy: "Twelve tools, zero bookmark folders. Search the directory, pin what you touch daily, and start every morning in one glance.",
    cta: { label: "See all apps", href: "/apps" },
    theme: "gold",
  },
];

/** Art direction per banner — layered radial meshes + film grain, pure CSS/SVG. */
function BannerArt({ theme }: { theme: Story["theme"] }) {
  if (theme === "ink") {
    return (
      <div aria-hidden className="grain absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 top-[-20%] h-[130%] w-[60%] opacity-70 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(217,72,15,0.5), transparent)" }}
        />
        <div
          className="absolute -right-24 bottom-[-30%] h-[110%] w-[55%] opacity-50 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(214,164,60,0.4), transparent)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(250,248,243,0.14) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
      </div>
    );
  }
  if (theme === "ember") {
    return (
      <div aria-hidden className="grain absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 10%, #E8621F 0%, #C7430D 38%, #7C2C07 100%)",
          }}
        />
        <div
          className="absolute -right-28 top-[-25%] h-[120%] w-[55%] opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(255,196,120,0.55), transparent)" }}
        />
        <div
          className="absolute -left-24 bottom-[-30%] h-[100%] w-[50%] opacity-50 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(124,44,7,0.8), transparent)" }}
        />
      </div>
    );
  }
  return (
    <div aria-hidden className="grain absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 85% at 85% 15%, #F6E7C6 0%, #F2EEE2 45%, #E9DFC6 100%)",
        }}
      />
      <div
        className="absolute -left-28 top-[-20%] h-[110%] w-[55%] opacity-70 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(214,164,60,0.5), transparent)" }}
      />
      <div
        className="absolute -right-20 bottom-[-25%] h-[95%] w-[50%] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(217,72,15,0.28), transparent)" }}
      />
    </div>
  );
}

function Panel({
  story,
  index,
  total,
  progress,
}: {
  story: Story;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  // Local 0→1 as this panel travels through the viewport — drives parallax + reveal.
  const local = useTransform(progress, [index / total, (index + 1) / total], [0, 1]);
  const glowX = useTransform(local, [0, 1], ["10%", "-10%"]);
  const contentOpacity = useTransform(local, [0.08, 0.4], [0, 1]);
  const contentY = useTransform(local, [0.08, 0.4], [46, 0]);
  const contentScale = useTransform(local, [0.08, 0.4], [0.985, 1]);

  const dark = story.theme !== "gold";

  return (
    <div className={`relative h-full w-full shrink-0 overflow-hidden ${story.theme === "ink" ? "bg-ink" : ""}`}>
      <motion.div aria-hidden className="absolute inset-[-6%]" style={{ x: glowX }}>
        <BannerArt theme={story.theme} />
      </motion.div>
      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col justify-center px-5 sm:px-8">
        <motion.div style={{ opacity: contentOpacity, y: contentY, scale: contentScale }}>
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${
              dark ? "text-paper/70" : "text-ember-ink/70"
            }`}
          >
            <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${dark ? "bg-ember" : "bg-ember"}`} aria-hidden />
            {story.kicker}
          </p>
          <h2
            className={`mt-5 max-w-2xl font-display text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[58px] ${
              dark ? "text-paper" : "text-ink"
            }`}
          >
            {story.title}
          </h2>
          <p
            className={`mt-5 max-w-xl text-[15.5px] leading-relaxed sm:text-[17px] ${
              dark ? "text-paper/75" : "text-ink/70"
            }`}
          >
            {story.copy}
          </p>
          <Link
            href={story.cta.href}
            className={`group mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 ${
              dark
                ? "bg-paper text-ink hover:bg-ember hover:text-paper"
                : "bg-ink text-paper hover:bg-ember"
            }`}
          >
            {story.cta.label}
            <IconArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
        <p
          className={`absolute bottom-8 font-display text-[13px] italic tabular-nums ${
            dark ? "text-paper/50" : "text-ink/40"
          }`}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}

/**
 * Featured stories as a pinned horizontal journey — vertical scroll drives
 * the banners sideways, each with inner parallax and a scroll-linked reveal.
 * Dots jump between stories. Under reduced motion: a calm vertical stack.
 */
export default function StoryJourney() {
  const reduce = useReducedMotion();
  const targetRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const total = STORIES.length;

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${-((total - 1) / total) * 100}%`],
  );

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(total - 1, Math.round(v * (total - 1))));
  });

  const jumpTo = (i: number) => {
    const el = targetRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const distance = el.offsetHeight - window.innerHeight;
    scrollToY(top + (distance * i) / (total - 1));
  };

  if (reduce) {
    // Calm fallback: stacked banners, no pin, no scroll-jacking.
    return (
      <section aria-label="Featured stories" className="space-y-5">
        {STORIES.map((story) => (
          <div
            key={story.title}
            className={`relative overflow-hidden rounded-3xl ${story.theme === "ink" ? "bg-ink" : ""}`}
          >
            <div className="absolute inset-0">
              <BannerArt theme={story.theme} />
            </div>
            <div className="relative px-7 py-12 sm:px-10">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${story.theme === "gold" ? "text-ember-ink/70" : "text-paper/70"}`}>
                {story.kicker}
              </p>
              <h2 className={`mt-4 font-display text-3xl font-semibold tracking-tight ${story.theme === "gold" ? "text-ink" : "text-paper"}`}>
                {story.title}
              </h2>
              <p className={`mt-3 max-w-xl text-[15px] leading-relaxed ${story.theme === "gold" ? "text-ink/70" : "text-paper/75"}`}>
                {story.copy}
              </p>
              <Link
                href={story.cta.href}
                className={`mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${
                  story.theme === "gold" ? "bg-ink text-paper" : "bg-paper text-ink"
                }`}
              >
                {story.cta.label}
                <IconArrowRight size={15} />
              </Link>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={targetRef}
      aria-label="Featured stories"
      className="relative -mx-5 sm:-mx-8"
      style={{ height: `${total * 110}vh` }}
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        <motion.div style={{ x }} className="flex h-full">
          {STORIES.map((story, i) => (
            <Panel key={story.title} story={story} index={i} total={total} progress={scrollYProgress} />
          ))}
        </motion.div>

        {/* progress dots */}
        <div className="absolute bottom-8 right-6 z-10 flex flex-col items-center gap-2.5 sm:right-10">
          {STORIES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`Go to story ${i + 1}: ${s.title}`}
              className="group flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active
                    ? "h-6 w-[3px] bg-ember"
                    : "h-[3px] w-[3px] bg-ink/25 group-hover:bg-ink/50"
                }`}
              />
            </button>
          ))}
        </div>

        <p className="absolute left-6 top-8 z-10 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink/40 sm:left-10">
          Featured · scroll
        </p>
      </div>
    </section>
  );
}
