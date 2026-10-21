import Link from "next/link";
import { photoUrl } from "@/lib/photos";
import { VISION } from "@/lib/vision";
import { IconArrowRight } from "./icons";

/** Home strip that leads to the Founders' Vision page. */
export default function FounderQuote() {
  return (
    <section aria-labelledby="founder-h">
      <Link href="/vision" className="glow-card group relative grid overflow-hidden rounded-3xl bg-gold text-nil md:grid-cols-[1fr_300px]">
        <div className="relative p-7 sm:p-10">
          <span aria-hidden className="absolute left-5 top-1 font-display text-[110px] leading-none text-nil/10">“</span>
          <p id="founder-h" className="relative text-[12px] font-bold uppercase tracking-wider">From our founders</p>
          <p className="relative mt-3 max-w-2xl font-display text-[24px] font-semibold leading-snug sm:text-[30px]">{VISION}</p>
          <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-nil px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors group-hover:bg-ink">
            Read the founders&apos; vision & our values <IconArrowRight size={15} />
          </span>
        </div>
        <div className="relative hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN photo, sized via URL */}
          <img src={photoUrl("teamwork", 700)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gold to-transparent" />
        </div>
      </Link>
    </section>
  );
}
