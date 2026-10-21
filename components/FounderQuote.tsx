import Link from "next/link";
import { FOUNDER } from "@/lib/vision";
import { IconArrowRight } from "./icons";

/** Home strip: the founder's portrait and quote, leading to the Founder's Vision page. */
export default function FounderQuote() {
  return (
    <section aria-labelledby="founder-h">
      <Link href="/vision" className="glow-card group relative grid overflow-hidden rounded-3xl bg-gold text-nil md:grid-cols-[1fr_280px]">
        <div className="relative p-7 sm:p-10">
          <span aria-hidden className="absolute left-5 top-1 font-display text-[110px] leading-none text-nil/10">“</span>
          <p id="founder-h" className="relative text-[12px] font-bold uppercase tracking-wider">From our founder</p>
          <p className="relative mt-3 max-w-2xl font-display text-[26px] font-semibold leading-snug sm:text-[34px]">{FOUNDER.quote}</p>
          <p className="relative mt-2 text-[14px] font-medium">
            {FOUNDER.name} · {FOUNDER.title}
          </p>
          <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-nil px-5 py-2.5 text-[13.5px] font-bold text-white transition-colors group-hover:bg-ink">
            What DEJOIY means & our values <IconArrowRight size={15} />
          </span>
        </div>
        <div className="relative hidden items-end justify-center md:flex">
          <span aria-hidden className="absolute bottom-0 h-56 w-56 rounded-full bg-white/40 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element -- local transparent portrait */}
          <img
            src={FOUNDER.photo}
            alt={`${FOUNDER.name}, ${FOUNDER.title}`}
            loading="lazy"
            className="relative h-[260px] w-auto object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </Link>
    </section>
  );
}
